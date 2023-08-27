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
      console.log(1111, rs);
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

  async queryActiveMetadata(self, data){
    
    self.$root.loading(true);
    
    const opts = {};
    try{
      const rs = await txn.query_request('queryAllActiveMiners', opts);
      const meta = await tapp.query_meta_data(self);
      let dd = await txn.query_request('queryActiveMetadata', {
        cmlId: data.cml_id ? _.toNumber(data.cml_id) : null,
        ticker: data.ticker || null,
      });
      dd = dd.sql_query_result;
      console.log(333, dd, data.xt);
      self.$root.loading(false);
      const x_list = dd[1] ? _.filter(rs.sql_query_result, (x)=>x.ip === dd[1]) : rs.sql_query_result;
      const list = _.map(x_list, (item)=>{
        if(item.node_status !== 'active'){
          item.plantd_at -= 1000000000;
        }

        if(data.has_app){
          item.cid = dd[0] || '';
        }
        
        return item;
      });

      if(data.has_cml && !data.has_app){
        alert('Click OK to redirect Tappstore for cml '+data.cml_id);
        location.href = `http://${dd[1]}:8080/ipfs/${meta.cid}`;
      }
      

      console.log('queryActiveMetadata list =>', list);
      return _.reverse(_.sortBy(list, (x)=>x.plantd_at));
      
    }catch(e){
      self.$root.loading(false);
      console.log('queryActiveMetadata error =>', e);
    }

    
  },

  async queryActiveMiners(self, data){

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
          actorName: _.map((form.actor_name||'').split(','), (x)=>x),
          actorUrl: _.map((form.actor_url||'').split(','), (x)=>utils.forge.util.encode64(x)),
          authB64: session_key,
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

  async freeze_state(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Freeze state',
        text: ``,
        props: {
          at: {
            label: 'Schedule at',
            type: 'number',
            required: true,
            default: 3600,
            tip: '3600 means freeze schedule at 1 hour later.',
          },
          before: {
            label: 'Freeze before',
            type: 'number',
            required: true,
            default: 3600,
          },
          after: {
            label: 'Freeze after',
            type: 'number',
            required: true,
            default: 1,
          },
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const opts = {
          authB64: session_key,
          tappIdB64: base.getTappId(),
          address: self.layer1_account.address,
          at: form.at,
          before: form.before,
          after: form.after,
        };
        try{
          const rs = await txn.txn_request('freeze_state', opts);
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

  async cancel_freeze_state(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Cancel freeze state',
        text: `Click confirm to cancel freeze state.`,
        props: {

        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const opts = {
          authB64: session_key,
          tappIdB64: base.getTappId(),
          address: self.layer1_account.address,
        };
        try{
          const rs = await txn.txn_request('cancel_freeze_state', opts);
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

  async querySystemVersion(self, param={}){
    const opts = {
      ...param
    };
    try{
      const rs = await txn.query_request('query_system_version', opts);
      
      console.log('query_system_version result =>', rs);
      return rs;
      
    }catch(e){
      console.log('query_system_version error =>', e);
    }
    
  },

  async queryTxnGasFeeList(self, param={}){
    const opts = {};
    self.$root.loading(true);
    try{
      const rs = await txn.query_request('queryTxnGasFeeList', opts);
      self.$root.loading(false);

      const list = _.map(rs.sql_query_result, (item)=>{
        item.fee = utils.layer1.balanceToAmount(item.fee);
        return item;
      });
      
      console.log('queryTxnGasFeeList result =>', list);
      return list;
      
    }catch(e){
      self.$root.loading(false);
      console.log('queryTxnGasFeeList error =>', e);
    }
  },

  async update_txn_gas_fee(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Add / Update txn gas fee',
        text: ``,
        props: {
          txn_name: {
            label: 'Txn name',
            type: 'Input',
            required: true,
            default: data.txn_name || '',
          },
          fee: {
            label: 'Gas fee',
            type: 'number',
            required: true,
            default: 1,
            min: 0.001,
            max: 10000,
          },
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const fee = utils.layer1.amountToBalance(form.fee);
        const opts = {
          authB64: session_key,
          tappIdB64: base.getTappId(),
          address: self.layer1_account.address,
          txnName: form.txn_name,
          fee: utils.toBN(fee).toString(),
        };
        try{
          const rs = await txn.txn_request('adminUpdateTxnGasFee', opts);

          close();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }

        self.$root.loading(false);
      },
    });

  },

  async query_history_list(self, param={}){
    const opts = {
      address: self.layer1_account.address,
    };
    if(param.sender){
      opts.sender = param.sender;
    }

    try{
      const rs = await txn.query_request('query_txn_cache_list', opts, false, true);
      const data = _.map(rs.list, (item)=>{
        item.time = base.ts_to_time(item.id);
        item.exec_time = item.ts ? base.ts_to_time(item.ts) : '';
        if(item.error){
          item.error = self.$root.formatError(item.error);

          if(_.includes(item.error, 'over_draft')){
            item.error = 'Not enough balance';
          }
        }

        return item;
      });
      return _.reverse(data);
    }catch(e){
      self.$root.showError(e);
      return null;
    }
  },

  async export_details(self, row){
    if(!row.nonce){
      self.$root.showError("Not executed.");
      return;
    }
    const json = {
      txn_name: row.txn_name,
      ...row.txn_args,
      nonce: row.nonce,
    };
    
    delete json.uuid;
    delete json.actor;
    delete json.authB64;
    if(!json){
      self.$root.showError("Invalid Txn type");
      return;
    }

    self.$store.commit('modal/open', {
      key: 'query_hash',
      param: {
        query: false,
        json,
      }
    });
  },

  async import_txn_details_and_verify(self, param, succ_cb){
    self.$store.commit('modal/open', {
      key: 'query_hash',
      param: {
        query: true,
        json: null,
      },
      async cb(hash, close){
        self.$root.loading(true);
        
        const opts = {
          address: self.layer1_account.address,
          ts: "1",
          hash: hash,
        };
        try{
          const r = await txn.query_request('queryHashResult', opts);
          await succ_cb(r);
        }catch(e){

          self.$root.showError(e);
        }
        close();
        self.$root.loading(false);
      }
    });
  },

  async check_hash(self, row, succ_cb){
    if(!row.nonce){
      self.$root.showError("Not executed.");
      return;
    }
    if(!row.txn_name){
      self.$root.showError("Invalid txn name.");
      return;
    }

    let opts = row;
    let request_key = 'check_hash_'+row.txn_name;
    delete opts.txn_name;

    opts.authB64 = '__';

    self.$root.loading(true);
    try{
      const rs = await txn.query_request(request_key, opts, false, true);
      await succ_cb(rs.hash);
    }catch(e){
      self.$root.showError(e);
    }
    self.$root.loading(false);
  },

  
};

export default F;