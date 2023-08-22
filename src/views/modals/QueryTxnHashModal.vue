<template>

  <el-dialog
    :title="!param.query ? 'Export txn details': 'Query txn hash'"
    :visible="visible"
    width="60%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <!-- <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i> -->

<div v-if="!loading && param">
  <div v-if="step===1">
    <span style="font-size:15px;" v-if="!param.query">You can copy the following json string to others to verify the txn.</span>

    <span style="font-size:15px;" v-if="param.query">Please input or paste the txn details and click <b style="color:#35a696;">Next</b> button.</span>
    <vue-json-editor 
      style="margin-top:5px;"
      v-model="json" 
      :modes="['text', 'code']"
      :showBtns="false" 
      :expandedOnStart="true"
      mode="text"
      @has-error="onJsonError"
      @json-change="onJsonChange" />
    
    <span v-if="json_error" style="color:red;">JSON {{json_error}}</span>
  </div> 
      
  <div v-if="step===2">
    <span style="font-size:15px;">The txn hash is <b style="color:#35a696;">{{json_hash}}</b></span><br/>
    <span style="font-size:15px;">Please click the <b style="color:#35a696;">Confirm</b> buton to query the transaction execution time.</span>
  </div>


</div>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="close()">Close</el-button>
      
      <el-button v-if="step===1 && param.query" :disabled="!json || json_error" type="primary" size="small" @click="click_check_hash()">Next</el-button>

      <el-button v-if="step===2 && param.query" type="primary" size="small" @click="click_confirm()">Confirm</el-button>
      
    </span>

  </el-dialog>


</template>
<script>
import { mapState, mapGetters } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import TeaIconButton from '../../components/TeaIconButton';
import VueJsonEditor from 'vue-json-editor';

import layer2 from '../../layer2';

export default {
  components: {
    TeaIconButton,
    VueJsonEditor,
  },
  data(){
    return {
      
      loading: true,
      json: null,
      json_error: null,
      step: 1,

      json_hash: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible:state => store.state.modal.query_hash.visible,
      param: state => store.state.modal.query_hash.param,
    }),
  },

  methods: {
    

    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      this.json = this.param.json;
      this.loading = false;
    },

    close(){
      this.loading = true;
      this.json = null;
      this.json_error = null;
      this.json_hash = null;
      this.step = 1;
      this.$store.commit('modal/close', 'query_hash');
    },

    
    onJsonChange(v){
      this.json_error = null;
    },
    onJsonError(e){
      this.json_error = e.toString();
    },

    async click_check_hash(){
      const row = this.json;
      await layer2.log.check_hash(this, row, async (hash)=>{
        this.json_hash = hash;
        this.step = 2;
      });
    },
    async click_confirm(){
      const cb = utils.mem.get('query_hash');
      await cb(this.json_hash, this.close);
    }
    
  }
}
</script>