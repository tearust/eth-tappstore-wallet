<template>
  <el-dialog
    title="Login"
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i>

    <div v-if="!loading" style="text-align:left;">
      <div style="font-size: 15px;" v-if="layer1_account.address">

        <h4>Please confirm the following permissions:</h4>

        <div>
          <el-tooltip content="Allow TApp to view your token balances" effect="light" placement="top"><el-checkbox v-model="read" disabled>Read</el-checkbox></el-tooltip>
          <el-tooltip content="Allow TApp to transfer your funds within app to another account" effect="light" placement="top"><el-checkbox v-model="move">Transfer</el-checkbox></el-tooltip>
          <el-tooltip content="Allow TApp to withdraw your app funds back to your main wallet" effect="light" placement="top"><el-checkbox v-model="withdraw">Withdraw</el-checkbox></el-tooltip>
          <el-tooltip content="Allow TApp to spend your app funds" effect="light" placement="top"><el-checkbox v-model="consume">Spend</el-checkbox></el-tooltip>
          <el-tooltip content="Allow TApp to manage your various token investments" effect="light" placement="top"><el-checkbox v-model="bonding_curve">Manage investments</el-checkbox></el-tooltip>
        </div>

        <!-- <ul style="margin-top: 32px; list-style:none;padding:0;">
          <li><b>Read</b> : Allow TApp to view your token balances</li>
          <li><b>Transfer</b> : Allow TApp to transfer your funds within app to another account</li>
          <li><b>Withdraw</b> : Allow TApp to withdraw your app funds back to your main wallet</li>
          <li><b>Spend</b> : Allow TApp to spend your app funds</li>
          <li><b>Manage Investments</b> : Allow TApp to manage your various token investments</li>
        </ul> -->
      </div>
      <!-- <el-button v-if="layer1_account.address" type="primary" @click="confirm()">Login</el-button> -->

      <p style="font-size: 16px; color: #f00;" v-if="!layer1_account.address">
        Please select account from Polkadot extention.
      </p>
    </div>
    

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="close()">Cancel</el-button>
      <el-button size="small" type="primary" @click="confirm()">Login</el-button>
    </span>

  </el-dialog>


</template>
<script>
import { mapState, mapGetters } from 'vuex';
import {stringToHex, stringToU8a, hexToU8a, hexToString} from 'tearust_layer1';
import store from '../../store/index';
import utils from '../../tea/utils';
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';

import layer2 from '../../layer2';

export default {
  data(){
    return {
      loading: true,
      form: {
        
      },
      read: true,
      move: true,
      consume: true,
      withdraw: true,
      consume: true,
      bonding_curve: true,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible:state => store.state.modal.login.visible,
      param: state => store.state.modal.login.param,
    })
  },

  methods: {
    reset(){
      this.loading = true;
      this.form = {
        
      };
    },
    close(){
      this.$store.commit('modal/close', 'login');
      _.delay(()=>{
        this.reset();
      }, 500);
    },
    async confirm(){
      const cb = utils.mem.get('login');

      const tmp = [];
      if(this.read) tmp.push('read');
      if(this.move) tmp.push('move');
      if(this.withdraw) tmp.push('withdraw');
      if(this.consume) tmp.push('consume');
      if(this.bonding_curve) tmp.push('bonding_curve');
      if(cb){
        await cb(tmp.join("_"), this.close);
      }
    },
    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      this.loading = false;
    }
  }
}
</script>