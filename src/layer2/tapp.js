import {_} from 'tearust_utils';
import utils from '../tea/utils';
import store from '../store';
import {stringToHex, hexToU8a, stringToU8a} from '@polkadot/util';

import base from './base';
import txn from './txn';
import entity from './entity';
import user from './user';
import mem from './mem';
import helper from '../views/helper';

const F = {
  async createNew(self, succ_cb){
    return await entity.createEntity(self, succ_cb, 'tapp', {});
  },
  async hostTApp(self, data, succ_cb){
    const session_key = user.checkLogin(self);
    const layer1_instance = self.wf.getLayer1Instance();

    self.$store.commit('modal/open', {
      key: 'host_tapp',
      param: {
        ...data,
        authB64: session_key,
        
      },
      cb: async ()=>{
        await succ_cb();
      }
    });
  },
  async unhostTApp(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$root.loading(true);

    const layer1_instance = self.wf.getLayer1Instance();
    try{
      let sig = await layer1_instance.signWithExtension(self.layer1_account.address, 'test');
      sig = utils.uint8array_to_base64(hexToU8a(sig));
      const opts = {
        tappIdB64: base.getTappId(),
        address: self.layer1_account.address,

        targetTappIdB64: data.tapp_id,
        cmlId: _.toNumber(data.cml_id),
        signature: sig,
        authB64: session_key,
      };
      const rs = await txn.txn_request('unhostTApp', opts);

      console.log('unhostTApp result:', rs);
      
      self.$root.loading(false);
      self.$root.success();

      await succ_cb();
      
    }catch(e){
      self.$root.showError(e);
      self.$root.loading(false);
    }

    
  },
  async favTapp(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    const html = `${utils.consts.gas_tip()}`;
    try{
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    // self.$root.loading(true);
    data.loading(true);

    try{
      const opts = {
        tappIdB64: base.getTappId(),
        address: self.layer1_account.address,
        targetTappIdB64: data.tapp_id,
        authB64: session_key,
      };
      const rs = await txn.txn_request('favTapp', opts);
      console.log('favTapp result:', rs);
      
      // self.$root.loading(false);
      data.loading(false);
      self.$root.success();

      await succ_cb();
      
    }catch(e){
      self.$root.showError(e);
      // self.$root.loading(false);
      data.loading(false);
    }
  },
  async unfavTapp(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    const html = `${utils.consts.gas_tip()}`;
    try{
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    self.$root.loading(true);

    try{
      const opts = {
        tappIdB64: base.getTappId(),
        address: self.layer1_account.address,
        targetTappIdB64: data.tapp_id,
        authB64: session_key,
      };
      const rs = await txn.txn_request('unfavTapp', opts);
      console.log('unfavTapp result:', rs);
      
      self.$root.loading(false);
      self.$root.success();

      await succ_cb();
      
    }catch(e){
      self.$root.showError(e);
      self.$root.loading(false);
    }
  },
  async queryFavTappList(self, param={}){
    const session_key = user.checkLogin(self);

    self.$root.loading(true);

    const mem_key = 'tapp_queryFavTappList_'+utils.crypto.sha256(JSON.stringify(param));
    const cache_result = mem.get(mem_key);
    if(cache_result){
      console.log('[Tapp] queryFavTappList cache result => ', cache_result);
      self.$root.loading(false);
      return cache_result;
    }
    
    const opts = {
      tappIdB64: base.getTappId(),
      address: self.layer1_account.address,
      authB64: session_key,
    };

    try{
      const rs = await txn.query_request('queryFavTappsList', opts);
      const list = await Promise.all(_.map(rs.sql_query_result, async (d)=>{
        const item = {
          id: d.tapp_id,
          name: d.name,
          token_symbol: d.ticker,
          ticker: d.ticker,
          total_supply: utils.layer1.balanceToAmount(d.total_supply),
          buy_price: utils.layer1.balanceToAmount(d.buy_price),
          sell_price: utils.layer1.balanceToAmount(d.sell_price),
          owner: d.owner,
          detail: d.detail,
          host_performance: 2000,  //TODO
          host_current: d.hosts.length,
          host_n: `${d.min_allowed_hosts}/${d.max_allowed_hosts}`,
          is_full: d.hosts.length>=d.max_allowed_hosts,
          active_block: d.start_height,
          status: d.status,
          tapp_type: d.tapp_type,
          ori: d,
        };
        item.market_cap = utils.layer1.roundAmount(item.sell_price * item.total_supply);
        item.theta = (d.buy_curve_k-d.sell_curve_k)+'%';

        item.account_balance = {};
        _.each(d.account_balance, (v, k)=>{
          item.account_balance[k] = utils.layer1.balanceToAmount(v);
        });
        return item;
      }));
      mem.set(mem_key, list);
      self.$root.loading(false);
      return list;
      
    }catch(e){
      self.$root.loading(false);
      self.$root.processError(e);
      console.log('queryFavTappList error:', e);
    }
    
  },

  async setAllowance(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    const extra = data.extra || null;

    let current_balance = 0;

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Set spending limit',
        confirm_text: 'Confirm',
        text: !extra ? `Set the TApp's spending limit` : `Set spending limit for this TApp.`,
        extra_button: extra? 'Visit TApp directly': false,
        extra_button_action: ()=>{
          helper.openUrl(extra.url);
        },
        props: {
          tapp_id: {
            label: 'Name',
            type: 'Input',
            disabled: true,
            default: data.name,
          },
          amount: {
            label: 'Amount',
            type: 'number',
            max: 100000000,
            // remove_required_rule: true,
            default: extra ? extra.allowance : (data.amount || 1),
            // tip: 'Click "Next" button to see how much you can convert to, or input a number below to convert back.'
          },
        },
      },
      cb: async (form, close)=>{
        if(!form.amount){
          form.amount = 0;
        }


        const id = data.id;
        const amount = utils.layer1.amountToBalance(form.amount);

        self.$root.loading(true);
        try{
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,

            targetTappIdB64: id,
            amount: utils.toBN(amount).toString(),
            authB64: session_key,
          };

          const rs = await txn.txn_request('setAllowance', opts);
          console.log('setAllowance result:', rs);

          close();
          mem.set('allowance_'+id, form.amount);
          self.$root.success();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
      async open_cb(param){
        // const r = await user.query_balance(self);
        // current_balance = r;
      }
    });
  },
  async query_meta_data(self, param={}){
    const opts = {
      tokenId: base.getTappId(),
      ...param,
    };

    try{
      const rs = await txn.query_request('query_tapp_metadata', opts);
      const data = rs.sql_query_result || rs || {};
      return data
    }catch(e){
      self.$root.showError(e);
      return null;
    }
  },
  async updateTapp(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Update CID',
        confirm_text: 'Confirm',
        text: '',
        props: {
          token_id: {
            label: 'Tapp Id',
            type: 'Input',
            disabled: true,
            default: data.id,
          },
          cid: {
            label: 'Ipfs CID',
            type: 'Input',
            default: '',
          },
        },
      },
      cb: async (form, close)=>{

        self.$root.loading(true);
        try{
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,
            authB64: session_key,

            tokenId: data.id,
            ticker: data.token_symbol,
            detail: data.detail,
            link: data.ori.link,
            tappType: data.ori.tapp_type,
            cid: form.cid,
            
          };

          const rs = await txn.txn_request('updateTapp', opts);
          console.log('updateTapp result:', rs);

          close();
          self.$root.success();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  }
};

export default F;