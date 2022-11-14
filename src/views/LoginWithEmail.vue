<template>
<div class="tea-page">
  <!-- <p style="font-size: 28px;" v-if="user && user.isLogin">Login success. account is "{{user.address}}"</p>

  <div v-if="!user || !user.isLogin" style="text-align:center;">
    <p>You must login first to continue.</p>
    <el-button style="width: 200px;" type="primary" size="large" @click="loginHander()">Click to login</el-button>
  </div> -->

  <el-steps :active="step" simple>
    <el-step title="Send OTP"></el-step>
    <el-step title="Verify OTP"></el-step>
  </el-steps>

  <div class="t-step" v-if="step===1">
    <p></p>

    <el-form :model="form_1" label-width="220px" :rules="rules" ref="form_1" class="tea-modal">
      <el-form-item label="Email address" prop="email">
        <el-input style="width:100%;" placeholder="Please input your email address" v-model="form_1.email"></el-input>
      </el-form-item>

    </el-form>

    <div style="text-align:right; margin-top: 20px">
      <el-button type="primary" size="small" @click="sendOTP()">
        Send OTP
      </el-button>
    </div>
  </div>

  <div class="t-step" v-if="step===2">
    <p></p>

    <el-form :model="form_2" label-width="220px" :rules="rules" ref="form_2" class="tea-modal">
      <el-form-item label="Email address">
        <el-input style="width:100%;" :disabled="true" :value="form_1.email"></el-input>
      </el-form-item>
      <el-form-item label="OTP" prop="otp">
        <el-input style="width:100%;" placeholder="" v-model="form_2.otp"></el-input>
      </el-form-item>

    </el-form>

    <div style="text-align:right; margin-top: 20px">
      <el-button type="primary" size="small" @click="loginWithOtp()">
        Login with OTP
      </el-button>
    </div>
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
      step: 1,
      form_1: {
        email: null,
      },
      form_2: {
        otp: null,
      },
      rules: {
        email: [{required: true}],
        otp: [{required: true}]
      }
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
      // await layer2.user.showLoginModal(this, ()=>{
      //   this.$root.goPath('/account_profile');
      // });
      
    },
    async sendOTP(){
      const ref = this.$refs["form_1"];
      await ref.validate();

      const email = this.form_1.email;
      this.$root.loading(true);
      const rs = await layer2.user.sendOtpForEmail(this, email);
      if(rs.status){
        this.step = 2;
      }
      this.$root.loading(false);
    },
    async loginWithOtp(){
      const ref = this.$refs["form_2"];
      await ref.validate();

      const param = {
        email: this.form_1.email,
        otp: this.form_2.otp,
        msg: 'consume_move',
      };

      this.$root.loading(true);
      const rs = await layer2.user.loginWithEmail(this, param);
      console.log(11, rs);

      this.$root.loading(false);
    }
  }
};
</script>
<style lang="scss" scoped>
.t-step{
  &>p{
    margin: 20px 0 5px;
  }
}
</style>