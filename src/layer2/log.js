import {_, moment} from 'tearust_utils';
import utils from '../tea/utils';

import base from './base';
import txn from './txn';
import entity from './entity';
import user from './user';
import mem from './mem';
import tapp from './tapp';

const F = {
  
  async queryOpLogs(self, param={}){

    self.$root.loading(true);
    
    const opts = {};
    if(param.address){
      opts.address = param.address;
    }
    if(param.day){
      opts.day = param.day;

      opts.month = param.month || moment.utc().month()+1;
      opts.year = param.year || moment.utc().year();
    }

    // console.log(11, opts);

    try{
      const rs = await txn.query_request('queryOpLogs', opts);
      self.$root.loading(false);

      rs.logs = _.map(rs.logs, (item)=>{
        item.statement_type = _.get({
          'Incoming': 'Received',
          'Outcoming': 'Paid',
        }, item.statement_type, item.statement_type);

        item.state_type = _.get({
          'Bonding': 'Token on bonding curve',
        }, item.state_type, item.state_type);

        item.memo = _.get({
          'seat for bonding curve cronjob': 'Global token reward',
          'seat main cronjob': 'Maintainer seat reward',
        }, item.memo, item.memo||'Others');

        return item;
      });

      return _.reverse(rs.logs);
      
    }catch(e){
      self.$root.loading(false);
      console.log('queryOpLogs error:', e);
    }
    
  },

  async queryLeaderboard(self, param={}){

    self.$root.loading(true);
    
    const opts = {};
    try{
      const rs = await txn.query_request('queryLeaderboard', opts);
      self.$root.loading(false);
      const list = _.map(rs.sql_query_result, (item)=>{
        let gain;
        let total_bn = utils.toBN(item.tea_balance)
          .add(utils.toBN(item.tea_deposit))
          .add(utils.toBN(item.token_asset))
          .add(utils.toBN(item.seat_asset));

        let init_asset;
        if(utils.toBN(item.init_asset_add).gte(utils.toBN(item.init_asset_sub))){
          init_asset = utils.toBN(item.init_asset_add).sub(utils.toBN(item.init_asset_sub));
        }
        else{
          item.init_lt = true;
          init_asset = utils.toBN(item.init_asset_sub).sub(utils.toBN(item.init_asset_add));
        }

        const xn = total_bn.add(utils.toBN(item.init_asset_sub));
        if(xn.gte(utils.toBN(item.init_asset_add))){
          gain = xn.sub(utils.toBN(item.init_asset_add));
        }
        else{
          item.deposit = true;
          gain = utils.toBN(item.init_asset_add).sub(xn);
        }
        item.total = total_bn.toString();
        item.init_asset = init_asset.toString();
        item.gain = gain.toString();
        item.sort = gain.div(utils.toBN(100000000000000)).toNumber();
        if(item.deposit){
          item.sort = item.sort*-1;
        }
        return item;
      });
      return list.sort((a, b)=>b.sort-a.sort);
      
    }catch(e){
      self.$root.loading(false);
      console.log('queryLeaderboard error:', e);
    }
    
  },

  async registerForLeaderboard(self, param={}, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Register leaderboard',
        text: `As part of registering for the competition, the user consents to allowing the TAppStore to read their wallet for purposes of ranking their total asset value on our leaderboard. Besides its use on the leaderboard, the TAppStore will not share this account data to others.<br/>${utils.consts.gas_tip()}`,
        props: {
          eth: {
            label: 'ETH address',
            type: 'Input',
            required: true,
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const opts = {
          tappIdB64: base.getTappId(),
          address: self.layer1_account.address,
          authB64: session_key,
          eth: form.eth,
        };
        try{
          const rs = await txn.txn_request('registerForLeaderboard', opts);
          console.log(11, rs);

          self.$root.success();
          close();
          await succ_cb();
        }catch(e){
          if(_.includes(e, 'DuplicateEntryOnUniqueField')){
            e = 'Account exist.'
          }
          self.$root.showError(e);
        }

        self.$root.loading(false);
      },
    });
    
  },

  async queryActiveMiners(self, param={}){

    self.$root.loading(true);
    
    const opts = {};
    try{
      const rs = await txn.query_request('queryAllActiveMiners', opts);
      const meta = await tapp.query_meta_data(self);
      self.$root.loading(false);
      const list = _.map(rs.sql_query_result, (item)=>{
        if(item.node_status !== 'active'){
          item.plantd_at -= 1000000000;
        }
        item.cid = meta.cid;
        return item;
      });
      

      console.log('queryAllActiveMiners list =>', list);
      return _.reverse(_.sortBy(list, (x)=>x.plantd_at));
      
    }catch(e){
      self.$root.loading(false);
      console.log('queryAllActiveMiners error =>', e);
    }
    
  },

  async upgrade_version(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Upgrade version',
        text: ``,
        props: {
          type: {
            label: 'Type',
            type: 'select',
            options: [{id: 'client'}, {id: 'provider'}],
            required: true,
          },
          url: {
            label: 'Url',
            type: 'Input',
            required: true,
          },
          version: {
            label: 'Version',
            type: 'Input',
            required: true,
          },
          actor_name: {
            label: 'Actor name',
            type: 'Input',
            el_props: {
              type: 'textarea',
              rows: 5,
            }
          },
          actor_url: {
            label: 'Actor url',
            type: 'Input',
            el_props: {
              type: 'textarea',
              rows: 5,
            }
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const opts = {
          urlB64: utils.forge.util.encode64(form.url),
          type: form.type,
          version: form.version,
          actorName: _.map(form.actor_name.split(','), (x)=>x),
          actorUrl: _.map(form.actor_url.split(','), (x)=>utils.forge.util.encode64(x)),
        };
        try{
          const rs = await txn.txn_request('upgrade_version', opts);
          console.log(11, rs);

          self.$root.success();
          close();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }

        self.$root.loading(false);
      },
    });

  },

  async queryExpiredWithdraw(self, param={}){

    self.$root.loading(true);
    
    const opts = {};
    try{
      const rs = await txn.query_request('adminQueryExpiredWithdraws', opts);
      self.$root.loading(false);
      
      console.log('queryExpiredWithdraw list =>', rs);
      return rs;
      
    }catch(e){
      self.$root.loading(false);
      console.log('queryExpiredWithdraw error =>', e);
    }
    
  },
  async queryExpiredCmls(self, param={}){
    self.$root.loading(true);
    
    const opts = {};
    try{
      const rs = await txn.query_request('adminQueryExpiredCmls', opts);
      self.$root.loading(false);
      
      console.log('queryExpiredCmls list =>', rs);
      return rs;
      
    }catch(e){
      self.$root.loading(false);
      console.log('queryExpiredCmls error =>', e);
    }
    
  },

  
};

export default F;