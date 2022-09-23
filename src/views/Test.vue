<template>
<div class="tea-page">
  

  <div style="text-align:left;">
    <!-- <div v-if="layer1_account && $root.is_sudo(layer1_account.address) && user && user.isLogin">
    <h2>ADMIN</h2>
    <el-button type="danger" @click="query_balance_action('5Hq3maxnpUx566bEDcLARMVAnGEqtoV7ytzXbtqieen7dXhs')">DAO-RESERVE Balance</el-button>
    <el-button type="danger" @click="query_special_balance_action(null, '5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy6ftb')">CONSUME-ACCT Balance</el-button>
    <el-button type="danger" @click="query_special_balance_action(null, '5C62Ck4UrFPiBtoCmeSrgF7x9yv9mn38446dhCpsi2mLHiFT')">BONDING-CURVE-ACCT Balance</el-button>
    <br/><br/>
    <el-button type="danger" @click="query_special_balance_action()">Speical Balance</el-button>
    <el-divider />
    </div> -->

    <h2>ETH</h2>
    <el-button type="primary" @click="connectToWallet()">Connect Metamask wallet</el-button>
    <el-button type="danger" @click="getChain()">Query connect chain</el-button>
    <el-button type="danger" @click="queryMaintainerAddressList()">Maintainer list</el-button>
    <el-button type="danger" @click="queryCurrentBlock()">Query current block</el-button>
    <br/><br/>
    <el-button type="primary" @click="topup()">Topup</el-button>
    <el-button type="primary" @click="signMessage()">Sign "tearust"</el-button>
    <el-divider />

    <h2>USER</h2>
    <el-button type="danger" @click="query_asset_action()">Query Asset</el-button>
    <el-button type="danger" @click="query_balance_action()">Query Balance</el-button>

    <!-- <el-button type="primary" @click="topup_action()">Topup 10</el-button> -->
    <el-button type="primary" @click="withdraw_action()">Withdraw 10</el-button>
    <br/><br/>

    <el-divider />

    <h2>TAPP</h2>
    <el-button type="primary" @click="create_new_tapp_action()">Create New TApp</el-button>
    <el-button type="danger" @click="query_all_tapps()">Query all tapps</el-button>

    <el-divider />
    <el-button type="primary" @click="consume_action()">Consume 100</el-button>
    <el-divider />

    <el-button type="primary" @click="fav_tapp()">Fav Tapp</el-button>
    <el-button type="primary" @click="unfav_tapp()">Unfav Tapp</el-button>
    <el-button type="danger" @click="query_fav_tapp_list()">Query my fav tapps</el-button>
    <el-divider />
    
    <h2>SEAT</h2>
    <el-button type="danger" @click="query_seat_list()">Query All seat list</el-button>

    <h2>MINER</h2>

    <h2>LOGS</h2>
    <el-button type="danger" @click="query_op_logs()">Query OP logs</el-button>


    <!-- <el-button type="danger" @click="query_cml_list()">Query CML List</el-button>
    <el-button type="danger" @click="query_cml_details()">Query CML Details</el-button>

    
   
    
    
    
    


    
    <el-button type="primary" @click="host_tapp_action()">Host TApp</el-button>
    <el-button type="primary" @click="unhost_tapp_action()">Unhost TApp</el-button>

    <el-divider />
    <el-button type="primary" @click="buy_token_action()">Buy</el-button>
    <el-button type="primary" @click="sell_token_action()">Sell</el-button>
    <el-button type="primary" @click="consume_token_action()">Consume</el-button>
    

    <el-divider />
    <el-button type="danger" @click="query_balance_action('5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM')">HIDDEN_SYSTEM_ACCOUNT balance</el-button>
    <el-button type="danger" @click="query_balance_action('5HrN7fHLXWcFiXPwwtq2EkSGns9eMt5P7SpeTPewumZy6ftb')">HIDDEN_CONSUME_ACCOUNT balance</el-button>
    <el-divider />

    <el-button type="primary" @click="send_sql_action('')">Send SQL Request</el-button> -->
    <!-- <el-button type="primary" @click="send_consume_dividend_action('')">Test for consume dividend</el-button> -->

    
  </div>
  
</div>
</template>
<script>
import SettingAccount from '../workflow/SettingAccount';
import {_} from 'tearust_utils';
import {helper, numberToHex} from 'tearust_layer1';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';

import PubSub from 'pubsub-js';
import request from '../request';

import layer2 from '../layer2';
import eth from '../eth';

export default {

  data(){
    return {
      form: {
        action: 'test_action',
        payload: '',
        uuid: '',
      },
      result: '',
      is_error: false,
      rules: {
        action: [{required: true}],
        payload: [{required: true}],
        uuid: [{required: true}],
      },

      latest_hash: null,


      layer1: null,
    };
  },

  computed: {
    ...mapState([
      'user', 'bbs',
    ]),
    ...mapGetters([
      'layer1_account'
    ]),
  },

  async mounted(){
    this.$root.loading(true);

    // this.wf = new SettingAccount();
    // await this.wf.init();

    this.layer1 = await eth.get();

    this.$root.loading(false);
    
    
  },

  methods: {
    

    async topup_action(){
      await layer2.user.topupFromLayer1(this, async ()=>{});
    },
    async query_balance_action(acct=null){
      this.$root.loading(true);
      try{
        const rs = await layer2.user.query_balance(this, acct);
        this.$root.alert_success(rs);
      }catch(e){
        layer2.base.top_log(e, 'error');
      }
      this.$root.loading(false);
    },
    async query_special_balance_action(token_id=null, acct=null){
      this.$store.commit('modal/open', {
        key: 'common_form',
        param: {
          title: 'Acct balance',
          text: ``,
          props: {
            tid: {
              type: 'Input',
              label: 'TokenId',
              default: token_id || layer2.base.getTappId(),
            },
            acct: {
              type: 'Input',
              label: 'Acct',
              default: acct || '',
              required: true,
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          try{
            const rs = await layer2.user.query_balance(this, form.acct, form.tid);
            this.$root.alert_success(rs);
          }catch(e){
            layer2.base.top_log(e, 'error');
          }

          close();
          this.$root.loading(false);
          
        }
      });
    },
    async query_asset_action(){
      this.$root.loading(true);
      try{
        await layer2.user.query_asset(this);
      }catch(e){
        layer2.base.top_log(e, 'error');
      }
      this.$root.loading(false);
    },
    
    async withdraw_action(){
      await layer2.user.withdrawFromLayer2(this, 10, async (rs)=>{});
    },

    

    // async add_notification_action(){
    //   this.setLog("start add notification action...");
    //   try{
    //     const rs = await bbs.send_notification(this, '', async (rs)=>{
    //       this.$root.success("Send success");
    //     });
    //   }catch(e){
    //     bbs.log(e);
    //   }
    // },
    // async query_notification_list(){
    //   this.setLog("start query notification list...");

    //   try{
    //     const list = await bbs.getNotificationList(this.layer1_account.address);
    //     console.log(111, list);
    //     bbs.log(JSON.stringify(list));
    //   }catch(e){
    //     bbs.log(e);
    //   }
    // },

    // async send_sql_action(){
    //   this.setLog("start sql test...");
    //   try{
    //     const rs = await bbs.sendSqlRequest(this, async (rs)=>{
    //       this.$root.success("Send sql success");
    //     });
    //   }catch(e){
    //     bbs.log(e);
    //   }
    // },

    // async send_consume_dividend_action(){
    //   this.setLog("start consume dividend action...");
    //   try{
    //     const rs = await bbs.send_consume_dividend_action(this, async (rs)=>{
    //       this.$root.success("consume dividend success");
    //     });
    //   }catch(e){
    //     bbs.log(e);
    //   }
    // },

    async create_new_tapp_action(){
      await layer2.tapp.createNew(this, async (rs)=>{});
    },
    // async host_tapp_action(){
    //   this.setLog("start host tapp...");
    //   alert("real");
    // },
    // async unhost_tapp_action(){
    //   this.setLog("start unhost tapp...");
    //   alert("real");
    // },
    async query_all_tapps(){
      await layer2.entity.queryAll(this, async (list)=>{});
    },
    // async buy_token_action(){
    //   this.setLog("Buy token action...");
    //   alert('real');
    // },
    // async sell_token_action(){
    //   this.setLog("Sell token action...");
    //   alert('real');
    // },
    // async consume_token_action(){
    //   this.setLog("Conusume action...");
    //   try{
    //     await tappstore.consume_token(this, {
    //       id: 101,
    //       ticker: 'DDD',
    //       name: 'ddd',
    //     }, async ()=>{
    //       bbs.log('Consume success');
    //     });
    //   }catch(e){
    //     bbs.log(e);
    //   }
    // },

    // async query_cml_list(){
    //   this.setLog('query cml list ...');

    //   await plant.queryCmlList(this, {});
    // },

    // async query_cml_details(){
    //   this.setLog('query cml details ...');
    //   await plant.queryCmlDetails(this, {
    //     tea_id_b64: '3zjLTxJHkEHI6NI4EJ7yoVCwF/OCIG4k/uky5jfC23s='
    //   });
    // },

    async consume_action(){
      await layer2.entity.consumeToken(this, {id: "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE="}, async ()=>{
        
      })
    },

    async fav_tapp(){
      await layer2.tapp.favTapp(this, {tapp_id: "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE="}, async ()=>{})
    },
    async unfav_tapp(){
      await layer2.tapp.unfavTapp(this, {tapp_id: "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE="}, async ()=>{})
    },
    async query_fav_tapp_list(){
      const list = await layer2.tapp.queryFavTappList(this);
      console.log(1, list);
    },

    async query_seat_list(){
      const list = await layer2.seat.querySeatList(this, {});
      console.log(1, list);
      
    },

    async query_op_logs(){
      const list = await layer2.log.queryOpLogs(this, {
        address: this.layer1_account.address,
        day: 4,
      });

    },

    
    // async query_hash_result(){
    //   const hash = this.latest_hash;

    //   this.setLog("start query hash result...");
    //   try{
    //     const rs = await bbs.query_hash_result(hash);

    //   }catch(e){
    //     bbs.log(e);
    //   }
    // },

    // -------------- eth ------------------
    async connectToWallet(){
      try{
        await this.layer1.requestWalletAddressList();
        const b = await this.layer1.getBalance();
        console.log(11, b);
        alert('Balance is '+b+' ether');
      }catch(e){
        this.$root.showError(e);
      }
      
    },
    async getChain(){
      const {id, name} = await this.layer1.getChain();

      alert('id: '+id+' | name: '+name);
    },

    async queryMaintainerAddressList(){
      const rs = await this.layer1.getMaintainerAddressList();
      console.log(11, rs);
      this.$root.alert_success(rs.join('<br/>'));
    },
    async topup(){
      this.$root.loading(true);
      try{
        const rs = await this.layer1.topup(10);
        this.$root.alert_success();
      }catch(e){
        console.log('error', e);
        this.$root.showError(e.code);
      }
      this.$root.loading(false);
      
    },
    async signMessage(){
      this.$root.loading(true);
      try{
        const rs = await this.layer1.signMessage('tearust');
        this.$root.alert_success(rs);
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    async queryCurrentBlock(){
      const rs = await this.layer1.queryCurrentBlock();
      console.log(11, rs);
    }
    
  }

  
}
</script>