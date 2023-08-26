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
          end_time: {
            label: 'End time',
            type: 'Input',
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
          endTime: 100,
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
  }
};

export default F;