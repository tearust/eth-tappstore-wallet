<template>
<div class="tea-page">

  <h4>Top mining CML list</h4>
  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

  <!-- <span>
    Total current performance : <b style="color: #35a696">{{total_current_performance}}</b>.
    Total remaining performance : <b style="color: #35a696">{{total_remaining_performance}}</b>.
  </span> -->
  <TeaTable 
    :data="list || []"
    name="top_mining_cml_list_table"
  >
    <el-table-column
      prop="id"
      sortable
      width="90"
      label="CML ID"
    >
      <template slot-scope="scope">
        <el-button type="text" @click="$router.push('/cml_details/'+scope.row.id)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>
    

    <el-table-column
      prop="liferemaining"
      label="Life remaining"
      sortable
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.life_day}}
      </template>
    </el-table-column>
    
    <el-table-column
      prop="machine_id"
      label="Miner ID"
    > 
      <template slot-scope="scope">
        <el-button
          @click="showMinerInfo(scope.row)"
          type="text"
          size="small">
          {{scope.row.layer2 && scope.row.layer2.tea_id_b64 ? scope.row.layer2.tea_id_b64 : ''}}
        </el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="performance"
      label="Peak performance"
      width="150"
    />

    <!-- <el-table-column
      prop="remaining_performance"
      label="Remaining performance"
      sortable
      width="110"
    /> -->

    <el-table-column
      label="Entity"
    >
      <template slot-scope="scope">
        <el-button v-if="scope.row.layer2 && scope.row.layer2.entity_id" size="small" type="text" @click="toEntityDetail(scope.row.layer2.entity_id)">{{scope.row.layer2.entity_id}}</el-button>

        <el-button v-if="!scope.row.layer2.entity_id" :disabled="!(scope.row.layer2 && scope.row.layer2.planted_at) || layer1_account.address !== scope.row.owner" size="small" type="text" @click="createEntity(scope.row)">Create entity</el-button>
      </template>
    </el-table-column>

    <!-- <el-table-column
      prop="status"
      label="Status"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.status | str}}
      </template>
    </el-table-column>

    <el-table-column
      prop="miner_status"
      label="Miner status"
      width="110"
    >
      <template slot-scope="scope">
        {{scope.row.miner_status}}<br/>
        <span v-if="scope.row.miner_ip && scope.row.cml_type==='B'">
          {{scope.row.miner_ip}}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      label="Total slots"
      prop="real_total"
      sortable
      width="120">
      <template slot-scope="scope">
        <el-button
          @click="showStakingSlot(scope)"
          type="text"
          size="small">
          {{scope.row.real_total}}
        </el-button>
      </template>
    </el-table-column> -->

   

    <!-- <el-table-column
      label="Actions"
      fixed="right"
      width="120"
    >
      <template slot-scope="scope">
        <TeaIconButton :disabled="scope.row.cml_type==='C'" tip="Stake" icon="invest" @click="openInvolveStakingModal(scope.row)" />
      </template>
    </el-table-column> -->
  </TeaTable>


</div>
</template>
<script>
import Base from '../workflow/Base';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString} from 'tearust_layer1';
import TeaTable from '../components/TeaTable';
import TeaIconButton from '../components/TeaIconButton';
import helper from './helper';
import layer2 from '../layer2';
export default {
  components: {
    TeaTable, TeaIconButton,
  },
  data(){
    return {
      list: null,

      total_current_performance: 0,
      total_remaining_performance: 0,
    };
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

    utils.register('refresh-current-account__account', async (key, param={})=>{
      _.delay(()=>{
        this.refreshList()
      }, 200);
      
    });

    await this.wf.refreshCurrentAccount();
  },

  methods: {
    async refreshList(){
      this.$root.loading(true);

      await utils.sleep(1000);

      const list = await layer2.miner.queryCmlList(this, {
        // owner: this.layer1_account.address,
      });
      
      this.list = _.filter(list, (item)=>{
        return !!item.layer2;
      });
      
      // this.total_current_performance = s1;
      // this.total_remaining_performance = s2;

      this.$root.loading(false);
    },
    

    async showMinerInfo(row){
      await helper.showMinerInfo(this, row.layer2.tea_id_b64);
    },

    toEntityDetail(entity_id){
      this.$root.goPath('/entity/'+encodeURIComponent(entity_id));
    },
    async createEntity(row){
      try{
        await layer2.miner.createEntityForCml(this, row.id, async (rs)=>{
          this.$root.success("create tapp success");
          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }
    }
    

    
  }

  
}
</script>
