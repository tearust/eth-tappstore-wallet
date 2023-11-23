<template>
<div class="c-pageheader">

<el-menu v-if="!is_mobile" active-text-color="#35a696" :default-active="activeIndex" class="p-header" @select="handleSelect" mode="horizontal">
  <a href="javascript:void(0)" onClick="location.reload()" style="float:left;">
    <el-image
      src="https://alpha.teaproject.org/tea_logo/logo.png"
      fit="fit">
    </el-image>
    <span style="
        position: absolute;
        color: #35a696;
        font-size: 20px;
        left: 84px;
        top: 24px;
        font-weight: bold;
    ">TApp Store</span>
  </a>
  


  <div style="margin-left: 20px;" class="el-menu-item">
    <el-tooltip v-if="layer1_account.email || layer1_account.address" effect="light" :content="layer1_account.email || layer1_account.address">
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
    ">{{layer1_account.email || layer1_account.address}}</div></el-tooltip>

    <el-button style="margin-left: 10px; font-size: 17px;" @click="loginOrLogout()" type="text">{{user ? 'Logout' : 'Login'}}</el-button>
  </div>
  

  <el-menu-item v-if="user && user.isLogin && $root.is_sudo(user.address)" index="/admin">{{'Admin'}}</el-menu-item>

  <el-menu-item index="/log">{{'Log'}}</el-menu-item>
  <el-menu-item index="/welcome">{{'Help'}}</el-menu-item>
  <el-menu-item index="/investment">{{'Investments'}}</el-menu-item>
  <el-menu-item v-if="layer1_account && $root.inTokenVestingUserList(layer1_account.address)" index="/token_vesting">{{'TEA Vesting'}}</el-menu-item>
  <el-menu-item index="/account_profile">{{'Account'}}</el-menu-item>
  <el-menu-item index="/discover">{{'TApps'}}</el-menu-item>
  
</el-menu>

<div v-if="is_mobile" style="width:auto;height:60px;display:flex;justify-content:space-between;">
  <div style="
    color: #35a696;
    font-size: 24px;
    font-weight: bold;
    line-height:70px;
  ">
  <img style="width:50px;height:50px;position:relative;top:8px;left:-8px;" src="https://alpha.teaproject.org/tea_logo/logo.png" />
  <span style="position:relative;left:-10px;top:-6px;">TApp Store</span>
  </div>

  <div class="t-xtt" v-if="user && user.isLogin">
    <img :src="$root.get_address_avatar(user.address)" />
  </div>
  <div class="t-xtt" v-if="!user || !user.isLogin" style="cursor:pointer;" @click="loginOrLogout()">
    <img src="../assets/images/11.jpg" />
  </div>

  <i style="display:block;width:60px;height:70px;font-size:40px;text-align:right;line-height:70px;color:#35a696;" class="el-icon-s-operation" @click="openDrawer()"></i>
</div>

<el-drawer
  title=""
  size="60%"
  :append-to-body="true"
  :modal="true"
  :show-close="false"
  :visible.sync="drawer"
  direction="rtl"
  :before-close="handleCloseDrawer">
  <div slot="title" style="display:flex;justify-content:space-between;">
    <div style="
      display: inline-block;
      font-size: 20px;
      color: #35a696;
    ">{{layer1_account.address | short_address}}</div></el-tooltip>

    <el-button style="margin-left:10px;font-size:15px;position:relative;top:-6px;" size="small" @click="loginOrLogout()" type="primary">{{user ? 'Logout' : 'Login'}}</el-button>
  </div>

  <el-menu active-text-color="#35a696" :default-active="activeIndex" @select="handleSelect" mode="vertical">

  <el-menu-item index="/discover">{{'TApps'}}</el-menu-item>
  <el-menu-item index="/account_profile">{{'Account'}}</el-menu-item>
  <el-menu-item v-if="layer1_account && $root.inTokenVestingUserList(layer1_account.address)" index="/token_vesting">{{'TEA Vesting'}}</el-menu-item>
  <el-menu-item index="/investment">{{'Investments'}}</el-menu-item>
  <el-menu-item index="/welcome">{{'Help'}}</el-menu-item>
  <el-menu-item index="/log">{{'Log'}}</el-menu-item>
  <el-menu-item index="/mobile_about">{{'About'}}</el-menu-item>
  <el-menu-item v-if="user && user.isLogin && $root.is_sudo(user.address)" index="/admin">{{'Admin'}}</el-menu-item>

  </el-menu>

</el-drawer>

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

      is_mobile: false,
      drawer: false,
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
      this.closeDrawer();
      
    },
    changeLang(){
      if(this.$i18n.locale === 'en'){
        window.changeLanguage('zh');
      }
      else{
        window.changeLanguage('en');
      }

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

    checkCurrentVersion(){
      layer2.tapp.query_meta_data(this).then((rs)=>{
        console.log(22, rs);
        if(location.hostname !== '127.0.0.1' && rs.cid && !_.includes(location.pathname, rs.cid)){
          alert("Your TApp needs to be updated. Click OK to get the latest version.");
          location.href = location.href.replace(/[a-z0-9]{46}/i, (b)=>{
            return rs.cid;
          });
        }
      });
    },

    openDrawer(){
      this.drawer = true;
    },
    closeDrawer(){
      if(this.is_mobile){
        this.drawer = false;
      }
    },
    handleCloseDrawer(done){
      done();
    }
    
  },
  async mounted(){
    this.is_mobile = this.$root.mobile();
    layer2.base.set_global_log(this);
    const id = layer2.base.getTappId();

    let time = 500;
    const wf = new Base();
    await wf.__init__();
    this.wf = wf;

    let address = await this.wf.layer1.initCurrentAccount();
    let email = null;
    
    if(!address){
      address = 'no_wallet';
      email = utils.cache.get(layer2.user.getOfflineId());
    }
    console.log(11, address, email);
    
    this.$store.commit('set_account', {
      ...this.layer1_account,
      email,
      address
    });

    this.checkCurrentVersion();
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
          time = 1000;
        }

      }catch(e){
        this.connected = 0;
      }
     
      _.delay(()=>{
        loop(cb);
      }, time);
    };

    loop(async ()=>{
      await this.$store.dispatch('init_user');

      helper.checkForLayer1UserChanged(this);

      const tapp = {};
      this.$store.commit('set_bbs', {
        id,
        tapp,
      });

      utils.mem.set('layer1_ready', true);
      console.log('----- layer1 ready ------');

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
.t-xtt{
  width: 32px;
  height: 32px;
  position: absolute;
  top: 20px;
  right: 44px;
  border-radius: 16px;
  overflow: hidden;

  &>img{
    width:32px;
    height:32px;
  }
}
</style>