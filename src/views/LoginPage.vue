<template>
<div class="tea-page">
  <p style="font-size: 28px;" v-if="user">Login success. session key is "{{user.session_key}}"</p>

  <div v-if="!user" style="text-align:center;">
    <p>You must login first to continue.</p>
    <el-button style="width: 200px;" type="primary" size="large" @click="loginHander()">Click to login</el-button>
  </div>
</div>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import SettingAccount from '../workflow/SettingAccount';

import layer2 from '../layer2';
export default {
  data(){
    return {
      
    };
  },
  computed: {
    ...mapState([
      'user',
    ]),
    ...mapGetters([
      'layer1_account',
    ]),
  },
  async mounted(){
    this.wf = new SettingAccount();
    await this.wf.init();
    
  },
  methods: {
    async loginHander(){
      await layer2.user.showLoginModal(this, ()=>{
        this.$root.goPath('/account_profile');
      });
      
    }
  }
};
</script>
