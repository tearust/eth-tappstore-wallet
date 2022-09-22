import layer2 from '../layer2';
import eth from '../eth';
import utils from '../tea/utils';
import Log from '../shared/utility/Log';
import http from '../tea/http';
import store from '../store';
import request from '../request';

import { _, forge, moment } from 'tearust_utils';
import { hexToString, numberToHex } from 'tearust_layer1';

import '../tea/moment-precise-range';


let _layer1 = null;
let _init = false;
export default class {
  constructor() {
    this.layer1 = _layer1;
    this._log = Log.create(this.defineLog());

  }

  defineLog() {
    return 'Base';
  }

  async init() {
    const init_loop = (resolve) => {
      if (!this.layer1) {
        _.delay(() => {
          init_loop(resolve);
        }, 300);
      }
      else {
        resolve();
      }
    };


    return new Promise(async (resolve) => {
      if (!_init) {
        _init = true;
        await this.initLayer1();
      }
      init_loop(resolve);
    });

  }

  async getAllLayer1Account() {
    const layer1_instance = this.getLayer1Instance();
    if (layer1_instance && layer1_instance.extension) {
      const all_account = await layer1_instance.extension.getAllAccounts();

      return all_account;
    }

    return [];
  }

  async initLayer1() {
    if (!_layer1) {
      _layer1 = await eth.get();

      this.layer1 = _layer1;
    }
  }

  async initEvent() {
    

  }

  getLayer1Instance() {
    if (this.layer1) {
      return this.layer1;
    }

    return null;
  }

  async getCurrentBlock(api) {
    if (!api) {
      const layer1_instance = this.getLayer1Instance();
      api = layer1_instance.getApi();
    }
    const block = await api.rpc.chain.getBlock();
    return block.toJSON().block.header.number;
  }

  showQrCodeModal(opts) {
    utils.publish('tea-qrcode-modal', {
      visible: true,
      text: opts.text,
    });
  }
  closeQrCodeModal() {
    utils.publish('tea-qrcode-modal', {
      visible: false,
    });
  }

  blockToDay(block) {
    const hour = 60 * 60 / 6;
    const d = Math.ceil(block / hour);
    if(d < 0) return '0';

    const tmp = moment.utc().preciseDiff(moment.utc().add(d, 'h'), true);
    let rs = '';
    if (tmp.years) {
      rs += tmp.years + 'y';
    }
    if (tmp.months) {
      rs += tmp.months + 'm';
    }
    
    rs += (tmp.days||0) + 'd';

    if(rs === '0d'){
      if(tmp.hours){
        rs = tmp.hours + 'h';
      }
      else if(tmp.minutes){
        rs = tmp.minutes + 'mins'
      }
      else if(tmp.seconds){
        rs = tmp.seconds + 'seconds'
      }
    }

    if(rs === '0d'){
      rs = '0';
    }
    
    return rs;
  }

  encode_b64(str) {
    return forge.util.encode64(str);
  }

  showSelectLayer1Modal() {
    utils.publish('tea-select-layer1-modal', true);
  }

  async getAllDebtByAddress(address){
    const cml_list = await request.layer1_rpc('cml_userCreditList', [
      address
    ]);

    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    let total = 0;
    const debt_map = {};

    await Promise.all(_.map(cml_list, async (arr)=>{
      const cml_id = arr[0];
      let debt = parseInt(arr[1], 10);
      // let debt = await api.query.cml.genesisMinerCreditStore(address, cml_id);
      // debt = debt.toJSON();
      if (debt) {
        total += debt;
      }
      _.set(debt_map, cml_id, (debt / layer1_instance.asUnit()))
      return null;
    }));

    total = total / layer1_instance.asUnit();

    
    return {
      total,
      details: debt_map
    };

  }

  async getAllPawnByAddress(address){
    return null;
  }

  async getAllBalance(address) {
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();
    let tmp = await api.query.system.account(address);
    // console.log('balance =>', tmp.toJSON().data);
    tmp = tmp.data;


    const free = parseInt(tmp.free, 10) / layer1_instance.asUnit();
    const lock = parseInt(tmp.reserved, 10) / layer1_instance.asUnit();

    

    let usd = await api.query.genesisExchange.usdStore(address);
    usd = usd.toJSON();
    usd = utils.layer1.balanceToAmount(usd);
    // let usd = 0;

    let usd_debt = 0;
    
    return {
      free: Math.floor(free * 10000) / 10000,
      lock: Math.floor(lock * 10000) / 10000,
      reward: 0,
      usd,
      usd_debt,
    };
  }

  async transferBalance(address, amount, isCoffee=false) {
    const layer1_account = store.getters.layer1_account;
    if (!layer1_account.address) {
      return false;
    }

    if (!amount || amount === 0) {
      throw 'Invalid transfer balance.';
    }

    if(!address){
      throw 'Invalid receiver\'s address.';
    }

    if(address === layer1_account.address){
      throw 'You cannot send to yourself.';
    }

    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    const total = layer1_instance.asUnit() * amount;
    const tt = amount > 9000 ? numberToHex(total) : Math.floor(total);
    console.log(11, tt);
    let transfer_tx = api.tx.balances.transfer(address, tt);
    if(isCoffee){
      transfer_tx = api.tx.genesisExchange.transferUsd(address, tt);
    }
    await layer1_instance.sendTx(layer1_account.address, transfer_tx);
  }

  async getCoupons(address) {
  
    return {
      coupon_investor_A: 0,
      coupon_investor_B: 0,
      coupon_investor_C: 0,
      coupon_team_A: 0,
      coupon_team_B: 0,
      coupon_team_C: 0,
    }
  }

  async refreshCurrentAccount() {

    const layer1_account = store.getters.layer1_account;
    if (!layer1_account.address) {
      return false;
    }

    const layer1_instance = this.getLayer1Instance();

    const api = layer1_instance.getApi();
    const balance = await this.getAllBalance(layer1_account.address);

    const coupons = await this.getCoupons(layer1_account.address);

    const pawn_cml_list = await this.getAllPawnByAddress(layer1_account.address);

    // reset all state
    store.commit('reset_state');

    // let my_auction = await api.query.auction.userAuctionStore(layer1_account.address);
    // my_auction = my_auction.toHuman();
    const cml_list = await this.getCmlListByUser(layer1_account.address);
    const cml_data = await this.getCmlByList(cml_list);

    this._log.i("refresh current layer1_account");
    store.commit('set_account', {
      balance: balance.free,
      lock_balance: balance.lock,
      address: layer1_account.address,
      ori_name: layer1_account.name,
      cml: cml_data,
      reward: balance.reward,
      
      usd: balance.usd,
      usd_debt: balance.usd_debt,

      coupons,
      pawn_cml_list,
    });

    
    store.commit('set_miner_mode', cml_data.length>0);
    await store.dispatch('init_user');
  }

  async getCmlListByUser(address) {
    const user_cml_list = await request.layer1_rpc('cml_userCmlList', [
      address
    ])

    // return user_cml_list;
    return user_cml_list;
  }

  async getCmlByList(cml_list, flag=false) {
    const layer1_instance = this.getLayer1Instance();
    const api = layer1_instance.getApi();

    const current_block = await this.getCurrentBlock(api);

    const list = await Promise.all(_.map(cml_list, async (cml_id) => {
      let cml = await api.query.cml.cmlStore(cml_id);
      cml = cml.toJSON();

      
      let remaining = cml.intrinsic.lifespan;

      if (remaining < 0) remaining = 0;
      cml.liferemaining = remaining;
      cml.life_day = this.blockToDay(remaining);

      // cml.performance = cml.intrinsic.performance;
      
      cml = this.to_default_cml(cml);
      return {
        ...cml.intrinsic,
        ...cml,
      };
    }));
    return list;

  }

  to_default_cml(cml){
    cml.version_expired = false;
    // cml.machine_id = '0x123';
    // cml.remaining_performance = 0;
    // cml.status = '';
    // cml.miner_status = '';
    // cml.staking_slot = 0;
    return cml;
  }




}