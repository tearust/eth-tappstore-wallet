import {_} from 'tearust_utils';
import utils from '../tea/utils';
import store from '../store';
import {stringToHex, hexToU8a, stringToU8a, numberToHex} from 'tearust_layer1';

import base from './base';
import txn from './txn';
import common from './common';

export const NOT_LOGIN = 'not_login';

const F = {
  getUserId(address){
    return `profile__${address}`;
  },
  current(address){
    const key = F.getUserId(address);
    const user = utils.cache.get(key);
    if(user && user.expird_time && user.expird_time > Date.now()){
      return user;
    }
    utils.cache.remove(key);
    return null;
  },
  extendSession(address, session_key){
    const user = {
      address,
      isLogin: true,
      session_key: session_key,
      expird_time : Date.now() + 1800*1000,
    };

    utils.cache.put(F.getUserId(address), user);

  },
  checkLogin(self){
    const address = self.layer1_account.address;
    // const _axios = base.getAxios();
    const user = F.current(address);
    if(!user || !user.isLogin){
      // try{
      //   self.$notify.error({
      //     title: 'Error',
      //     message: 'Session expired, please login again.'
      //   });
      // }catch(e){}
      
      throw NOT_LOGIN;
    }

    return user.session_key;
  },

  async login(self, permission_str){
    const address = self.layer1_account.address;

    const epoch_closed = utils.mem.get('epoch_closed');
    if(epoch_closed && !self.$root.is_sudo(address)){
      throw 'Current epoch finished, can\'t login.';
    }

    // thanks for https://github.com/polkadot-js/extension/issues/827
    const data = permission_str;
    console.log('permission_str => '+permission_str);
    
    const layer1_instance = self.wf.getLayer1Instance();
    

    let sig = await layer1_instance.signWithExtension(address, data);
    sig = utils.uint8array_to_base64(hexToU8a(sig));

    try{
      const rs = await txn.txn_request('login', {
        tappIdB64: base.getTappId(),
        address,
        data: utils.forge.util.encode64(`<Bytes>${data}</Bytes>`),
        signature: sig,
      });

      if(rs.auth_key){
        const user = {
          address,
          isLogin: true,
          session_key: rs.auth_key,
          expird_time : Date.now() + 1800*1000,
        };

        utils.cache.put(F.getUserId(address), user);
        await store.dispatch('init_user');

        base.top_log(null);

        self.$root.goPath('/account_profile');
        return true;
      }
      
    }catch(e){
      throw e;
    }
  },

  async logout(address=null){
    const _axios = base.getAxios();
    address = address || store.getters.layer1_account.address;
    if(address){
      await _axios.post('/tapp/logout', {
        address,
      });
      utils.cache.remove(F.getUserId(address));
    }
    
    location.reload(true);
    // store.dispatch('init_user');
  },

  async showLoginModal(self, succ_cb=null){
    if(!self.layer1_account || !self.layer1_account.address){
      self.$root.showError("Invalid user, please select.");
      return;
    }

    self.$store.commit('modal/open', {
      key: 'login',
      param: {},
      cb: async (permission_str, close)=>{

        self.$root.loading(true);
        try{
          await F.login(self, permission_str);

          self.$root.success('Login success.');
          if(succ_cb){
            await succ_cb();
          }
        }catch(e){
          self.$root.showError(e);
        }

        close();
        self.$root.loading(false);
        
      }
    })

  },

  async topupFromLayer1(self, succ_cb){
    const layer1_instance = self.wf.getLayer1Instance();
    const api = layer1_instance.getApi();

    const tappId = base.getTappId();

    self.$store.commit('modal/open', {
      key: 'common_form',
      param: {
        title: 'Topup',
        text: 'Move chain wallet (layer1) TEA funds to layer2 TApp Store wallet account',
        props: {
          target: {
            type: "Input",
            disabled: true,
            hidden: true,
            label: "Contract address",
            class: 'hidden',
          },
          amount: {
            type: "number",
            default: 10,
            max: 200000,
            label: "Amount (TEA)"
          }
        },
      },
      cb: async (form, close)=>{
        if(self.layer1_account.balance < form.amount){
          self.$root.showError("Not enough balance to topup.");
          return false;
        }

        self.$root.loading(true);
        const total = utils.layer1.amountToBalance(form.amount);
        const amt = numberToHex(total);

        try{
          const tx = api.tx.teaErc20.topup(form.target, amt);
          await layer1_instance.sendTx(self.layer1_account.address, tx);
        }catch(e){
          self.$root.showError(e);
          close();
          self.$root.loading(false);
          return;
        }
        
        close();

        await succ_cb()
        self.$root.loading(false);
      },
      open_cb: async (opts)=>{
        const rs = await common.queryTappStoreAccount();
        
        if(rs.address){
          const top_acct = rs.address;
          opts.props.target.default = top_acct;
          // opts.text = `Contract address: ${top_acct}`;
        }

        // TODO handle error.
        
      }
    });
  },

  async withdrawFromLayer2(self, amt, succ_cb){
    const session_key = F.checkLogin(self);

    const tappId = base.getTappId();
    self.$store.commit('modal/open', {
      key: 'common_form',
      param: {
        title: 'Withdraw',
        text: `Move TEA funds back to chain wallet (layer1)<br/>${utils.consts.gas_tip()}`,
        props: {
          amount: {
            type: 'number',
            default: amt,
            label: 'Amount (TEA)'
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);
        const amount = utils.layer1.amountToBalance(form.amount);
        
        const param = {
          address: self.layer1_account.address,
          tappIdB64: tappId,
          authB64: session_key,
          amount,
        };

        try{
          await txn.txn_request('withdraw', param);
          self.$root.success();
          succ_cb();
        }catch(e){

          self.$root.showError(e);
        }
        close();
        self.$root.loading(false);
        
      }
    });
  },

  async transferTea(self, param={}, succ_cb){
    const session_key = F.checkLogin(self);

    const tappId = base.getTappId();
    self.$store.commit('modal/open', {
      key: 'common_form',
      param: {
        title: 'Transfer TEA',
        text: `Transfer TEA to another user using your TApp store wallet (layer2). ${utils.consts.gas_tip()}`,
        props: {
          target: {
            type: 'Input',
            label: 'Target address',
            required: true,
          },
          amount: {
            type: 'number',
            default: 0,
            label: 'Amount'
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);
        const amount = utils.layer1.amountToBalance(form.amount);
        
        const param = {
          address: self.layer1_account.address,
          tappIdB64: tappId,
          authB64: session_key,
          amount,
          to: form.target,
        };

        try{
          await txn.txn_request('transferTea', param);
          self.$root.success();
          succ_cb();
        }catch(e){

          self.$root.showError(e);
        }
        close();
        self.$root.loading(false);
        
      }
    });
  },

  async query_balance(self, target=null, target_tapp=null,){
    const session_key = F.checkLogin(self);

    const opts = {
      address: self.layer1_account.address,
      tappIdB64: base.getTappId(),
      authB64: session_key,
    };
    if(target){
      opts.target = target;
      opts.targetTappIdB64 = target_tapp;
    }

    try{
      const rs = await txn.query_request('query_balance', opts);
      if(!rs.balance) {
        rs.balance = 0;
      }

      return rs ? utils.layer1.balanceToAmount(rs.balance) : null;
    }catch(e){
      self.$root.showError(e);

      return 0;
    }
    
  },
  async query_deposit(self){
    const session_key = F.checkLogin(self);

    const opts = {
      address: self.layer1_account.address,
      tappIdB64: base.getTappId(),
      authB64: session_key,
    };

    const rs = await txn.query_request('query_deposit', opts);
    if(!rs.balance) {
      rs.balance = 0;
    }

    return rs ? utils.layer1.balanceToAmount(rs.balance) : null;
  },

  async query_asset(self, target=null){
    const session_key = F.checkLogin(self);

    const opts = {
      address: self.layer1_account.address,
      tappIdB64: base.getTappId(),
      authB64: session_key,
    };
    if(target){
      opts.target = target;
    }

    const rs = await txn.query_request('query_asset', opts);
    
    const json = {
      tea_balance: utils.layer1.balanceToAmount(rs.tea_balance),
      token_balance: utils.layer1.balanceToAmount(rs.token_balance),
      reserved_token_balance: utils.layer1.balanceToAmount(rs.reserved_token_balance),
    };
    console.log('user asset => ', json);
    return json;
  },

  

  

};

export default F;