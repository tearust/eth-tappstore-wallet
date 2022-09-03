<template>
<div class="tea-page">
  <h4>Leader-board</h4>

  <el-button type="primary" size="small" style="position:absolute; top:0; right: 50px;" @click="registerHandler()">Register for competition</el-button>
  <el-button size="small" style="top: 0px;" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

  <TeaTable
    style="margin-top: 15px;"
    :data="list || []"
    name="leaderboard_list_table"
  >
    <el-table-column
      prop="$index"
      label="Rank"
      width="60"
    >
      <template slot-scope="scope">
        {{scope.$index+1}}
      </template>
    </el-table-column>

    <el-table-column
      label="Account"
      width="200"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="$root.to_user_detail(scope.row.address)">{{scope.row.address}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="Eth address"
      width="200"
    >
      <template slot-scope="scope">
        <span>{{scope.row.eth}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Init asset"
    >
      <template slot-scope="scope">
        <span v-if="!scope.row.init_lt" :inner-html.prop="scope.row.init_asset | balance"></span>
        <span v-if="scope.row.init_lt" style="color:red;">-(<font :inner-html.prop="scope.row.init_asset | balance_number"></font>)</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Appstore wallet balance"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.tea_balance | balance"></span>
      </template>
    </el-table-column>
    <el-table-column
      label="Appstore wallet deposit"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.tea_deposit | balance"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Token asset"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.token_asset | balance"></span>
      </template>
    </el-table-column>
    <el-table-column
      label="Seat asset"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.seat_asset | balance"></span>
      </template>
    </el-table-column>

    <TeaTableColumn
      label="Total"
      tip="Wallet balance + Wallet deposit + Token asset + Seat asset"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.total | balance"></span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Net asset gain"
      tip="Total - Init asset"
    >
      <template slot-scope="scope">
        <span v-if="!scope.row.deposit" :inner-html.prop="scope.row.gain | balance"></span>
        <span v-if="scope.row.deposit" style="color:red;">-(<font :inner-html.prop="scope.row.gain | balance_number"></font>)</span>
      </template>
    </TeaTableColumn>

    
    

  </TeaTable>

</div>
</template>
<script>
import TeaTable from '../components/TeaTable';
import TeaTableColumn from '../components/TeaTableColumn';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import { mapGetters, mapState } from 'vuex';
import layer2 from '../layer2';

export default {
  components: {
    TeaTable,
    TeaTableColumn,
  },
  data(){
    return {
      list: null,
      
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
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      const list = await layer2.log.queryLeaderboard(this);
      this.list = list;
      this.$root.loading(false);
    },

    
    async registerHandler(){
      await layer2.log.registerForLeaderboard(this, {}, async ()=>{
        await this.refreshList();
      });
    }
  }
}
</script>
<style lang="scss" scoped>

</style>