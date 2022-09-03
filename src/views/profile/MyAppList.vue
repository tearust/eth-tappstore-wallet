<template>
<div class="tea-page">

  <span>
    My total investment value in TEA : <b style="color: #35a696;">{{total_investment_tea}}</b>
  </span>
  <TeaTable
    :data="list || []"
    v-loading="table_loading"
    name="tapps_list_table"
  >
    <el-table-column
      prop="id"
      width="70"
      label="ID"
      sortable
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="showDetails(scope)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="name"
      label="TApp Name"
      width="120"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="openTo(scope.row)">{{scope.row.name}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="owner"
      label="Owner"
      width="100"
    >
      <template slot-scope="scope">
        <el-tooltip effect="light" :content="scope.row.owner" placement="right">
        <el-button
          @click="
            $root.go_wallet('/user_details/'+scope.row.owner)"
          type="text">
          {{scope.row.owner}}
        </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column
      prop="token_symbol"
      label="Ticker"
      width="90"
    />

    <el-table-column
      prop="total_supply"
      label="Total supply"
    />


    <el-table-column
      prop="buy_price"
      label="Buy price (TEA)"
      sortable
    />
    <el-table-column
      prop="sell_price"
      label="Sell price (TEA)"
      sortable
    />

    <el-table-column
      prop="market_value"
      label="Market value (TEA)"
      width="140"
      sortable
    />


    <el-table-column
      label="Actions"
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.id}}
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
      total_investment_tea: 0,
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

    utils.register('refresh-current-account__my_app', async (key, param)=>{
      await this.refreshList();   
    });
  },

  methods: {
    async refreshList(){
      helper.tableLoading(this, true);

      await layer2.entity.queryAll(this, async (list)=>{

        let sum = 0;
        // let x_list = _.filter(list, (item)=>{
        //   return item.account_balance.token_balance;
        // });

        let x_list = list;
        x_list = _.map(x_list, (item)=>{
          const mv = utils.layer1.roundAmount(item.account_balance.token_balance*item.sell_price);
          sum += mv;
          item.market_value = mv;
          return item;
        });

        this.total_investment_tea = sum;
        this.list = x_list;

        helper.tableLoading(this, false);
      }, {
        from: this.layer1_account.address,
      });
    },
    // openTo(row){
    //   tappstore.showTAppLink(this, row);
    // },
    async showDetails(scope){
      helper.showDetailsModal(this, scope.row.id);
    },
    

    // async hostHandler(scope){
    //   try{
    //     await tappstore.hostTApp(this, scope.row, async (rs)=>{
    //       this.$root.success("host tapp success");
    //       await this.refreshList();
    //     });
    //   }catch(e){
    //     this.$root.showError(e);
    //   }
    // }

  }

  
}
</script>
