<template>
<div class="tea-page">

  <TeaTable
    :data="list || []"
    name="tapps_list_table"
    style=""
  >
    <TeaTableColumn
      label="ID"
      tip="ID of the TApp"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="toEntityDetail(scope)">{{scope.row.id}}</el-button>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="name"
      label="Name"
      width="100"
      tip="Name of TApp"
    >
      <template slot-scope="scope">
        <span v-if="!scope.row.active_block">{{scope.row.name}}</span>
        <el-button v-if="scope.row.active_block" size="small" type="text" @click="showLink(scope)">{{scope.row.name}}</el-button>
        
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="token_symbol"
      label="Ticker"
      width="100"
      tip="Symbol of TApp"
    />

    <TeaTableColumn
      label="ERC20 address"
      tip="The smart contract address of the TApp"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="(scope.row.erc20_address ||'') | erc20"></span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="market_cap"
      label="Market cap"
      width="120"
      sortable
      tip="Total market capitalization of the TApp's token"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.market_cap | teaIcon"></span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Current/Min/Max hosts"
      tip="The current / minimum needed / maxed allowed mining node hosts for this TApp"
    >
      <template slot-scope="scope">
        {{scope.row.host_current}}/{{scope.row.host_n}}
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="status"
      label="Status"
      width="100"
      tip="The online status of the TApp"
    />

  </TeaTable>

  <div class="tea-legend" style="
    margin-top: 40px;
    position: relative;
  ">
    <ul style="width: 600px; margin-left: -20px;">
      
    </ul>

    <el-button style="width:400px;position:absolute;top:0; right:0;" type="primary" @click="createNewTApp()">Create new TApp</el-button>
  </div>
  
  

</div>
</template>
<script>
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import {stringToHex, u8aToString} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString} from 'tearust_layer1';
import TeaTable from '../../components/TeaTable';
import TeaTableColumn from '../../components/TeaTableColumn';
import TeaIconButton from '../../components/TeaIconButton';

import layer2 from '../../layer2';
import helper from '../helper';

export default {
  components: {
    TeaTable,
    TeaIconButton,
    TeaTableColumn,
  },
  data(){
    return {
      list: null,

    }
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.wf = new Base();
    await this.wf.init();


    await this.refreshList();

    utils.register('page-discover-tapp', async ()=>{
      await this.refreshList();
    });
  },

  methods: {
    async refreshList(){
      this.$root.loading(true);
      try{
        await layer2.entity.queryAll(this, async (list)=>{
          console.log(111, list);
          this.list = list;
        }, {
          only_tapp: true,
        });
      }catch(e){
        console.error(e);
        helper.checkReturnWithError(this, e);
      }
      
      this.$root.loading(false);
    },
    showLink(scope){
      
    },
    toEntityDetail(scope){
      this.$root.goPath('/entity/'+encodeURIComponent(scope.row.id));
    },
    
    async createNewTApp(){
      try{
        await layer2.tapp.createNew(this, async (rs)=>{
          this.$root.success("create tapp success");
          await this.refreshList();
        });
      }catch(e){
        this.$root.showError(e);
      }

    },

    

  }
};

</script>

