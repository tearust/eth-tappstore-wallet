<template>
<div class="tea-page">

  <div class="tea-card">
    <i class="x-icon ">
      <img src="fav.png" />
    </i>
    

    <div class="x-list" style="width:100%;">
      <div class="x-item">
        <b>{{'Name' | cardTitle}}</b>
        <span>{{layer1_account ? layer1_account.name : ''}}</span>
      </div>
      <div class="x-item">
        <b>{{'Address' | cardTitle}}</b>
        <span>
          <font class="js_need_copy">{{layer1_account ? layer1_account.address : ''}}</font>
          <!-- <span title="copy" data-clipboard-target=".js_need_copy" style="margin-left: 5px;" class="iconfont tea-icon-btn icon-copy js_copy"></span> -->
          <!-- <span @click="showAddressQrcode(layer1_account.address)" style="margin-left: 5px;" title="qrcode" class="iconfont tea-icon-btn icon-qr_code"></span> -->
          
        </span>

      </div>
      <div class="x-item">
        <b>{{'My main wallet' | cardTitle}}</b>
        <span :inner-html.prop="layer1_account ? layer1_account.balance : '' | teaIcon"></span>
      

        
      </div>

      <div class="x-item">
        <b>{{'My TeaParty balance'}}</b>
        <span style="margin-right: 34px;" :inner-html.prop="tapp_balance===null ? '...' : tapp_balance | teaIcon"></span>

        <el-button size="mini" type="primary" plain icon="el-icon-refresh" circle @click="refreshTappBalanceHandler()" style="top:2px; right:0; position:absolute;"></el-button>
      </div>
      

     

      <div class="x-bottom">

        <el-button :disabled="!tapp_balance" @click="withdrawHandler()">Withdraw</el-button>


        <el-button v-if="layer1_account" @click="rechargeHandler()">Topup</el-button>

        


      </div>

    </div>

    <!-- <div class="x-right">
      
    </div> -->

  </div>
  



  <div style="position: relative; padding: 20px 0 40px;">
    <el-tabs tab-position="top" style="margin-top: 32px;" v-model="tab" @tab-click="clickTab(tab)">

      <el-tab-pane label="My Camellia" name="my_cml" :lazy="true">
        <MyCmlList />
      </el-tab-pane>
      <el-tab-pane label="My investment in TApps" name="my_app" :lazy="true">
        <MyAppList />
      </el-tab-pane>

      <el-tab-pane label="My hosting TApps" name="my_hosting" :lazy="true">
        <MyHostingAppList />
      </el-tab-pane>

  
    </el-tabs>

    <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="clickRefreshBtn(true)" style="top: 52px;"></el-button>
  </div>

  

</div>
</template>
<script>
import Vue from 'vue';
import SettingAccount from '../workflow/SettingAccount';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';

import MyAppList from './profile/MyAppList';
import MyHostingAppList from './profile/MyHostingAppList';
import MyCmlList from './profile/MyCmlList';

import PubSub from 'pubsub-js';
import ClipboardJS from 'clipboard';
import TeaIconButton from '../components/TeaIconButton';


import layer2 from '../layer2';

export default {
  components: {

    TeaIconButton,
    MyAppList,
    MyHostingAppList,
    MyCmlList,
  },
  data(){
    return {
      tab: 'my_cml',
      tapp_balance: null,
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },

  async created(){
    this.initCopyEvent();
  },
  beforeDestroy(){
    this.clipboard && this.clipboard.destroy();
  },
  
  async mounted(){
    layer2.base.set_global_log(this);

    this.$root.loading(true);

    this.wf = new SettingAccount();
    await this.wf.init();
    await this.refreshAccount();

    this.$root.loading(false);

    utils.register('refresh-current-account__account', async (key, param={})=>{
      await this.refreshAccount();
      if(param.tab && this.tab !== param.tab){
        this.tab = param.tab;
      }
    });
  
  },

  methods: {
    showSelectLayer1(){
      this.wf.showSelectLayer1Modal();
    },


    async rechargeHandler(){
      layer2.user.topupFromLayer1(this, async ()=>{
        this.$root.success("Topup success.");

        await utils.sleep(2000);
        this.$root.loading(true, "Waiting for refresh balance...");
        await utils.sleep(8000);

        await this.refreshTappBalanceHandler();
      });
    },

    async withdrawHandler(){
      try{
        layer2.user.withdrawFromLayer2(this, 1, async ()=>{
          await utils.sleep(2000);
          this.$root.loading(true, "Waiting for refresh balance...");
          await utils.sleep(12000);
          await this.refreshTappBalanceHandler();
          // this.$root.loading(false);
        });
      }catch(e){
        this.$root.showError(e);
      }
      
    },

    async refreshAccount(flag=false){
      flag && this.$root.loading(true);
      await this.wf.refreshCurrentAccount();

      const layer1_account = this.layer1_account;

      await this.queryTokenBalance();
      
      
      flag && this.$root.loading(false);
    },

    async refreshTappBalanceHandler(){
      this.$root.loading(true, 'Refresh tapp balance...');
      await this.queryTokenBalance();
      this.$root.loading(false);
    },

    async queryTokenBalance(){
      try{
        this.tapp_balance = await layer2.user.query_balance(this);
      }catch(e){
        console.error(e);
      }
      
    },


    async transferBalance(){
      const layer1_instance = this.wf.getLayer1Instance();

      this.$store.commit('modal/open', {
        key: 'transfer_balance',
        param: {},
        cb: async (form, closeFn)=>{
          this.$root.loading(true);
          try{
            const {address, amount} = form;

            await this.wf.transferBalance(address, amount);

            closeFn();
            await this.refreshAccount();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },

    clickTab(tab){
      // utils.publish(tab, {});
      utils.publish('refresh-current-account__'+tab);
    },

    clickRefreshBtn(){
      utils.publish('refresh-current-account__account');
      utils.publish('refresh-current-account__'+this.tab);
    },

    

    showAddressQrcode(address){
      PubSub.publish('tea-qrcode-modal', {
        info: null,
        visible: true,
        text: address,
      });
    },

    initCopyEvent(){
      const clipboard = new ClipboardJS('.js_copy');
      this.clipboard = clipboard;
      clipboard.on('success', (e)=>{
        e.clearSelection();
        this.$root.success('Copied');
      });

      clipboard.on('error', (e)=>{
      });
    },

    
    
  }

  
}
</script>

<style lang="scss">
.tea-page{
  .t-major-financial{
    margin-top: 5px;
    text-align: right;
    padding-right: 8px;

    b{
      color: #35a696;
    }
    span{
      margin: 0 5px;
      color: #c9c9c9;
    }
    span.iconfont{
      color: #35a696;
      margin: 0;
    }
  }
}

</style>