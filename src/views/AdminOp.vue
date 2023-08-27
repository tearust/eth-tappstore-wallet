<template>
<div class="tea-page">
  <h4>Only available for admin user</h4>
  <el-divider />
  <div>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="start_credit_system()">Start credit system</el-button>

    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="test_trigger_close_cronjob()">Test trigger close cronjob</el-button>
  </div>
  <TeaTable
    style="margin-top: 5px;"
    :data="credit_info_list || []"
    name="txn_credit_system_list_table"
    v-if="credit_info_list"
  >
    <el-table-column
      label="Total credit"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.total | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Current credit"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.current | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="End time"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.end_time"></span>
      </template>
    </el-table-column>
    

  </TeaTable>
  <br/><br/>
  <el-divider />
  
  
  <div>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="freeze_state()">Freeze state</el-button>
    <el-button :disabled="not_admin" style="width:300px;" type="primary" @click="upgradeVersion()">Upgrade version</el-button>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="cancel_freeze_state()">Cancel freeze state</el-button>
  </div>

  <br/><br/>

  <h4>Txn Gas Fee</h4>
  <div style="display:flex;justify-content: space-between;">
    <el-button style="width:200px;" type="primary" @click="query_txn_gas_fee()">Query txn gas fee</el-button>

    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="update_txn_gas_fee()">Add / Update txn gas fee</el-button>
  </div>
  <TeaTable
    style="margin-top: 5px;"
    :data="gas_fee_list || []"
    name="txn_gas_fee_list_table"
    v-if="gas_fee_list"
  >

    <el-table-column
      label="Txn name"
    >
      <template slot-scope="scope">
        
        <span>{{scope.row.txn_name}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Gas Fee"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.fee | teaIcon"></span>
      </template>
    </el-table-column>

    

  </TeaTable>

</div>
</template>
<script>
import Base from '../workflow/Base';
import utils from '../tea/utils';
import {_, moment} from 'tearust_utils';
import { mapGetters, mapState } from 'vuex';

import TeaTable from '../components/TeaTable';
import TeaIconButton from '../components/TeaIconButton';
import TeaTableColumn from '../components/TeaTableColumn';

import layer2 from '../layer2';
export default {
  components: {
    TeaTable,
    TeaIconButton,
    TeaTableColumn,
  },
  data(){
    return {
      not_admin: true,
      gas_fee_list: null,
      credit_info_list: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState([
      'user'
    ])
  },
  watch: {
    'user': {
      immediate: true,
      handler(){
        this.not_admin = !(this.user && this.user.isLogin && this.$root.is_sudo(this.user.address));
      }
    },
  },

  async mounted(){
    this.wf = new Base();
    await this.wf.init();

    await this.query_credit_system_info();
  },
  methods: {
    
    async upgradeVersion(){
      await layer2.log.upgrade_version(this, {}, async ()=>{
        this.$root.success();
      });
    },
    async freeze_state(){
      await layer2.log.freeze_state(this, {}, async ()=>{
        this.$root.success();
      });
    },
    async cancel_freeze_state(){
      await layer2.log.cancel_freeze_state(this, {}, async ()=>{
        this.$root.success();
      });
    },
    async query_txn_gas_fee(){
      const list = await layer2.log.queryTxnGasFeeList(this, {});
      this.gas_fee_list = list;
    },
    async update_txn_gas_fee(){
      await layer2.log.update_txn_gas_fee(this, {}, async ()=>{
        await this.query_txn_gas_fee();
        this.$root.success();
      });
    },

    async query_credit_system_info(){
      const item = await layer2.admin.query_credit_system_info(this, {});
      if(!item.info){
        return;
      }

      this.credit_info_list = [{
        ...item.info,
        total: utils.layer1.balanceToAmount(item.info.total),
        end_time: moment(_.toNumber(item.info.end_time)).format('YYYY-MM-DD kk:mm:ss'),
        current: utils.layer1.balanceToAmount(item.current),
      }];
    },

    async start_credit_system(){
      await layer2.admin.start_credit_system(this, {}, async (r)=>{
        await this.query_credit_system_info();
      });
    },
    async test_trigger_close_cronjob(){
      await layer2.admin.test_trigger_close_credit_system_cronjob(this, {}, async (r)=>{
        
      });
    }
  }
}
</script>