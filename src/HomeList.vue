<template>
  <div id="app">
    <div class="c-pageheader1">
      <div class="p-header1">
        <a href="javascript:void(0)" onClick="location.reload()" style="float:left;">
          <el-image
            src="https://alpha.teaproject.org/tea_logo/logo.png"
            fit="fit">
          </el-image>
        </a>
      </div>
    </div>

    <section class="tea-section">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
      
    </section>
  

    <DataDetailsModal />
    <LogDetailsModal />
    <CommonTxModal />
    <CommonFormModal />

    <LoginModal />
    <HostTAppModal />
    <TAppDetailsModal />
    <TAppLinkModal />

    <TransferBalanceModal />
  </div>
</template>

<script>

import CommonTxModal from './views/modals/CommonTxModal';
import CommonFormModal from './views/modals/CommonFormModal';
import LogDetailsModal from './views/modals/LogDetailsModal';
import DataDetailsModal from './views/modals/DataDetailsModal';

import LoginModal from './views/modals/LoginModal';
import HostTAppModal from './views/modals/HostTAppModal.vue';
import TAppDetailsModal from './views/modals/TAppDetailsModal.vue';
import TAppLinkModal from './views/modals/TAppLinkModal.vue';
import TransferBalanceModal from './views/modals/TransferBalanceModal';

export default {
  components: {

    CommonTxModal,
    CommonFormModal,
    LogDetailsModal,
    DataDetailsModal,

    LoginModal,
    HostTAppModal,
    TAppDetailsModal,
    TAppLinkModal,

    TransferBalanceModal,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#app .tea-section{
  margin: 0 auto;
  width: 1080px;
  padding: 24px 0 40px;
}

.c-pageheader1{
  position: sticky;
  top: 0;
  display: block;
  background: #fff;
  z-index: 99;
  text-align: center;
}

.p-header1{
  padding: 0 0 10px;
  width: 1080px;
  margin: 0 auto !important;
  height: 50px;
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
</style>
