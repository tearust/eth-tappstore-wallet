<template>
<div class="tea-page">

  <TeaTable
    :data="list || []"
    name="home_entity_list_table"
    style=""
  >
    <el-table-column
      prop="id"
      label="ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="toEntityDetail(scope)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="name"
      label="Name"
      width="100"
    >
      <template slot-scope="scope">
        <span v-if="!scope.row.active_block">{{scope.row.name}}</span>
        <el-button v-if="scope.row.active_block" size="small" type="text" @click="showLink(scope)">{{scope.row.name}}</el-button>
        
      </template>
    </el-table-column>

    <el-table-column
      label="Owner"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text">{{scope.row.owner}}</el-button>
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
      

    <!-- <el-table-column
      prop="market_cap"
      label="Market cap"
      width="120"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.market_cap | teaIcon"></span>
      </template>
    </el-table-column> -->


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
      width="150"
      fixed="right"
    >
      <template slot-scope="scope">
        <TeaIconButton tip="Buy" icon="buy" @click="buy_token(scope.row)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sell_token(scope.row)" />
      </template>
    </el-table-column>

  </TeaTable>

  


</div>
</template>
<script>
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import {stringToHex, u8aToString} from 'tearust_layer1';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString} from 'tearust_layer1';
import TeaTable from '../../components/TeaTable';
import TeaTableColumn from '../../components/TeaTableColumn';
import TeaIconButton from '../../components/TeaIconButton';

import layer2 from '../../layer2';

export default {
  components: {
    TeaTable,
    TeaIconButton,
    TeaTableColumn,
  },
  data(){
    return {
      list: null,

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


    await this.refreshList();

    utils.register('page-home-my_entity', async ()=>{
      await this.refreshList();
    });
  },

  methods: {
    async refreshList(){
      this.$root.loading(true);
      try{
        await layer2.entity.queryAll(this, async (list)=>{
          
          this.list = _.filter(_.map(list, (item)=>{
            if(item.account_balance && item.account_balance.token_balance){
              
              item.token_balance = item.account_balance.token_balance;
              return item;
            }
            return null;
          }));

        }, {
          only_tapp: false,
          from: this.layer1_account.address,
        });
      }catch(e){
        console.error(e);
      }
      
      this.$root.loading(false);
    },
    showLink(scope){
      
    },
    toEntityDetail(scope){
      this.$root.goPath('/entity/'+encodeURIComponent(scope.row.id));
    },
    
    async buy_token(row){
      try{
        await layer2.entity.buyToken(this, row, async ()=>{

          await this.refreshList();
        });
      }catch(e){
        this.$root.showError(e);
      }
    },
    async sell_token(row){
      try{
        await layer2.entity.sellToken(this, row, async ()=>{
 
          await this.refreshList();
        });
      }catch(e){
        this.$root.showError(e);
      }
    },

    

  }
};

</script>

