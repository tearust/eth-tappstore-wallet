<template>
  <div class="tea-page">

    <h4>
      Camellia detail
    </h4>
    <span v-if="cml && cml.miner && cml.cml_type==='B'">Miner public address : {{cml.miner.ip}}</span>

    <el-table
      :data="cml_table || []"
      stripe
      size="small"
      border
      class="tea-table"
    >
      <el-table-column
        prop="key"
        width="320"
        label="Label"
      >
        <template slot-scope="scope">
          <b>{{scope.row.key}}</b>
        </template>
      </el-table-column>

      <el-table-column
        prop="value"
        label="Value"
      >
        <template slot-scope="scope">
          <span>{{scope.row.value}}</span>
        </template>
      </el-table-column>
      

    </el-table>
    
    
    <div style="margin-top: 8px; height: 24px;" v-if="layer1_account && cml && cml.miner && layer1_account.address===cml.owner">
      
      <TeaIconButton 
        type="primary"
        tip="Migrate miner id and ip address"
        icon="NA"
        :disabled="cml.miner.status==='Active'"
        title="Migrate miner"
        @click="migrateMiner()"
      />
      <TeaIconButton 
        type="primary"
        tip="Schedule start up mining machine"
        icon="NA"
        :disabled="cml.miner.status!=='ScheduleDown'"
        title="Schedule start miner"
        @click="scheduleUp()"
      />
      <TeaIconButton 
        type="primary"
        tip="Schedule shut down mining machine"
        icon="NA"
        :disabled="cml.miner.status!=='Active'"
        title="Schedule shut down miner"
        @click="scheduleDown()"
      />

    </div>
      
    <!-- <div v-if="layer1_account && cml && miner && layer1_account.address===cml.owner">
      <p style="margin-top: 8px;margin-bottom:-8px;" v-if="miner.status==='Active'">
        Please note that mining machines must be shutdown before their CML can be migrated. 
        <a href="https://github.com/tearust/teaproject/wiki/CML-Migration-(Transfer)" target="_blank">Click here </a>
        for more information. <br>
        For more information on becoming a blockchain validator, <a href="https://github.com/tearust/teaproject/wiki/Mining---Layer-1-Validator-Mining" target="_blank">click and follow this guide</a>.
      </p>
    </div> -->

    

    

    
      

  </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import store from '../store/index';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import {_} from 'tearust_utils';
import helper from './helper';
import TeaIconButton from '../components/TeaIconButton';
import TeaTableColumn from '../components/TeaTableColumn'

import layer2 from '../layer2';

export default {
  components: {
    TeaIconButton,
    TeaTableColumn
  },
  data(){
    return {
      cml: null,
      id: null,
      cml_table: [],
      
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.id = _.toNumber(this.$route.params.id);

    this.$root.loading(true);
    this.wf = new Base();
    await this.wf.init();

    
    await this.refresh();
    this.$root.loading(false);
  },

  methods: {
    async refresh(){
      this.$root.loading(true);
      const layer1_instance = this.wf.getLayer1Instance();
      

      const cml_data = await layer2.miner.queryCmlDetails(this, {
        cml_id: this.id,
      });
      console.log(123, cml_data);

      this.cml = cml_data;
      this.dataToTable();
    
      this.$root.loading(false);
    },
    dataToTable(){
      const d = this.cml;
      const xl = [
        ['CML ID', this.id],
        ['Type', d.cml_type],
        ['Owner', d.owner],
        ['Life remaining', d.life_day],
        
        ['Performance', d.performance],
      ];
      if(d.layer2 && d.miner){
        xl.push(['Miner ID', d.layer2.tea_id_b64]);
        xl.push(['Planted at', d.layer2.planted_at]);
        xl.push(['Updated at', d.layer2.updated_at]);

        xl.push(['IP', d.miner.ip]);
        xl.push(['Issuer', d.miner.issuer]);
        xl.push(['Miner status', d.miner.status]);

        xl.push(['OrbitDB ID', d.miner.orbitdb_id]);
        xl.push(['Schedule down height', d.miner.scheduled_down_height]);
        xl.push(['Suspend height', d.miner.suspend_height]);

      }
      this.cml_table = _.map(xl, (x)=>{
        return {
          key: x[0],
          value: x[1],
        };
      });
      
    },
    
    openTo(row){
      helper.showTAppLink(this, row.id);
    },
    OpenToPolkadotForStaking(){
      helper.openUrl(`https://polkadot.js.org/apps/?rpc=${encodeURIComponent('wss://wallet.teaproject.org/wss1')}#/staking`);
      
    },
    
    async migrateMiner(){
      this.$root.goPath('/cml/migrate/'+this.id);
    },
    async scheduleUp(){
      this.$root.loading(true);
      try {
       
        await layer2.miner.cmlScheduleUp(this, {cml_id: this.id}, ()=>{});
        
        this.$root.success();
        await this.refresh();

      } catch (e) {
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    async scheduleDown(){
      this.$root.loading(true);
      try {
       
        await layer2.miner.cmlScheduleDown(this, {cml_id: this.id}, ()=>{});
        
        this.$root.success();
        await this.refresh();

      } catch (e) {
        this.$root.showError(e);
      }
      this.$root.loading(false);

    },
    
  }
}
</script>
