<template>
<div class="c-pageheader">

<el-menu active-text-color="#35a696" :default-active="activeIndex" class="p-header" @select="handleSelect" mode="horizontal">
  <a href="javascript:void(0)" onClick="location.reload()" style="float:left;">
    <el-image
      src="https://wallet.teaproject.org/tea_logo/logo.png"
      fit="fit">
    </el-image>
    <span style="
        position: absolute;
        color: #35a696;
        font-size: 20px;
        left: 84px;
        top: 24px;
        font-weight: bold;
    ">Techspring2023</span>
  </a>
  

  <el-menu-item><a href="https://www.baidu.com/" target="_blank">{{'White-pager'}}</a></el-menu-item>

  <el-menu-item index="/bank/sgd">{{'Singapore'}}</el-menu-item>
  <el-menu-item index="/bank/hkd">{{'Hongkong'}}</el-menu-item>
  <el-menu-item index="/bank/inr">{{'India'}}</el-menu-item>
  


  <!-- <el-menu-item index="/discover">{{'TApps'}}</el-menu-item> -->

  <el-menu-item index="/welcome">{{'Home'}}</el-menu-item>
  
</el-menu>

<div class="t-state x_2"></div>



</div>
  

</template>
<script>
import {mapGetters, mapState} from 'vuex';
import _ from 'lodash';
import utils from '../tea/utils';

export default {
  data() {
    return {
      activeIndex: null,
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


    
  },
  async mounted(){
    

    
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