import {_, moment} from 'tearust_utils';
import utils from '../tea/utils';
import store from '../store';
import {stringToHex, hexToU8a, stringToU8a} from '@polkadot/util';

import base from './base';
import txn from './txn';
import entity from './entity';
import user from './user';
import mem from './mem';
import eth from '../eth';

const F = {
  open_channel(self, param, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Open payment channel',
        text: ``,
        props: {
          target: {
            label: 'Payee address',
            type: 'Input',
            default: ''
          },
          fund: {
            label: 'Init fund',
            type: 'number',
            min: 1,
            default: 100,
            required: true,
          },
          grace_period: {
            label: 'Grace period (second)',
            type: 'number',
            min: 1800,
            default: 3600,
            required: true,
          },
          end_date: {
            label: 'End date',
            type: 'date',
            required: true,
            el_props: {
              editable: false,
              'value-format': 'yyyy-MM-dd',
            }
          },
          end_time: {
            label: 'End time',
            type: 'time',
            required: true,
            el_props: {
              editable: false,
              'default-value': '01:00',
              'picker-options': {
                start: '01:00',
                step: '01:00',
                end: '24:00'
              }
            }
          },
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const fund = utils.layer1.amountToBalance(form.fund);
        const et = moment(form.end_date+' '+form.end_time+':00').utc();
        console.log('Expire time is(utc): ', et.toDate().getTime(), et.format('YYYY-MM-DD kk:mm:ss'));
        const end_time = et.toDate().getTime();
        const now = new Date().getTime();
        if(now > end_time){
          self.$root.loading(false);
          self.$root.showError("Invalid end time.");
          return false;
        }

        const {address, privateKey} = eth.help.createNewWallet();
        const channel_id = address;
        utils.cache.put(address, privateKey);

        const opts = {
          address: self.layer1_account.address,
          tappIdB64: base.getTappId(),
          authB64: session_key,
          payeeAddress: form.target,
          gracePeriod: form.grace_period,
          fundRemaining: utils.toBN(fund).toString(),
          expireTime: end_time.toString()+'000000',
          channelId: channel_id,
        };

        try{
          const rs = await txn.txn_request('open_payment_channel', opts);

          self.$root.success();
          close();
          await succ_cb(rs);
        }catch(e){
          self.$root.showError(e);
        }

        self.$root.loading(false);
      },
    });
  },

  format_channel_item(item){
    const [update_str, update_time_obj] = base.format_ts(item.latest_update_at);
    return {
      ...item.item,
      latest_update_at: update_str,
      latest_update_at_obj: update_time_obj,
      fund_remaining: utils.layer1.balanceToAmount(utils.toBN(item.item.fund_remaining)),
      expire_time: base.ts_to_time(item.item.expire_time),
    };
  },
  async query_all_channel_list(self, param={}){
    const session_key = user.checkLogin(self);
    const opts = {
      address: self.layer1_account.address,
      tappIdB64: base.getTappId(),
      authB64: session_key,
    };
    try{
      const rs = await txn.query_request('query_channel_list_with_account', opts);
      
      // console.log('query_channel_list_with_account result =>', rs);

      return {
        payer_list: _.map(rs.payer_list, (item)=>F.format_channel_item(item)),
        payee_list: _.map(rs.payee_list, (item)=>F.format_channel_item(item)),
      }
      
    }catch(e){
      console.log('query_channel_list_with_account error =>', e);
    }
  },

  refill_fund(self, row, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Refill amount',
        text: ``,
        props: {
          channel_id: {
            label: 'Payee address',
            type: 'Input',
            default: row.channel_id,
            disabled: true,
          },
          amount: {
            label: 'Refill amount',
            type: 'number',
            min: 1,
            default: 100,
            required: true,
          },
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const amount = utils.layer1.amountToBalance(form.amount);

        const opts = {
          address: self.layer1_account.address,
          tappIdB64: base.getTappId(),
          authB64: session_key,
          refillAmount: utils.toBN(amount).toString(),
          channelId: row.channel_id,
        };

        try{
          const rs = await txn.txn_request('payer_refill_fund', opts);

          self.$root.success();
          close();
          await succ_cb(rs);
        }catch(e){
          console.log(1111, e);
          self.$root.showError(e);
        }

        self.$root.loading(false);
      },
    });
  },

  async early_terminate(self, row, succ_cb){
    const session_key = user.checkLogin(self);
    try{
      await self.$confirm('Are you sure to early terminate the channel.', {
        title: 'Early terminate',
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return;
    }

    self.$root.loading(true);
    const opts = {
      address: self.layer1_account.address,
      tappIdB64: base.getTappId(),
      authB64: session_key,
      channelId: row.channel_id,
    };

    try{
      const rs = await txn.txn_request('payer_early_terminate', opts);
      self.$root.success();
      await succ_cb(rs);
    }catch(e){
      self.$root.showError(e);
    }
    self.$root.loading(false);
  },

  async terminate(self, row, succ_cb){
    const session_key = user.checkLogin(self);
    try{
      await self.$confirm('Are you sure to terminate the channel.', {
        title: 'Terminate',
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return;
    }

    self.$root.loading(true);
    const opts = {
      address: self.layer1_account.address,
      tappIdB64: base.getTappId(),
      authB64: session_key,
      channelId: row.channel_id,
    };

    try{
      const rs = await txn.txn_request('terminate', opts);
      self.$root.success();
      await succ_cb(rs);
    }catch(e){
      self.$root.showError(e);
    }
    self.$root.loading(false);
  },

  sign_remaining_fund(self, row, succ_cb){
    // const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Sign remaining fund',
        text: ``,
        props: {
          channel_id: {
            label: 'Payee address',
            type: 'Input',
            default: row.channel_id,
            disabled: true,
          },
          amount: {
            label: 'Remaining fund',
            type: 'number',
            min: 1,
            default: 100,
            required: true,
          },
        },
      },
      cb: async (form, close)=>{
        const amount = utils.layer1.amountToBalance(form.amount);
        const amount_str = utils.toBN(amount).toString();
        const pri = utils.cache.get(row.channel_id);
        const {wallet} = eth.help.createNewWallet(pri);
        const sig = await eth.help.signWithWallet(wallet, amount_str);
        console.log(1, sig);
        const verify = eth.help.verifyWithWallet(wallet, amount_str, sig);
        console.log(2, verify);
        
        const html = 'Remaining fund: '+form.amount + '<br/>'+'Signature: '+sig;
        self.$root.alert_success(html);

        close();
        await succ_cb();
      },
    });
  },

  async payee_update_payment(self, row, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Refill amount',
        text: ``,
        props: {
          channel_id: {
            label: 'Payee address',
            type: 'Input',
            default: row.channel_id,
            disabled: true,
          },
          amount: {
            label: 'Remaining fund',
            type: 'number',
            min: 1,
            default: 100,
            required: true,
          },
          sig: {
            label: 'Signature',
            type: 'Input',
            default: '',
            required: true,
          },
          close: {
            label: 'Close channel',
            type: 'switch',
            default: false,
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const amount = utils.layer1.amountToBalance(form.amount);

        const opts = {
          address: self.layer1_account.address,
          tappIdB64: base.getTappId(),
          authB64: session_key,
          channelId: row.channel_id,
          sig: form.sig,
          closeChannel: !!form.close,
          newFundRemaining: utils.toBN(amount).toString(),
        };

        try{
          const rs = await txn.txn_request('payee_update_payment', opts);

          self.$root.success();
          close();
          await succ_cb(rs);
        }catch(e){
          self.$root.showError(e);
        }

        self.$root.loading(false);
      },
    });
  }
};

export default F;
