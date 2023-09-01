import {_, moment} from 'tearust_utils';
import utils from '../tea/utils';

import base from './base';
import txn from './txn';
import user from './user';

const F = {
  async start_credit_system(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Start credit system',
        text: ``,
        props: {
          amt: {
            label: 'Amount',
            type: 'number',
            min: 100,
            default: 10000,
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
              'default-value': '24:00',
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

        const amount = utils.layer1.amountToBalance(form.amt);
        const et = moment(form.end_date+' '+form.end_time+':00').utc();
        console.log('End time is(utc): ', et.toDate().getTime(), et.format('YYYY-MM-DD kk:mm:ss'));
        const end_time = et.toDate().getTime();
        const now = new Date().getTime();
        if(now > end_time){
          self.$root.loading(false);
          self.$root.showError("Invalid end time.");
          return false;
        }

        const opts = {
          address: self.layer1_account.address,
          tappIdB64: base.getTappId(),
          authB64: session_key,
          amt: utils.toBN(amount).toString(),
          endTime: end_time,
        };
        try{
          const rs = await txn.txn_request('adminStartCreditEvent', opts);

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

  async query_credit_system_info(self, param={}){
    self.$root.loading(true);
    
    const opts = {};
    try{
      const rs = await txn.query_request('query_credit_system_info', opts);
      self.$root.loading(false);
      
      console.log('query_credit_system_info =>', rs);
      return rs;
      
    }catch(e){
      self.$root.loading(false);
    }
  },

  async test_trigger_close_credit_system_cronjob(self, param={}, succ_cb){
    const session_key = user.checkLogin(self);
    self.$root.loading(true);

    const opts = {
      address: self.layer1_account.address,
      tappIdB64: base.getTappId(),
      authB64: session_key,
    };
    try{
      const rs = await txn.txn_request('adminTestTriggerCloseCreditSystem', opts);

      self.$root.success();
      await succ_cb(rs);
    }catch(e){
      self.$root.showError(e);
    }

    self.$root.loading(false);
  },

  async add_global_credit(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Topup global credit',
        text: ``,
        props: {
          amt: {
            label: 'Amount',
            type: 'number',
            min: 100,
            default: 10000,
            required: true,
          },
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const amount = utils.layer1.amountToBalance(form.amt);

        const opts = {
          address: self.layer1_account.address,
          tappIdB64: base.getTappId(),
          authB64: session_key,
          amt: utils.toBN(amount).toString(),
        };
        try{
          const rs = await txn.txn_request('adminAddGlobalCreditAmount', opts);

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
};

export default F;