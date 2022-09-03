<template>
<div class="tea-page">

  <p style="float:right; margin-bottom: 4px; color: #999;">
    Hosting a TApp is currently disabled and won't be activated until Epoch 11.
  </p>
  <TeaTable
    style="margin-top: 20px;"
    :data="mine_list || []"
    v-loading="table_loading"
    name="my_hosting_tapps_list_table"
  >
    
    <el-table-column
      prop="id"
      label="ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="$root.to_entity_detail(scope.row.id)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>
      
    <el-table-column
      prop="name"
      label="Name"
      width="100"
    >
      <template slot-scope="scope">
        <span>{{scope.row.name}}</span>
        
        
      </template>
    </el-table-column>

    <el-table-column
      prop="token_symbol"
      label="Ticker"
      width="100"
    />

    <el-table-column
      prop="host_performance"
      label="Host performance requirement"
      width="150"
    />

    <el-table-column
      width="100"
      label="CML ID"
    >
      <template slot-scope="scope">
        <!-- <el-button v-if="scope.row.cml_id" style="width:auto;" type="text" @click="$router.push('/cml_details/'+scope.row.cml_id)">{{scope.row.cml_id}}</el-button> -->
        {{scope.row.cml && scope.row.cml_id}}
      </template>
    </el-table-column>



    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">

        <TeaIconButton 
          style="position:relative;top:1px;" 
          tip="Hosting this TApp now. Unhost?" 
          icon="upload" 
          icon_style="font-size:20px;" 
          @click="unhostApp(scope)" 
        />

        <!-- <TeaIconButton v-if="!mine" tip="Host" icon="download" icon_style="font-size:20px;" @click="hostApp(scope)" /> -->
        
      </template>
    </el-table-column>

  </TeaTable>

  <!-- <div style="margin: 32px 0 0;">
    <el-button @click="show_all=!show_all;" type="primary" size="small" style="width: 150px;">
      {{show_all ? 'Hide more TApps' : 'Host more TApps'}}
    </el-button>
  </div> -->

  <TeaTable
    style="margin-top: 10px;"
    :data="not_mine_list || []"
    name="my_hosting_tapps_not_mine_list_table"
    v-if="show_all"
  >
    
    <el-table-column
      prop="id"
      label="ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="$root.to_entity_detail(scope.row.id)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>
      
    <el-table-column
      prop="name"
      label="Name"
      width="100"
    >
      <template slot-scope="scope">
        <span>{{scope.row.name}}</span>
        
        
      </template>
    </el-table-column>

    <el-table-column
      prop="token_symbol"
      label="Ticker"
      width="100"
    />

    <el-table-column
      prop="host_performance"
      label="Host performance requirement"
      width="150"
    />

    <el-table-column
      width="100"
      label="CML ID"
    >
      <template slot-scope="scope">
        <!-- <el-button v-if="scope.row.cml_id" style="width:auto;" type="text" @click="$router.push('/cml_details/'+scope.row.cml_id)">{{scope.row.cml_id}}</el-button> -->
        {{scope.row.cml && scope.row.cml_id}}
      </template>
    </el-table-column>



    <el-table-column
      label="Actions"
      width="120">
      <template slot-scope="scope">


        <TeaIconButton tip="Host" icon="download" icon_style="font-size:20px;" @click="hostApp(scope)" />
        
      </template>
    </el-table-column>

  </TeaTable>


</div>
</template>
<script>
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString, stringToHex, hexToU8a, compactAddLength, u8aToHex} from 'tearust_layer1';
import TeaTable from '../../components/TeaTable';
import TeaIconButton from '../../components/TeaIconButton';
import helper from '../helper';

import layer2 from '../../layer2';
export default {
  components: {
    TeaTable,
    TeaIconButton,
  },
  data(){
    return {
      table_loading: false,

      cml_candidate_list: [],

      mine_list: null,
      not_mine_list: null,

      show_all: false,
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

    await this.refresh();

    utils.register('page-mining-my_host', async ()=>{
      await this.refresh();
    });
  },
  methods: {
    async refresh(){
      this.$root.loading(true);

      const cml_all_list = await layer2.miner.queryCmlList(this, {
        owner: this.layer1_account.address,
      });
      const cml_list = _.filter(cml_all_list, (item)=>{
        return item.layer2 && item.layer2.entity_id;
      });
      this.cml_candidate_list = cml_list;

      await layer2.entity.queryAll(this, async (list)=>{
        const mine_list = [];
        const not_mine_list = [];
        _.each(list, (item)=>{
          let flag = false;
          _.each(item.ori.hosts, (d)=>{
            const tmp = _.find(cml_list, (x)=>x.id===d.cml_id);
            if(tmp){
              item.cml_id = d.cml_id;
              item.cml = tmp;
              // item.host_performance = 'todo';
              mine_list.push(item);
              flag = true;
            }

          });
          if(!flag){
            not_mine_list.push(item);
          }
        });

        this.mine_list = mine_list;
        this.not_mine_list = not_mine_list;

        this.$root.loading(false);
      }, {
        only_tapp: true,
      });
    },
    async unhostApp(scope){
      const cml_id = scope.row.cml_id;
      const tapp_id = scope.row.id;
      try{
        await this.$confirm(`Your CML ${cml_id} will no longer host this TApp, continue?`, 'Unhost');
      }catch(e){
        this.$root.loading(false);
        return;
      }

      await layer2.tapp.unhostTApp(this, {
        tapp_id, 
        cml_id,
      }, async ()=>{
        
        await this.refresh();
      });

    },
    async hostApp(scope){
      await layer2.tapp.hostTApp(this, {
        tapp: scope.row,
        cml_id_list: _.map(this.cml_candidate_list, (x)=>x.id),
      }, async (rs)=>{
        this.$root.success();
        await this.refresh();
      });
    }
  }
}
</script>