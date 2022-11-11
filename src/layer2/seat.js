import {_} from 'tearust_utils';
import utils from '../tea/utils';

import base from './base';
import txn from './txn';
import entity from './entity';
import user from './user';
import mem from './mem';

const F = {
  getMeta(){
    return {
      day_block: 150,
      disabled_block: 15,
    };
  },
  async querySeatList(self, param={}){

    self.$root.loading(true);

    const mem_key = 'tapp_querySeatList_'+utils.crypto.sha256(JSON.stringify(param));
    const cache_result = mem.get(mem_key);
    if(cache_result){
      console.log('[Seat] querySeatList cache result => ', cache_result);
      self.$root.loading(false);
      return cache_result;
    }
    
    const opts = {};
    if(param.maintainer){
      opts.maintainer = param.maintainer;
    }
    if(opts.deal_user){
      opts.dealUser = param.deal_user;
    }

    try{
      const rs = await txn.query_request('querySeatList', opts);

      let total = utils.toBN(0);
      let list = await Promise.all(_.map(rs.sql_query_result, async (item)=>{
        total = total.add(utils.toBN(item.price));
        _.each(['price', 'real_price', 'deal_price', 'estimate_price', 'market_deposit'], (key)=>{
          if(item[key]){
            item[key] = utils.layer1.balanceToAmount(item[key]);
          }
        })
        // if(item.market_status === 'Active'){
        //   active_num++;
        // }
        return item;
      }));
      list = _.sortBy(list, (x)=>x.real_price);

      list[0] && (list[0].ave_price = total.div(utils.toBN(list.length)).toString());
      
      mem.set(mem_key, list);
      self.$root.loading(false);
      
      return list;
      
    }catch(e){
      self.$root.loading(false);
      console.log('querySeatList error:', e);
    }
    
  },

  async buySeat(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Buy seat',
        confirm_text: 'Confirm',
        text: `Please note that every seat requires 300T as a deposit, which will be withdrawn from your account automatically when a seat is purchased.<br/>${utils.consts.gas_tip()}`,
        props: {
          seat_id: {
            label: 'Seat ID',
            type: 'Input',
            disabled: true,
            default: data.id,
          },
          price: {
            label: 'Price',
            type: 'number',
            max: 100000000,
            default: 1,
            // tip: 'Click "Next" button to see how much you can convert to, or input a number below to convert back.'
          },
        },
      },
      cb: async (form, close)=>{
        if(!form.price){
          self.$root.showError('Price is required.');
          return;
        }
        if(form.price < data.real_price+1){
          self.$root.showError('The buy price must be at least 1T more than the current price.');
          return;
        }

        
        self.$root.loading(true);
        
        const seatId = form.seat_id;
        const price = utils.layer1.amountToBalance(form.price);
        
        try{
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,
            authB64: session_key,
            seatId,
            price: utils.toBN(price).toString(),
          };

          const rs = await txn.txn_request('buySeat', opts);
          console.log('buySeat result:', rs);

          close();
          self.$root.success();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  },
  async updateSeatEstimate(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Update estimate price',
        confirm_text: 'Confirm',
        text: `${utils.consts.gas_tip()}`,
        props: {
          seat_id: {
            label: 'Seat ID',
            type: 'Input',
            disabled: true,
            default: data.id,
          },
          price: {
            label: 'Estimate price',
            type: 'number',
            max: 100000000,
            default: 1,
            // tip: 'Click "Next" button to see how much you can convert to, or input a number below to convert back.'
          },
        },
      },
      cb: async (form, close)=>{
        if(!form.price){
          self.$root.showError('Price is required.');
          return;
        }

        self.$root.loading(true);
        
        const seatId = form.seat_id;
        const price = utils.layer1.amountToBalance(form.price);
        
        try{
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,
            authB64: session_key,
            seatId,
            price: utils.toBN(price).toString(),
          };

          const rs = await txn.txn_request('updateSeatEstimate', opts);
          console.log('updateSeatEstimate result:', rs);

          close();
          self.$root.success();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  },

  async giveupSeatOwnership(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    try{
      const html = `Are you sure to giveup the Seat ownership?<br/>${utils.consts.gas_tip()}`;
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    self.$root.loading(true);
        
    const seatId = data.id;
    try{
      const opts = {
        tappIdB64: base.getTappId(),
        address: self.layer1_account.address,
        authB64: session_key,
        seatId,
      };

      const rs = await txn.txn_request('giveupSeatOwnership', opts);
      console.log('giveupSeatOwnership result:', rs);

      close();
      self.$root.success();
      await succ_cb();
    }catch(e){
      self.$root.showError(e);
    }

    self.$root.loading(false);
    
  }
};

export default F;