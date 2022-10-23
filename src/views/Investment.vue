<template>
<div class="tea-page">
  <div>
    <el-switch
      v-if="user && user.isLogin"
      v-model="mine"
      active-color="#35a696"
      inactive-color="#409eff"
      active-text="Mine"
      :width="60"
      inactive-text="All"
      @change="changeHandler()"
    >
    </el-switch>

    <span v-if="mine && (!list || list.length<1)" style="font-size: 14px;color: #8c8c8c;position: relative;top: 1px;left: 20px;">
      Please switch to "All" to explore more investment entities.
    </span>
  </div>

  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refresh()"></el-button>

  <TeaTable
    style="margin-top: 15px;"
    :data="list || []"
    name="home_entity_list_table"
  >
    <el-table-column
      prop="id"
      label="ID"
    >
      <template slot-scope="scope">
        <el-button :title="scope.row.id" size="small" type="text" @click="toEntityDetail(scope)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="name"
      label="Name"
      width="100"
    >
      <template slot-scope="scope">
        <span v-if="!scope.row.active_block">{{scope.row.name}}</span>
        <!-- <el-button v-if="scope.row.active_block" size="small" type="text" @click="showLink(scope)">{{scope.row.name}}</el-button> -->
        <span v-if="scope.row.active_block">{{scope.row.name}}</span>
        
      </template>
    </el-table-column>

    <el-table-column
      prop="token_symbol"
      label="Ticker"
      width="70"
    />

    <el-table-column
      label="Owner"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="$root.to_user_detail(scope.row.owner)">{{scope.row.owner}}</el-button>
        <!-- <span>{{scope.row.owner}}</span> -->
      </template>
    </el-table-column>

    <el-table-column
      label="Accrued balance"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.consume_account_balance | teaIcon"></span>
      </template>
    </el-table-column>


    <el-table-column
      prop="total_supply"
      label="Total supply"
      width="110"
      sortable
    />

    <el-table-column
      prop="buy_price"
      label="Buy price"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.buy_price | teaIcon"></span>
      </template>
    </el-table-column>
    <el-table-column
      prop="sell_price"
      label="Sell price"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.sell_price | teaIcon"></span>
      </template>
    </el-table-column>
      

    <el-table-column
      prop="market_cap"
      label="Market cap"
      width="120"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.market_cap | teaIcon"></span>
      </template>
    </el-table-column>


   <el-table-column
      prop="token_balance"
      label="My holdings"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.token_balance"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Actions"
      width="100"
      fixed="right"
    >
      <template v-if="user && user.isLogin" slot-scope="scope">
        <TeaIconButton tip="Buy" icon="buy" @click="buy_token(scope.row)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sell_token(scope.row)" />
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

import layer2 from '../layer2';
export default {
  components: {
    TeaTable,
    TeaIconButton,
  },
  data(){
    return {
      mine: false,
      list: null,
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
  async mounted(){
    this.wf = new Base();
    await this.wf.init();

    if(this.user && this.user.isLogin){
      this.mine = false;
    }
    else{
      this.mine = false;
    }

    await this.refresh();
  },
  methods: {
    async refresh(){
      this.$root.loading(true);

      const param = {
        only_tapp: false,
        from: this.layer1_account.address,
      };

      await layer2.entity.queryAll(this, async (list)=>{
        const mine_list = [];
        const not_min_list = [];
        
        _.each(list, (item)=>{
          if(item.account_balance && item.account_balance.token_balance > 0){
            item.token_balance = item.account_balance.token_balance;
            mine_list.push(item);
          }
          else{
            item.token_balance = 0;
            not_min_list.push(item);
          }
        });

        const all_list = _.concat(mine_list, not_min_list);
        this.list = this.mine ? mine_list : all_list;

        this.$root.loading(false);
      }, param);
    },
    async changeHandler(){
      await this.refresh();
    },
    toEntityDetail(scope){
      this.$root.goPath('/entity/'+encodeURIComponent(scope.row.id));
    },
    
    async buy_token(row){
      try{
        await layer2.entity.buyToken(this, row, async ()=>{

          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }
    },
    async sell_token(row){
      try{
        await layer2.entity.sellToken(this, row, async ()=>{
 
          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }
    },
  }
}
</script>