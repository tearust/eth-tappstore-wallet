<template>
<div class="tea-page">
  <div style="height: 24px;">
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
    style="margin-top: 25px;"
    :data="list || []"
    name="home_entity_list_table"
  >
    <TeaTableColumn
      prop="id"
      label="ID"
      width="100"
      xs
    >
      <template slot-scope="scope">
        <div v-if="!$root.mobile()">
        <el-button v-if="!$root.is_tappstore(scope.row.id)" :title="scope.row.id" size="small" type="text" @click="toEntityDetail(scope)">{{scope.row.id | short_address}}</el-button>
        <span :title="scope.row.id" class="one-line" v-if="$root.is_tappstore(scope.row.id)">{{scope.row.id | short_address}}</span></div>
        <div v-if="$root.mobile()"><span :title="scope.row.id" class="one-line">{{scope.row.id | short_address}}</span></div>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="name"
      label="Name"
      xs
    >
      <template slot-scope="scope">
        <span v-if="!scope.row.active_block">{{scope.row.name}}</span>
        <!-- <el-button v-if="scope.row.active_block" size="small" type="text" @click="showLink(scope)">{{scope.row.name}}</el-button> -->
        <span v-if="scope.row.active_block">{{scope.row.name}}</span>
        
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="token_symbol"
      label="Ticker"
      width="70"
    >
      <template slot-scope="scope">
        {{$root.is_tappstore(scope.row.id) ? '' : scope.row.token_symbol}}
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Owner"
    >
      <template slot-scope="scope">
        <!-- <el-button size="small" type="text" @click="$root.to_user_detail(scope.row.owner)">{{scope.row.owner}}</el-button> -->
        <span class="one-line">{{$root.is_tappstore(scope.row.id) ? '' : scope.row.owner}}</span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Accrued balance"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.consume_account_balance | teaIcon"></span>
      </template>
    </TeaTableColumn>


    <TeaTableColumn
      prop="total_supply"
      label="Total supply"
      width="110"
      sortable
    >
      <template slot-scope="scope">
        {{$root.is_tappstore(scope.row.id) ? '' : scope.row.total_supply}}
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="buy_price"
      label="Buy price"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span v-if="!$root.is_tappstore(scope.row.id)" :inner-html.prop="scope.row.buy_price | teaIcon"></span>
      </template>
    </TeaTableColumn>
    <TeaTableColumn
      prop="sell_price"
      label="Sell price"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span v-if="!$root.is_tappstore(scope.row.id)" :inner-html.prop="scope.row.sell_price | teaIcon"></span>
      </template>
    </TeaTableColumn>
      

    <TeaTableColumn
      prop="market_cap"
      label="Market cap"
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span v-if="!$root.is_tappstore(scope.row.id)" :inner-html.prop="scope.row.market_cap | teaIcon"></span>
      </template>
    </TeaTableColumn>


   <TeaTableColumn
      prop="token_balance"
      label="My holdings"
      width="110"
      sortable
    >
      <template slot-scope="scope">
        <span v-if="!$root.is_tappstore(scope.row.id)" :inner-html.prop="scope.row.token_balance"></span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Actions"
      width="100"
      fixed="right"
      xs
    >
      <template v-if="user && user.isLogin && !$root.is_tappstore(scope.row.id) && !is_system_actor(scope.row) " slot-scope="scope">
        <TeaIconButton tip="Buy" icon="buy" @click="buy_token(scope.row)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sell_token(scope.row)" />
      </template>
    </TeaTableColumn>

  </TeaTable>

</div>
</template>
<script>
import Base from '../workflow/Base';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';

import TeaTable from '../components/TeaTable';
import TeaTableColumn from '../components/TeaTableColumn';
import TeaIconButton from '../components/TeaIconButton';

import layer2 from '../layer2';
import helper from './helper';
export default {
  components: {
    TeaTable,
    TeaTableColumn,
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
        const x_list = this.mine ? mine_list : all_list;

        let tmp = null;
        if(this.user && this.user.isLogin && this.$root.is_sudo(this.user.address)){
          tmp = x_list;
        }
        else{
          tmp = _.filter(x_list, (x)=>!this.is_system_actor(x));
        }
        
        if(this.$root.mobile()){
          this.list = _.map(tmp, (item)=>{
            item.mobile_data = {
              'ID': item.id,
              'Name': item.name,
              'Ticker': item.ticker,
              'Owner': item.owner,
              'Accrued balance': item.consume_account_balance,
              'Total supply': item.total_supply,
              'Buy price': item.buy_price,
              'Sell price': item.sell_price,
              'Market cap': item.market_cap,
              'My holdings': item.token_balance,
            };
            return item;
          });
        }
        else{
          this.list = tmp;
        }

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
    is_system_actor(row){
      return helper.is_system_actor(row);
    }
  }
}
</script>