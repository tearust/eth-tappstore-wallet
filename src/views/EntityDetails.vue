<template>
  <div class="tea-page">

    <h4>
      Token detail
    </h4>
    
    <el-table
      :data="entity_table || []"
      stripe
      size="small"
      border
      class="tea-table"
    >
      <el-table-column
        prop="key"
        width="320"
        label=""
        label-class-name="hidden"
      >
        <template slot-scope="scope">
          <b>{{scope.row.key}}</b>
        </template>
      </el-table-column>

      <el-table-column
        prop="value"
        label=""
        label-class-name="hidden"
      >
        <template slot-scope="scope">
          <span>{{scope.row.value}}</span>
        </template>
      </el-table-column>
      

    </el-table>
    
    <div v-if="token_id && !$root.is_tappstore(token_id)" style="margin-top: 12px;">
      
      <TeaIconButton 
        type="primary"
        icon="NA"
        title="Buy"
        @click="buy_token()"
      />
      <TeaIconButton 
        type="primary"
        icon="NA"
        title="Sell"
        :disabled="!can_sell"
        @click="sell_token()"
      />
      <TeaIconButton 
        type="primary"
        icon="NA"
        title="Sell All"
        :disabled="!can_sell"
        @click="sell_all_token()"
      />
      <!-- <TeaIconButton 
        type="primary"
        icon="NA"
        title="Update"
        @click="update_entity()"
        style="float:right;"
      /> -->


      
      
    </div>
    

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
      token_id: null,
      entity: null,
      entity_table: [],
      can_sell: false,
      
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.token_id = decodeURIComponent(this.$route.params.token_id);

    this.wf = new Base();
    await this.wf.init();

    
    await this.refresh();
  },

  methods: {
    async refresh(){
      
      await layer2.entity.queryAll(this, async (list)=>{

        if(!list[0]){
          alert("Invalid token id.");
          this.$root.goPath('/investment');
          return;
        }

        this.entity = list[0];

        this.dataToTable();
      }, {
        token_id_b64: this.token_id,
        from: this.layer1_account.address,
      });
 
    },

    dataToTable(){
      const d = this.entity;
      const xl = [
        ['Token ID', this.token_id],
        ['Name', d.name],
        ['Ticker', d.token_symbol],
        
        ['Buy price', d.buy_price],
        ['Sell price', d.sell_price],
        ['Total supply', d.total_supply],
        ['Market cap', d.market_cap],
        ['Theta', d.theta],
        
        ['Owner', d.owner],
        ['My holdings', d.account_balance?d.account_balance.token_balance:0]

      ];
      this.entity_table = _.map(xl, (x)=>{
        return {
          key: x[0],
          value: x[1],
        };
      });
      this.can_sell = d.account_balance&&d.account_balance.token_balance>0;
      
    },
    

    async buy_token(){
      try{
        await layer2.entity.buyToken(this, this.entity, async ()=>{
 
          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }
    },
    async sell_token(){
      try{
        await layer2.entity.sellToken(this, this.entity, async ()=>{
    
          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }
    },
    async sell_all_token(){
      try{
        await layer2.entity.sellAllToken(this, this.entity, async ()=>{
          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }
    },
    async update_entity(){
      alert('TODO');
    },
    
    
  }
}
</script>
