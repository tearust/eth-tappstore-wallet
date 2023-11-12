import {_} from 'tearust_utils';
import utils from '../tea/utils';
import store from '../store';
import {stringToHex, hexToU8a, stringToU8a, u8aToHex} from '@polkadot/util';

import user from './user';
import base from './base';
import txn from './txn';
import entity from './entity';
import mem from './mem';

const F = {
  async createEntityForCml(self, cml_id, succ_cb){
    return await entity.createEntity(self, succ_cb, 'cml', {
      cml_id,
    });
  },
  async startMining(self, data, succ_cb) {
    const session_key = user.checkLogin(self);

    const html = `${utils.consts.gas_tip()}`;
    try{
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    const opts = {
      tappIdB64: base.getTappId(),
      address: self.layer1_account.address,
      authB64: session_key,

      cmlId: _.toNumber(data.cml_id),
      teaId: data.miner_id.replace(/^0x/, ''),
      owner: self.layer1_account.address,
      minerIp: data.miner_ip,
      orbitdbId: data.orbitdb_id || '',
    };

    const rs = await txn.txn_request('startMining', opts);

    console.log('startMining result:', rs);
    return rs;
  },
  async stopMining(self, data, succ_cb) {
    const session_key = user.checkLogin(self);

    const html = `${utils.consts.gas_tip()}`;
    try{
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    const opts = {
      tappIdB64: base.getTappId(),
      address: self.layer1_account.address,
      authB64: session_key,

      cmlId: _.toNumber(data.cml_id),
      owner: self.layer1_account.address,
    };

    const rs = await txn.txn_request('stopMining', opts);

    console.log('stopMining result:', rs);
    return rs;
  },
  async migrate(self, data, succ_cb) {
    const session_key = user.checkLogin(self);

    const html = `${utils.consts.gas_tip()}`;
    try{
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    const opts = {
      tappIdB64: base.getTappId(),
      address: self.layer1_account.address,
      authB64: session_key,

      cmlId: _.toNumber(data.cml_id),
      owner: self.layer1_account.address,
      teaId: data.miner_id.replace(/^0x/, ''),
      minerIp: data.miner_ip,
    };

    const rs = await txn.txn_request('cmlMigrate', opts);

    console.log('cml_migrate result:', rs);
    return rs;
  },

  async resumeMining(self, data, succ_cb) {
    
  },

  async cmlScheduleDown(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    const html = `${utils.consts.gas_tip()}`;
    try{
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    const opts = {
      tappIdB64: base.getTappId(),
      address: self.layer1_account.address,
      authB64: session_key,

      cmlId: _.toNumber(data.cml_id),
      owner: self.layer1_account.address,
    };

    const rs = await txn.txn_request('cmlScheduleDown', opts);

    console.log('cmlScheduleDown result:', rs);
    return rs;
  },
  async cmlScheduleUp(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    const html = `${utils.consts.gas_tip()}`;
    try{
      await self.$confirm(html, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    const opts = {
      tappIdB64: base.getTappId(),
      address: self.layer1_account.address,
      authB64: session_key,

      cmlId: _.toNumber(data.cml_id),
      owner: self.layer1_account.address,
    };

    const rs = await txn.txn_request('cmlScheduleUp', opts);

    console.log('cmlScheduleUp result:', rs);
    return rs;
  },

  async queryCmlList(self, param={}){
    const mem_key = 'miner_queryCmlList_'+utils.crypto.sha256(JSON.stringify(param));
    // const cache_result = mem.get(mem_key);
    // if(cache_result){
    //   console.log('[Miner] queryCmlList cache result => ', cache_result);
    //   return cache_result;
    // }

    const opts = {
      owner: param.owner || null,
    };

    if(!opts.owner) delete opts.owner;


    const rs = await txn.query_request('queryCmlList', opts);
    if(!rs.list || rs.list.Err){
      self.$root.showError(JSON.stringify(rs.list.Err));
      return [];
    }

    const layer2_list = rs.list.Ok;
    let c_list = [];
    if(!param.owner){
      const ids = _.map(layer2_list, (tmp)=>{
        return tmp[0].id;
      });
      c_list = await self.wf.getCmlByList(ids);
    }
    else{
      c_list = self.layer1_account.cml;
    }

    const list = _.map(c_list, (cml)=>{
      const tmp = _.find(layer2_list, (item)=>{
        return item[0].id === cml.id;
      });

      if(tmp){
        cml.layer2 = {
          ...tmp[0],
          ...tmp[1],
          tea_id_b64: utils.minerHexToB64(u8aToHex(Uint8Array.from(tmp[2]))),
          entity_id: tmp[3] ? utils.minerHexToB64(u8aToHex(Uint8Array.from(tmp[3]))) : null,
        };
      }
      
      return cml;
    });

    mem.set(mem_key, list);
    return list;
  },
  async queryMinerDetails(self, param={}){
    const opts = {
      teaIdB64: param.tea_id_b64,
    };

    const rs = await txn.query_request('queryCmlDetails', opts);
    
    if(!rs.data || rs.data.Err){
      self.$root.showError(JSON.stringify(rs.data.Err));
      return null;
    }

    const tmp = rs.data.Ok;
    const json = {
      ...tmp[0],
      ...tmp[1],
    };
    delete json.tea_id;
    json.tea_id_b64 = param.tea_id_b64;
    
    return json;
  },

  async queryCmlDetails(self, param={}){
    if(param.cml_id === undefined) throw 'Invalid cml id';

    let cml = null;

    const layer2_list = await F.queryCmlList(self);

    const one = _.find(layer2_list, (x)=>{
      return x.id === _.toNumber(param.cml_id);
    });
    if(one){
      // get miner details
      one.miner = await F.queryMinerDetails(self, {
        tea_id_b64: one.layer2.tea_id_b64,
      });

      cml = one;

    }
    else{
      [cml] = await self.wf.getCmlByList([param.cml_id]);
    }

    return cml;
  }


  

  
  

};

export default F;