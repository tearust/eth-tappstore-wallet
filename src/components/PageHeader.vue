<template>
<div class="c-pageheader">

<el-menu active-text-color="#35a696" :default-active="activeIndex" class="p-header" @select="handleSelect" mode="horizontal">
  <a href="javascript:void(0)" onClick="location.reload()" style="float:left;">
    <el-image
      src="https://wallet.teaproject.org/tea_logo/logo.png"
      fit="fit">
    </el-image>
    
  </a>
  


  <div style="margin-left: 20px;" class="el-menu-item">
    <el-tooltip v-if="layer1_account.address" effect="light" :content="layer1_account.address">
    <div style="
      display: inline-block;
      font-size: 14px;
      color: #fff;
      background: #35a696;
      padding: 0 8px;
      height: 32px;
      line-height: 32px;
      border-radius: 4px;
      width: 120px;
      text-overflow: ellipsis;
      overflow: hidden;
      position: relative;
    ">{{layer1_account.address}}</div></el-tooltip>

    <el-button style="margin-left: 10px; font-size: 17px;" @click="loginOrLogout()" type="text">{{user ? 'Logout' : 'Login'}}</el-button>
  </div>
  

  <el-menu-item index="/log">{{'Log'}}</el-menu-item>

  
  <el-menu-item index="/welcome">{{'Help'}}</el-menu-item>
  
  
  <el-menu-item index="/account_profile">{{'Account'}}</el-menu-item>
  
  <!-- <el-menu-item index="/log">{{'Log'}}</el-menu-item> -->

  <!-- <el-menu-item index="/my_notification">{{'Inbox'}}</el-menu-item> -->

  <!-- <el-menu-item index="/leader_board">{{'Leaderboard'}}</el-menu-item> -->
  <!-- <el-menu-item index="/top_tree_list">{{'Mining Camellia'}}</el-menu-item> -->

  <!-- <el-menu-item v-if="miner_mode" index="/mining_home">{{'Mining'}}</el-menu-item> -->
  

  <!-- <el-menu-item index="/seat_main">{{'Seats'}}</el-menu-item> -->
  <el-menu-item index="/discover">{{'TApps'}}</el-menu-item>
  <el-menu-item index="/investment">{{'Investments'}}</el-menu-item>
  

  
</el-menu>

<div class="t-state" :class="'x_'+connected"></div>

<div v-if="top_log" style="height: 36px; width: 1080px; margin: 0 auto;">
  <el-alert
    effect="dark"
    @close="top_log=null"
    center
    :closable="true"
    :title="top_log"
    :type="top_log_level">
  </el-alert>
</div>

</div>
  

</template>
<script>
import {mapGetters, mapState} from 'vuex';
import Base from '../workflow/Base';
import _ from 'lodash';
import utils from '../tea/utils';

import layer2 from '../layer2';
import helper from '../views/helper';

import eth from '../eth';
export default {
  data() {
    return {
      activeIndex: null,
      connected: 0,
      has_seed_pool: false,

      all_account: [],
      no_plugin_account: false,

      top_log: null,
      top_log_level: 'error',
    };
  },
  watch: {
    '$route': {
      immediate: true,
      handler (to, from){
        let name = to.path;

        this.activeIndex = name;
      }
    },

  },
  computed: {
    ...mapState([
      'chain', 'user', 'miner_mode',
    ]),
    ...mapGetters(['layer1_account']),
    // ...mapState([
    //   'chain'
    // ]),
  },
  methods: {
    handleSelect(key, keyPath) {
      if(key === 'lang'){
        this.changeLang();
        return false;
      }
      
      if(this.$route.path !== key){
        this.$router.push(key);
      }
      
    },
    changeLang(){
      if(this.$i18n.locale === 'en'){
        window.changeLanguage('zh');
      }
      else{
        window.changeLanguage('en');
      }

    },

    async initAllPluginAccount(wf){
      const layer1_instance = wf.getLayer1Instance();
      let tmp = await wf.getAllLayer1Account();
      tmp = _.map(tmp||[], (item)=>{
        (async ()=>{
          // item.balance = await layer1_instance.getAccountBalance(item.address);
          item.ori_name = _.clone(item.name);
          item.name = item.name + '  -  ' + item.balance;
        })();
        return item;
      });

      if(tmp.length < 1){
        this.no_plugin_account = true;
      }
      else{
        this.no_plugin_account = false;
      }

      this.all_account = tmp;
    },


    async loginOrLogout(){
      if(!this.user){
        layer2.user.showLoginModal(this);
      }
      else{
        layer2.user.logout(this.layer1_account.address);
        this.$root.success('Logout success.');
      }
    },

    initRoutePage(){
      const meta = this.$route.meta;
      const u = this.$store.state.user;
      if(meta && meta.needLogin){
        if(!u){
          this.$router.replace('/login_page');
        }
      }
    },
    
  },
  async mounted(){
    layer2.base.set_global_log(this);
    const id = layer2.base.getTappId();
  

    this.$store.commit('set_bbs', {
      id,
      channel: 'NA',
    });

    let time = 500;
    const wf = new Base();
    await wf.init();
    this.wf = wf;
    const address = await this.wf.layer1.initCurrentAccount();
    this.$store.commit('set_account', {
      ...this.layer1_account,
      address
    });

    const loop = async (cb)=>{
      try{
        
        
        const connected = wf.layer1.isConnected();
        if(connected !== this.connected){
          this.connected = connected;

          if(this.connected === 2){
            
            cb();
          }
          
        }
        
        if(this.connected > 0){
          time = 2000;
        }

      }catch(e){
        this.connected = 0;
      }
     
      _.delay(()=>{
        loop(cb);
      }, time);
    };

    loop(async ()=>{
      utils.mem.set('layer1_ready', true);
      console.log('----- layer1 ready ------');

      await this.$store.dispatch('init_user');

      helper.checkForLayer1UserChanged(this);

      const tapp = {};
      this.$store.commit('set_bbs', {
        id,
        tapp,
      });

      this.initRoutePage();
    });

    utils.register('top_log', (key, param)=>{
      this.top_log = param.top_log;
      this.top_log_level = param.top_log_level;
    });

    
  },

}
</script>
<style lang="scss">
.c-pageheader{
  position: sticky;
  top: 0;
  display: block;
  background: #fff;
  z-index: 99;
  text-align: center;
}

.p-header{
  padding: 0 0 10px;
  width: 1080px;
  margin: 0 auto !important;
  .lg{
    font-size: 20px;
    color: #333;
    position: relative;
    vertical-align: top;
    top: 20px;
    left: 90px;
  }
  .el-image{
    width: 60px; 
    height: 60px;
    width: 90px;
    height: 90px;
    position: absolute;
    top: -10px;
  }
  
}
.el-menu--horizontal > .el-menu-item{
  float: right !important;
  padding: 10px !important;
  font-size: 20px !important;
}
.el-menu--horizontal > .el-submenu{
  float: right !important;
  
}
.el-menu.el-menu--horizontal{
  border-bottom: none;
}

.t-state{
  height: 2px;
  width: 100%;
  display: block;
  
  &.x_0{
    background: red;
  }
  &.x_1{
    background: yellow;
  }
  &.x_2{
    background: #35a696;
  }

}
</style>