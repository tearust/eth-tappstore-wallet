import {_, axios, moment, uuid} from 'tearust_utils';
import utils from '../tea/utils';
import tapp from '../tea/tapp';
import store from '../store';
import { hexToString, numberToHex, u8aToHex } from 'tearust_layer1';


const meta = {
  type: utils.get_env('TAPP_TYPE') || 'tapp',  // tappstore, miner, tapp
  sudo: utils.get_env('LAYER1_SUDO') || '5D2od84fg3GScGR139Li56raDWNQQhzgYbV7QsEJKS4KfTGv',
  tapp_id: utils.get_env('TAPP_ID'),
  server_url: utils.get_env('LAYER2_URL'),
  server_actor: utils.get_env('LAYER2_ACTOR') || 'MAUJS3ZTZQ2GEVDPAV4P5HBVTHGBLEDSQGPDRAMDRUIYQ3CN6TBERYF7',  // default is tappstore_in_B actor
};
console.log("layer2 meta", meta);

const _axios = axios.create({
  baseURL: meta.server_url,
});

// set request header 
_axios.interceptors.request.use((config)=>{
  config.data.actor = meta.server_actor;
  return config;
});

// set request response
_axios.interceptors.response.use((res)=>{
  if(res.data){
    if(res.data.data){
      return Promise.resolve(res.data.data);
    }
    else{
      return Promise.resolve(null);
    }
  }
}, (error)=>{
  if(error.response && error.response.status === 503){
    const err = error.response.data.error.replace('Invocation failure: Failed to invoke guest call: Guest call failure: Guest call failed: ', '');
    return Promise.reject(err);
  }
  return Promise.reject(error);
});

let _log = console.log;
const F = {
  setLog(log_fn){
    _log = log_fn;
  },
  log(msg){
    _log(msg);

  },
  set_global_log(self){
    F.setLog((msg)=>{
      self.$root.loading(true, msg);
    });
  },
  top_log(html, level='success'){
    utils.publish('top_log', {
      top_log: html,
      top_log_level: level,
    });
  },
  getTappId(){
    return meta.tapp_id;
  },
  getAxios(){
    return _axios;
  },
};

export default F;