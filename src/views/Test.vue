<template>
<div class="tea-page">

  <div style="text-align:left;">
    <h2>HTTP to A_NODE</h2>
    <el-button type="primary" @click="http_user_login()">User login</el-button>
    <br/><br/>
    <el-button type="primary" @click="http_transfer_tea()">Transfer tea</el-button>
    <el-button type="primary" @click="http_query_balance()">Query user balance</el-button>
    <el-button type="primary" @click="http_query_deposit()">Query user deposit</el-button>
    <br/><br/>
    <el-button type="primary" @click="http_query_system_version()">Query system version</el-button>
    <el-button type="primary" @click="http_query_tapp_metadata()">Query tapp metadata</el-button>

    <!-- <el-divider />
    <div v-if="layer1_account && user && user.isLogin">
      <h2>Admin Query</h2>
      
      <el-button type="danger" @click="queryExpiredWithdraw()">Query expired withdraws</el-button>
      <el-button type="danger" @click="queryExpiredCmls()">Query expired mint cmls</el-button>
    </div>

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

    <el-button type="primary" @click="topup_action()">Topup 10</el-button>
    <el-button type="primary" @click="withdraw_action()">Withdraw 10</el-button>
    <br/><br/>

    <el-divider /> -->

    
  </div>
  
</div>
</template>
<script>
import SettingAccount from '../workflow/SettingAccount';
import {_} from 'tearust_utils';
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

  async created(){
    
  },

  async mounted(){
    this.$root.loading(true);

    this.wf = new SettingAccount();
    await this.wf.init();

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

    

    

    

    

    // -------------- eth ------------------
    async connectToWallet(){
      try{
        await this.layer1.requestWalletAddressList();
        const b = await this.layer1.getTeaBalance();
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
      // const rs = await this.layer1.getMyCmlList();

      const list = await this.layer1.scheduleListForVesting();

      // await this.layer1.releaseTeaForVesting(list[0].schedule_id, 1);
    },

    async query_active_miners(){
      const list = await layer2.log.queryActiveMiners(this);
      console.log(1, list);
    },

    async queryExpiredWithdraw(){
      let list = await layer2.log.queryExpiredWithdraw(this);
      this.$root.alert_success(JSON.stringify(list));
    },

    async queryExpiredCmls(){
      let list = await layer2.log.queryExpiredCmls(this);
      this.$root.alert_success(JSON.stringify(list));
    },


    async http_user_login(){
      this.a_node = true;
      await layer2.user.showLoginModal(this, async ()=>{
        this.a_node = false;
      });
      
    },
    async http_query_balance(){
      this.a_node = true;
      const r = await layer2.user.query_balance_with_ts(this);
      alert(JSON.stringify(r));
      this.a_node = false;

    },
    async http_query_deposit(){
      this.a_node = true;
      try{
        const r = await layer2.user.query_deposit_with_ts(this);
        alert(JSON.stringify(r));
      }catch(e){
        alert(this.$root.processError(e));
      }
      
      this.a_node = false;
    },
    async http_query_system_version(){
      const r = await layer2.log.querySystemVersion(this, {a_node: true});
      alert(JSON.stringify(r));
    },
    async http_query_tapp_metadata(){
      const r = await layer2.tapp.query_meta_data(this, {a_node: true});
      alert(JSON.stringify(r));
    },
    async http_transfer_tea(){
      await layer2.user.transferTea(this, {a_node: true}, async ()=>{
        
      });
    }


    
  }

  
}
</script>