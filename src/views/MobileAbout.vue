<template>
  <div class="tea-page t-mobile_about">
    <h4>Resources</h4>
    <div>
      <a class="t-a" target="_blank" href="https://teaproject.org">Website</a>
      <a class="t-a" target="_blank" href="https://github.com/tearust/teaproject/discussions">Discussions</a>
      <a class="t-a" target="_blank" href="https://github.com/tearust/teaproject/wiki">Wiki</a>
      <a class="t-a" target="_blank" href="https://github.com/tearust">Github</a>
    </div>

    <el-divider/>
    
    <div>
      <b class="lg">
        <span>ETH Chain name :</span> 
        <b>{{chain_name}}</b>
      </b>
      <b class="lg">
        <span>TEA Chain name :</span> 
        <b>{{tea_chain_name}}</b>
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
  
  </div>

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
    ...mapState([
      'chain'
    ]),
  },
  data(){
    return {
      epoch_version: null,
      version: null,
      client_version: null,
      enclave_version: null,

      chain_name: '',
      tea_chain_name: '',
    };
  },
  async mounted(){
    this.epoch_version = utils.get_env('epoch_version');
    this.version = utils.get_env('version');


    this.layer1 = await eth.get();
    const chain = await this.layer1.getChain();
    this.chain_name = chain.name;

    const r = await layer2.log.querySystemVersion(this);
    this.client_version = r.client_version;
    this.enclave_version = r.enclave_version;
    this.tea_chain_name = _.capitalize(r.tea_network);
  },
  methods: {

  }
}
</script>

<style lang="scss">
.t-mobile_about{
  .t-a{
    font-size: 19px;
    display: block;
    color: #35a696;
    text-decoration: underline;
    &:hover{
      color: #ec7259;
    }
  }

  b.lg{
    display: flex;
    justify-content: space-between;
    font-size: 19px;
    font-weight: normal;

    span{
      width:180px;
      display: inline-block;
      text-align: left;
      color: #35a696;
    }
    b{
      display: inline-flex;
      margin-left: 12px;
      flex: 1;
      display: inline-block;
      text-align: right;
      color: #35a696;
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