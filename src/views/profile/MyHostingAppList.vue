<template>
<div class="tea-page">

  <TeaTable
    :data="list || []"
    v-loading="table_loading"
    name="my_hosting_tapps_list_table"
  >
    
    <el-table-column
      prop="tapp_id"
      width="90"
      sortable
      label="TApp ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>
      
    <el-table-column
      label="TApp Name"
      width="100"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="openTo(scope.row)">{{scope.row.name}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="Ticker"
      width="80"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.token_symbol}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="host_performance"
      label="Host performance requirement"
      width="150"
    />

    <el-table-column
      prop="cml_id"
      width="100"
      sortable
      label="CML ID"
    >
      <template slot-scope="scope">
        <el-button type="text" @click="$root.go_wallet('/cml_details/'+scope.row.cml_id)">{{scope.row.cml_id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="Remaining performance"
    >
      <template slot-scope="scope">
        {{scope.row.cml.remaining_performance}}
      </template>
    </el-table-column>

    <el-table-column
      label="My hosting token"
      width="110"
    >
      <template slot-scope="scope">
        {{scope.row.ori.hosting_amount}}
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
        
      </template>
    </el-table-column>


  </TeaTable>

</div>
</template>
<script>
import SettingAccount from '../../workflow/SettingAccount';
import {_} from 'tearust_utils';
// import {helper} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
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
      list: null,

      table_loading: false,

    }
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  

  async mounted(){
    this.wf = new SettingAccount();
    await this.wf.init();

    await this.refreshList();

    utils.register('refresh-current-account__my_hosting', async (key, param)=>{
      await this.refreshList();   
    });
  },

  methods: {
    async refreshList(){
      
      helper.tableLoading(this, true);
      const cml_list = _.filter(this.layer1_account.cml, (item)=>{
        return item.status === 'Mining';
      });

      await layer2.entity.queryAll(this, async (list)=>{
        const x_list = [];
        _.each(list, (item)=>{

          _.each(item.ori.hosts, (d)=>{
            const tmp = _.find(cml_list, (x)=>x.id===d.cml_id);
            if(tmp){
              item.cml_id = d.cml_id;
              item.cml = tmp;
              item.host_performance = 'todo';
              x_list.push(item);
              
            }
          });
          
        });

        this.list = x_list;
        console.log(111, this.list);
        helper.tableLoading(this, false);
      });

      
    },
    // openTo(row){
    //   tappstore.showTAppLink(this, row);
    // },
    async showDetails(scope){
      helper.showDetailsModal(this, scope.row.id);
    },

    // async unhostApp(scope){
    //   const tapp_id = scope.row.id;
    //   const cml_id = scope.row.cml_id;

    //   try{
    //     await this.$confirm(`Your CML ${cml_id} will no longer host this TApp, continue?`, 'Unhost');
    //   }catch(e){
    //     this.$root.loading(false);
    //     return;
    //   }

    //   await tappstore.unhostTApp(this, {
    //     tapp_id, 
    //     cml_id,
    //   }, async ()=>{
    //     await this.refreshList();
    //   });
    //   this.$root.loading(false);
    // }
    

  }

  
}
</script>
