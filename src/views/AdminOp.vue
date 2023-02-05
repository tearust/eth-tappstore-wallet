<template>
<div class="tea-page">
  <h4>Only available for admin user</h4>
  <div>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="freeze_state()">Freeze state</el-button>
    <el-button :disabled="not_admin" style="width:300px;" type="primary" @click="upgradeVersion()">Upgrade version</el-button>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="cancel_freeze_state()">Cancel freeze state</el-button>
  </div>

  <br/><br/>
  <h4>Tools</h4>
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
    }
  }
}
</script>