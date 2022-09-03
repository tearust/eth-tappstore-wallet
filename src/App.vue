<template>
  <div id="app">
    <PageHeader />
    <section class="tea-section">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
      
    </section>
    
    <PageFooter />

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
import PageHeader from './components/PageHeader';
import PageFooter from './components/PageFooter';

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
    PageHeader,
    PageFooter,

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
</style>
