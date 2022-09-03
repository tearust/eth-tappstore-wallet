<template>
<div class="tea-page">
  <!-- <h4>MINING</h4> -->
  <div style="position: relative; padding: 0 0 40px;">
    <el-tabs tab-position="top" style="margin-top: 32px;" v-model="tab" @tab-click="clickTab(tab)">

      <el-tab-pane label="My CMLs" name="my_cml" :lazy="true">
        <MyMiningCmlList />
      </el-tab-pane>

      <el-tab-pane label="My hosted TApps" name="my_host" :lazy="true">
        <MyHostedApp />
      </el-tab-pane>

      <!-- <el-tab-pane label="Reward" name="reward" :lazy="true">
        <MyMiningReward />
      </el-tab-pane> -->
      
    </el-tabs>

    <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="clickRefreshBtn()" style="top: 0;"></el-button>
  </div>
</div>
</template>
<script>
import Base from '../workflow/Base';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';

import MyMiningReward from './tabs/MyMiningReward.vue';
import MyMiningCmlList from './tabs/MyMiningCmlList.vue';
import MyHostedApp from './tabs/MyHostedApp.vue';

export default {
  components: {
    MyMiningCmlList,
    MyMiningReward,
    MyHostedApp,
  },
  data(){
    return {
      tab: 'my_cml',
    };
  },
  async mounted(){
    // utils.register('refresh-current-account__account', async (key, param={})=>{
    //   await this.clickRefreshBtn();
    // });
  },
  methods: {
    clickTab(val){
      this.tab = val;
    },
    async clickRefreshBtn(){
      utils.publish('page-mining-'+this.tab, {});
    }
  }
}
</script>