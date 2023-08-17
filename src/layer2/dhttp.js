import {_, axios, moment, uuid} from 'tearust_utils';
import utils from '../tea/utils';
import base from './base';
import { NOT_LOGIN } from './user';
import mem from './mem';
import user from './user';

const F = {

  async txn_request(method, param){
    if(param.tappIdB64){
      param.tokenId = param.tappIdB64;
      delete param.tappIdB64;
    }

    const _uuid = uuid();
    console.log("prepare for txn: ", method, _uuid);
    
    const _axios = base.getAxios();

    let rs = null;
    try{
      console.log("Send txn request...");
      rs = await _axios.post('/'+method, {
        ...param,
      });
      console.log("step_1 result: ", rs);
    }catch(e){
      console.error("step_1 error: ", e);

      throw e;
    }


    const step_3_hash = rs.hash;
    const step_3_ts = rs.ts;
    let step_3_rs = null;
    let step_4_rs = null;
    let sn = 0;
    const step_4_loop = async ()=>{
      if(sn > 10) {  // TODO
        step_4_rs = {
          'status': false,
          'error': 'request timeout',
        };
        return;
      }
      try{
        base.log('Send query txn hash request...');
        console.log('Send query txn hash request...');
        step_3_rs = await _axios.post('/queryHashResult', {
          a_node: true,
          hash: step_3_hash,
          ts: step_3_ts.toString(),
        });
    
        base.log('Wait for query txn hash result...');
        console.log('Wait for query txn hash result...');


        step_4_rs = step_3_rs;
      }catch(e){
        console.log("step4 error: ", e);

        if(e !== 'wait'){
          throw e;
        }
        
        // rs = e.message;
        step_4_rs = null;
        sn++;
        await utils.sleep(3000);
        await step_4_loop();
      }
  
    };
  
    base.log("Start to query hash result...");
    console.log("Start to query hash result...");
    await step_4_loop();

    console.log("step4 result: ", step_4_rs);

    return step_4_rs;
  },

  async query_request(method, param){
    if(param.tappIdB64){
      param.tokenId = param.tappIdB64;
      delete param.tappIdB64;
    }
  
    console.log("Start to first query request...");
    const _axios = base.getAxios();

    const rs = await _axios.post('/'+method, {
      ...param,
    });
    console.log('query result => '+rs);
    
    return rs;
  }

};


export default F;