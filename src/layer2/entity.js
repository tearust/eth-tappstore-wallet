import {_} from 'tearust_utils';
import utils from '../tea/utils';
import sq_root from '../tea/squareroot';
import store from '../store';
import help from '../eth/help';

import base from './base';
import txn from './txn';
import user from './user';
import mem from './mem';

const F = {
  // @param type: tapp, cml
  async createEntity(self, succ_cb, type, type_param){
    const session_key = user.checkLogin(self);
    if(!type || (type !== 'tapp' && type !== 'cml')){
      throw 'invalid type args.';
    }
    if(type && !type_param){
      throw 'invalid type_param args.';
    }

    const name_max_len = 10;
    const ticker_max_len = 5;
    const ticker_min_len = 3;
    const detail_max_len = 32;

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: type==='tapp' ? 'Create TApp' : 'Create entity for CML ('+type_param.cml_id+')',
        // confirm_text: 'Next',
        text: utils.consts.gas_tip(),
        label_width: 200,
        props: {
          name: {
            type: 'Input',
            label: 'Name',
            required: true,
            el_props: {
              'show-word-limit': true,
              maxlength: name_max_len,
            },
            rules: {
              max: name_max_len,
              message: `Name cannot be longer than ${name_max_len} characters.`,
            },
          },
          ticker: {
            type: 'Input',
            label: type==='tapp' ? 'TApp symbol' : 'Symbol',
            required: true,
            el_props: {
              'show-word-limit': true,
              maxlength: ticker_max_len,
              minlength: ticker_min_len,
            },
            rules: [
              {
                min: ticker_min_len,
                message: `TApp symbol must be at least ${ticker_min_len} characters.`
              },
              {
                max: ticker_max_len,
                message: `TApp symbol cannot be longer than ${ticker_max_len} characters.`
              }
            ]
          },

          init_fund: {
            label: 'Initial tokens',
            type: 'select_number',
            el_props: {
              'allow-create': true,
              'filterable': true,
            },
            required: true,
            default: type==='tapp' ? 1 : 10,
            options: type==='tapp' ? [{id: 1}, {id: 10}, {id: 100}, {id: 1000}, {id: 2000}, {id: 5000}, {id: 10000}] : [{id: 10}, {id: 100}, {id: 1000}, {id: 2000}],
            rules: [{
              type: 'number',
              message: 'Initial token must be number.',
            }, {
              validator: (rule, val, cb)=>{
                if(!(/^[0-9]+$/g).test(val.toString())){
                  return cb('Must be integer value.');
                }
                
                // if(_.toNumber(val)<10) 
                //   return cb('min value is 10');

                return cb();
              }
            }],
            // tip: 'Click to visit wiki.',
            // tip_action: ()=>{
            //   window.open('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---initial-tokens', '_blank');
            // }
          },
          
          detail: {
            label: 'Details',
            type: 'Input',
            required: true,
            el_props: {
              'show-word-limit': true,
              maxlength: detail_max_len,
            },
            rules: {
              max: detail_max_len,
              message: `Details symbol cannot be longer than ${detail_max_len} characters.`,
            }
          },

          // ReferralCode: {
          //   label: 'Referral info',
          //   type: 'Input',
          //   required: true,
          //   condition: {
          //     target: 'template',
          //     value: 'ReferralCode'
          //   },
          //   el_props: {
          //     type: 'textarea',
          //     rows: 4,
          //     style: {
          //       width: '800px'
          //     }
          //   },
          // },
          // code: {
          //   label: 'Referral Code',
          //   type: 'Input',
          //   disabled: true,
          //   model: 'ticker',
          // },
          
          // min_hosts: {
          //   label: 'Min hosts',
          //   type: 'number',
          //   default: 3,
          //   disabled: true,
          // },

          max_allowed_hosts: {
            type: 'number',
            required: true,
            default: 10,
            min: 3,
            class: type==='tapp' ? '' : 'hidden',
          },

          fixed_token_mode: {
            label: 'Billing model',
            type: 'radio-group',
            required: true,
            class: type==='tapp' ? '' : 'hidden',
            
            // default: type==='tapp' ? undefined : 'FixedHostingFee',
            default: 'FixedHostingFee',
            options: [
              {
                label: 'Fixed TEA payment per 1000 blocks',
                value: 'FixedHostingFee',
                disabled: type==='tapp' ? false : true,
              },
              {
                label: 'Fixed TApp token and dividend payments per 1000 blocks',
                value: 'FixedHostingToken',
                disabled: type==='tapp' ? false : true,
              }
            ],
          },

          hosting_amount: {
            type: 'select_number',
            label: 'Staked tokens per miner',
            class: type==='tapp' ? '' : 'hidden',
            el_props: {
              'allow-create': true,
              'filterable': true,
            },
            options: [
              {id: 10}, {id: 50}, {id: 100}, {id: 200}, {id: 500}, {id: 1000}, {id: 2000},
              {id: 5000}, {id: 10000},
            ],
            default: 100,
            required: true,
            rules: {
              validator: (rule, val, cb)=>{
                if(!(/^[0-9]+$/g).test(val.toString())){
                  return cb('Must be integer value.');
                }
                
                if(_.toNumber(val)<1) 
                  return cb('min value is 1');

                return cb();
              }
            },
            // tip: 'Click to visit wiki',
            // tip_action: ()=>{
            //   helper.openUrl('https://github.com/tearust/teaproject/wiki/TApps---Creating-a-TApp#create-new-tapp---staked-token-amount')
            // }
          },

          theta: {
            label: 'Theta',
            type: 'select_number',
            el_props: {
              'allow-create': true,
              'filterable': true,
            },
            required: true,
            default: 1,
            options: [
              {id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 5}, {id: 10}, {id: 30}
            ],
            rules: [{
              type: 'number',
              message: 'Theta must be number.',
            }, {
              validator: (rule, val, cb)=>{
                if(!(/^[0-9]+$/g).test(val.toString())){
                  return cb('Must be integer value.');
                }
                
                if(_.toNumber(val)<0) 
                  return cb('min value is 0');
                if(_.toNumber(val)>30){
                  return cb('max value is 30');
                }

                return cb();
              }
            }],
            
          }
          
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        try{
          const theta = 100 - _.toNumber(form.theta);
          if(theta < 70){
            throw 'Theta can\'t be more than 30';
          }
          const initAmount = utils.layer1.amountToBalance(form.init_fund);
          const hostingAmount = utils.layer1.amountToBalance(form.hosting_amount);

          const ethUtils = help.getUtils();
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,
            name: form.name,
            ticker: form.ticker,
            detail: form.detail,
            link: 'test_link',
            maxAllowedHosts: form.max_allowed_hosts,
            tappType: 'Twitter',
            billingMode: form.fixed_token_mode,
            buyCurveK: 100,
            sellCurveK: theta,
            initAmount: utils.toBN(initAmount).toString(),
            hostingAmount: '1', //utils.toBN(hostingAmount).toString(),
            authB64: session_key,
            targetTappIdB64: ethUtils.hexlify(ethUtils.randomBytes(20)),
            cmlId: type==='tapp' ? null : type_param.cml_id,
          };
          console.log("create new entity with => "+JSON.stringify(opts));
          const rs = await txn.txn_request('createNewTApp', opts);

          console.log('result:', rs);
          
          close();
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
    
    
  },

  buyToken(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Buy',
        confirm_text: 'Next',
        text: `For more information on how to invest in TApp tokens, <a href="https://github.com/tearust/teaproject/wiki/TApps-List#tapp-token-strategy" class="t-wiki" target="_blank">visit our wiki</a>.<br/>${utils.consts.gas_tip()}`,
        props: {
          tapp_id: {
            label: 'Token ID',
            type: 'Input',
            disabled: true,
            default: data.id,
          },
          tapp_amount: {
            label: 'Quantity',
            type: 'number',
            max: 100000000,
            // remove_required_rule: true,
            default: 1,
            // tip: 'Click "Next" button to see how much you can convert to, or input a number below to convert back.'
          },
          // tea: {
          //   label: 'TEA',
          //   type: 'number',
          //   default: undefined,
          //   model_action: {
          //     button_text: 'Convert back',
          //     ref: 'tapp_amount',
          //     handler: async (v)=>{
          //       if(!v) return null;
          //       const amount = utils.layer1.amountToBalance(v);
          //       let estimate = await request.layer1_rpc('bonding_estimateHowMuchTokenBoughtByGivenTea', [
          //         data.id, amount
          //       ]);
          //       estimate = utils.layer1.balanceToAmount(estimate);
          //       return estimate;
          //     }
          //   }
          // }
        },
      },
      cb: async (form, close)=>{
        if(!form.tapp_amount){
          self.$root.showError('Amount token is required.');
          return;
        }

        
        const id = form.tapp_id;
        const amount = utils.layer1.amountToBalance(form.tapp_amount);

        const need_price = sq_root.calculate_buy_amount(amount, data.ori.total_supply, data.ori.buy_curve_k);
        const estimate = utils.layer1.balanceToAmount(need_price);
        
        try{
          await self.$confirm(`You will pay <b>${estimate} TEA</b> <br/> Please click "OK" to confirm.`, {
            dangerouslyUseHTMLString: true,
          });
        }catch(e){
          return false;
        }
        
        self.$root.loading(true);
        try{
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,

            targetTappIdB64: id,
            tokenAmount: utils.toBN(amount).toString(),
            authB64: session_key,
          };

          const rs = await txn.txn_request('buy', opts);
          console.log('buyToken result:', rs);

          close();
          self.$root.success();
          // const html = `<div>Token: ${data.ticker}<br/>Price: ${data.buy_price} TEA<br/>Qantity: ${form.tapp_amount}<br/>Total: ${_.toNumber(data.buy_price)*_.toNumber(form.tapp_amount)}<br/></div>`;
          // self.$root.alert_success(html, 'Buy success.');
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  },

  async sellToken(self, data, succ_cb){
    const session_key = user.checkLogin(self);
    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Sell',
        confirm_text: 'Next',
        text: `${utils.consts.gas_tip()}`,
        props: {
          tapp_id: {
            label: 'Token ID',
            type: 'Input',
            disabled: true,
            default: data.id,
          },
          tapp_amount: {
            label: 'Quantity',
            type: 'number',
            max: 100000000,
            // remove_required_rule: true,
            default: 1,
            // tip: 'Click "Next" button to see how much you can convert to, or input a number below to convert back.',
            // model_action: {
            //   button_text: 'Sell all',
            //   handler: async ()=>{
            //     const list = await request.layer1_rpc('bonding_listUserAssets', [
            //       self.layer1_account.address
            //     ]);
            //     const tmp = _.find(list, (arr)=>arr[1]===data.id);
            //     if(!tmp){
            //       return 0;
            //     }
            //     return utils.layer1.balanceToRealAmount(tmp[3][0]);
            //   },
            // },
          },
          // tea: {
          //   label: 'TEA',
          //   type: 'number',
          //   default: undefined,
          //   model_action: {
          //     button_text: 'Convert back',
          //     ref: 'tapp_amount',
          //     handler: async (v)=>{
          //       if(!v) return null;
          //       const amount = utils.layer1.amountToBalance(v);
          //       let estimate = await request.layer1_rpc('bonding_estimateHowMuchTokenToSellByGivenTea', [
          //         data.id, amount
          //       ]);
          //       estimate = utils.layer1.balanceToAmount(estimate);
          //       return estimate;
          //     }
          //   }
          // }
        },
      },
      cb: async (form, close)=>{
        if(!form.tapp_amount){
          self.$root.showError('Amount token is required.');
          return;
        }

        if(data.account_balance && _.toNumber(form.tapp_amount) > data.account_balance.token_balance){
          self.$root.showError('Insufficient token.');
          return;
        }

        const id = form.tapp_id;
        const amount = utils.layer1.amountToBalance(form.tapp_amount);

        const need_price = sq_root.calculate_sell_amount(amount, data.ori.total_supply, data.ori.sell_curve_k);
        const estimate = utils.layer1.balanceToAmount(need_price);
        
        
        try{
          await self.$confirm(`You will receive <b>${estimate} TEA</b> <br/> Please click "OK" to confirm.`, {
            dangerouslyUseHTMLString: true,
          });
        }catch(e){
          return false;
        }

        self.$root.loading(true);
        try{
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,

            targetTappIdB64: id,
            tokenAmount: utils.toBN(amount).toString(),
            authB64: session_key,
          };

          const rs = await txn.txn_request('sell', opts);
          console.log('sellToken result:', rs);

          close();

          self.$root.success();
          // const html = `<div>Token: ${data.ticker}<br/>Price: ${data.sell_price} TEA<br/>Qantity: ${form.tapp_amount}<br/>Total: ${_.toNumber(data.sell_price)*_.toNumber(form.tapp_amount)}<br/></div>`;
          // self.$root.alert_success(html, 'Sell success.');
          await succ_cb();
        }catch(e){
          self.$root.showError(e);
        }
        self.$root.loading(false);
      },
    });
  },

  async sellAllToken(self, data, succ_cb){
    const session_key = user.checkLogin(self);

    try{
      await self.$confirm(`${utils.consts.gas_tip()}<br/>Are you sure to sell all token?`, {
        dangerouslyUseHTMLString: true,
      });
    }catch(e){
      return false;
    }

    self.$root.loading(true);

    const id = data.id;

    try{
      const opts = {
        tappIdB64: base.getTappId(),
        address: self.layer1_account.address,

        targetTappIdB64: id,
        authB64: session_key,
      };

      const rs = await txn.txn_request('sellAll', opts);
      console.log('sellAllToken result:', rs);

      self.$root.success();
      await succ_cb();
    }catch(e){
      self.$root.showError(e);
    }
    self.$root.loading(false);
  },

  async consumeToken(self, data, succ_cb){
    const session_key = user.checkLogin(self);
    
    self.$store.commit('modal/open', {
      key: 'common_form', 
      param: {
        title: 'Consume',
        confirm_text: 'Next',
        props: {
          tapp_id: {
            type: 'Input',
            // disabled: true,
            default: data.id,
          },
          tea: {
            label: 'TEA Amount',
            type: 'number',
            required: true,
            default: 100,
          }
        },
      },
      cb: async (form, close)=>{
        self.$root.loading(true);

        const id = form.tapp_id;
        const tea_amount = utils.layer1.amountToBalance(form.tea);
        
        try{
          const opts = {
            tappIdB64: base.getTappId(),
            address: self.layer1_account.address,
            targetTappIdB64: id,
            teaAmount: utils.toBN(tea_amount).toString(),
            authB64: session_key,
          };

          const rs = await txn.txn_request('consume', opts);
          console.log('consumeToken result:', rs);

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

  // query
  async queryAll(self, succ_cb, param={}){
    // const session_key = user.checkLogin(self);

    self.$root.loading(true);

    const mem_key = 'entity_queryAll_'+utils.crypto.sha256(JSON.stringify(param));
    console.log(111, param, mem_key)
    const cache_result = mem.get(mem_key);
    if(cache_result){
      console.log('[Entity] queryAll cache result => ', cache_result);
      await succ_cb(cache_result);

      self.$root.loading(false);
      return cache_result;
    }
    

    const opts = {
      onlyTapp: param.only_tapp || false,
    };
    if(param.token_id_b64){
      opts.tokenIdHex = param.token_id_b64;
      opts.onlyTapp = false;
    }
    if(param.from){
      opts.from = param.from;
    }

    try{
      const rs = await txn.query_request('queryEntityList', opts);
      const list = await Promise.all(_.map(rs.sql_query_result, async (d)=>{
        const item = {
          id: d.tapp_id,
          name: d.name,
          token_symbol: d.ticker,
          ticker: d.ticker,
          total_supply: utils.layer1.balanceToAmount(d.total_supply),
          buy_price: utils.layer1.balanceToAmount(d.buy_price),
          sell_price: utils.layer1.balanceToAmount(d.sell_price),
          owner: d.owner,
          detail: d.detail,
          host_performance: 2000,  //TODO
          host_current: d.hosts.length,
          host_n: `${d.min_allowed_hosts}/${d.max_allowed_hosts}`,
          is_full: d.hosts.length>=d.max_allowed_hosts,
          active_block: d.start_height,
          status: d.status,
          ori: d,
          consume_account_balance: utils.layer1.balanceToAmount(d.consume_account_balance),
        };
        item.market_cap = utils.layer1.roundAmount(item.sell_price * item.total_supply);
        item.theta = (d.buy_curve_k-d.sell_curve_k)+'%';

        item.account_balance = {};
        _.each(d.account_balance, (v, k)=>{
          item.account_balance[k] = utils.layer1.balanceToAmount(v);
        });
        return item;
      }));
      mem.set(mem_key, list);
      await succ_cb(list);
      
    }catch(e){
      console.log('queryAll error:', e);
    }
    self.$root.loading(false);
  },


};

export default F;