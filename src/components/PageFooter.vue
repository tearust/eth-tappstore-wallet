<template>
<section class="t-footer bg_2 js_footer">
  <div class="c-m" style="width:1080px;margin:0 auto; position:releative;">

    <el-row style="position:relative;height:170px;">
      <el-col :span="6">
        <h4 class="t-h">Resources</h4>
        <a class="t-a" target="_blank" href="https://teaproject.org">Website</a>
        <a class="t-a" target="_blank" href="https://github.com/tearust/teaproject/discussions">Discussions</a>
        <a class="t-a" target="_blank" href="https://github.com/tearust/teaproject/wiki">Wiki</a>
        <a class="t-a" target="_blank" href="https://github.com/tearust">Github</a>
      </el-col>

      <div style="position:absolute;right:0;bottom:0;">
        <!-- <div class="tlg" v-if="end_block && chain.current_block" :inner-html.prop="epochInfo()"></div> -->
        <b class="lg">
          <span>Chain name :</span> 
          <b>{{chain_name}}</b>
        </b>
        <b class="lg">
          <span>Block Height :</span> 
          <b>{{chain.current_block ? chain.current_block : ''}}</b>
        </b>

        <b class="lg">
          <span>Client version :</span> 
          <b>{{client_version}}</b>
        </b>
        <b class="lg">
          <span>Enclave version :</span> 
          <b>{{enclave_version}}</b>
        </b>

        <b class="lg">
          <span>Epoch version :</span> 
          <b>{{epoch_version}}</b>
        </b>
        <b class="lg">
          <span>Wallet version : </span> 
          <b>{{version}}</b>
        </b>
      </div>
      
    </el-row>

    
    
    <el-divider></el-divider>
    <p style="margin:0 auto;text-align:center;font-size:16px;">Copyright © 2019-2023 <b>TeaProject.org</b> All Rights Reserved</p>
  </div>
</section>

</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Base from '../workflow/Base';
import _ from 'lodash';
import utils from '../tea/utils';
import eth from '../eth';
import layer2 from '../layer2';
export default {
  computed: {
    // ...mapGetters(['layer1_account']),
    ...mapState([
      'chain'
    ]),
  },
  data(){
    return {
      epoch_version: null,
      version: null,
      end_block: null,
      client_version: null,
      enclave_version: null,

      chain_name: '',
    };
  },
  async mounted(){
    this.epoch_version = utils.get_env('epoch_version');
    this.version = utils.get_env('version');

    this.end_block = utils.getEpochEndBlock();

    this.layer1 = await eth.get();
    const chain = await this.layer1.getChain();
    this.chain_name = chain.name;

    const r = await layer2.log.querySystemVersion(this);
    this.client_version = r.client_version;
    this.enclave_version = r.enclave_version;
  },
  methods: {
    epochInfo(){
      const n = this.end_block-this.chain.current_block;
      if(n<1){
        return 'Current epoch ended.';
      }

      return `Current epoch will end in <b>${n}</b> blocks`;
    }
  }
}
</script>
<style lang="scss">
.t-footer{
  padding: 24px 0 40px;
  // position: fixed;
  // width: 100%;
  // bottom: 0;
  background: rgb(53, 166, 150);

  *{
    color: #fff;
  }

  .t-h{
    margin: 0 0 20px 0;
    text-align: left;
    font-size: 21px;
  }
  .t-a{
    font-size: 19px;
    display: table;
    &:hover{
      color: #ec7259;
    }
  }

  .tlg{
    position: absolute;
    top: -30px;
    right: 0;
    width: 500px;
    text-align: right;
  }

  b.lg{
    display: flex;
    justify-content: space-between;
    width: 240px;
    font-size: 19px;
    font-weight: normal;

    span{
      width:150px;
      display: inline-block;
      text-align: right;
    }
    b{
      display: inline-flex;
      margin-left: 12px;
      flex: 1;
      display: inline-block;
      text-align: right;
    }
  }
}
@media screen and (max-width : 600px) {
  .t-footer{
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>