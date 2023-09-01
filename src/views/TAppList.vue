<template>
<div class="tea-page">
  <h4>TApps list</h4>


  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>
  <TeaTable
    :data="list || []"
    name="tapps_list_table"
    style="overflow-y:"
  >
    <el-table-column
      prop="id"
      width="130"
      label="ID"
    >
      <template slot-scope="scope">
        <el-button size="small" type="text" @click="toEntityDetail(scope)">{{scope.row.id}}</el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="name"
      label="Name"
      width="80"
    >
      <template slot-scope="scope">
        <span v-if="!scope.row.active_block">{{scope.row.name}}</span>
        <el-button v-if="scope.row.active_block" size="small" type="text" @click="showLink(scope)">{{scope.row.name}}</el-button>
        
      </template>
    </el-table-column>

    <el-table-column
      prop="owner"
      label="Owner"
      width="180"
    >
      <template slot-scope="scope">
        <!-- <el-tooltip effect="light" :content="scope.row.owner" placement="right">
        <el-button
          @click="
            $root.openUrl('https://wallet.teaproject.org#/user_details/'+scope.row.owner)"
          type="text">
          {{scope.row.owner}}
        </el-button>
        </el-tooltip> -->
        <span>{{scope.row.owner}}</span>
      </template>
    </el-table-column>

    <el-table-column
      prop="token_symbol"
      label="Ticker"
      width="70"
    />

    <!-- <el-table-column
      prop="total_supply"
      label="Total supply"
      width="110"
      sortable
    /> -->

    <!-- <el-table-column
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
      width="100"
      sortable
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.market_cap | teaIcon"></span>
      </template>
    </el-table-column> -->


    <!-- <el-table-column
      label="Theta"
      prop="theta"
      width="80"
      sortable
    /> -->
    <el-table-column
      prop="host_performance"
      label="Min perf"
      width="80"
    />

    <el-table-column
      label="Current/Min/Max hosts"
    >
      <template slot-scope="scope">
        {{scope.row.host_current}}/{{scope.row.host_n}}
      </template>
    </el-table-column>

    <TeaTableColumn
      prop="status"
      label="Status"
    />

    <el-table-column
      label="Actions"
      width="150"
      fixed="right"
    >
      <template slot-scope="scope">
        <!-- <TeaIconButton tip="Buy" icon="buy" @click="buyHandler(scope)" />
        <TeaIconButton tip="Sell" icon="sell" @click="sellHandler(scope)" /> -->

        <TeaIconButton tip="Host/Unhost" icon="host" @click="hostHandler(scope)" />
      </template>
    </el-table-column>


  </TeaTable>

  <div class="tea-legend" style="
    margin-top: 40px;
    position: relative;
  ">
    <ul style="width: 600px; margin-left: -20px;">
      <li>
        The 
        <a href="https://github.com/tearust/teaproject/wiki/TApps-List#total-supply" target="_blank">total supply</a> 
        and 
        <a href="https://github.com/tearust/teaproject/wiki/TApps-List#buy-price" target="_blank">token price </a> 
        are determined by 
        <a href="https://github.com/tearust/teaproject/wiki/TApps-List#sell-price" target="_blank">the bonding curve.</a> 
        Your TApp tokens in your wallet will expand or contract based on 
        <a href="https://github.com/tearust/teaproject/wiki/TApp-Token-Supply-and-Demand#tapp-tokens-in-wallet-expand-on-consume-contract-on-expense" target="_blank">consume and expense actions </a> 
        on the TApp's bonding curve.
      </li>
      <li>
        <a href="https://github.com/tearust/teaproject/wiki/Bonding-Curve-Theta" target="_blank">Theta</a> is the % of every TApp token buy or consume event that goes to the developer.
      </li>
      <li>
        The 
        <a href="https://github.com/tearust/teaproject/wiki/Mining#host-performance-requirement" target="_blank">host performance requirement </a> 
        is the minimum power required for a mining machine to host this TApp.
      </li>
      <li>
        <strong>Hosting rewards</strong> refers to how miners are incentivized to host a particular TApp: either a fixed <strong>T</strong> amount or a set amount of <a href="https://github.com/tearust/teaproject/wiki/Mining:-Staked-TApp-Tokens" target="_blank">staked hosting tokens</a> 
        paid out to miners hosting this TApp every 1000 blocks.
      </li>
      <li>
        <a href="https://github.com/tearust/teaproject/wiki/Mining#current-hosts" target="_blank">Current hosts </a>
        is the current number of miners hosting this TApp. <a href="https://github.com/tearust/teaproject/wiki/Mining#min-and-max-hosts" target="_blank">Min/Max hosts</a> refers to the minimum number of miners needed to host this TApp before it runs and the maximum number of CML miners that can host this TApp.
      </li>
      <li>
      <strong>Status</strong> refers to the current state of the TApp. Note that users can still perform <strong>buy / sell / host</strong> actions on the TApp even if the status is pending.
      </li>
      <li>
        In the actions section, you can buy or sell the TApp's token as well as
        <a href="https://github.com/tearust/teaproject/wiki/Mining:-Host-and-Unhost-TApps" target="_blank">host (or unhost) the TApp.</a> 
      </li>
    </ul>

    <el-button style="width:400px;position:absolute;top:0; right:0;" type="primary" @click="createNewTApp()">Create new TApp</el-button>
  </div>
  
  

</div>
</template>
<script>
import Base from '../workflow/Base';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';
import TeaTable from '../components/TeaTable';
import TeaTableColumn from '../components/TeaTableColumn';
import TeaIconButton from '../components/TeaIconButton';
import request from '../request';

import layer2 from '../layer2';

export default {
  components: {
    TeaTable,
    TeaIconButton,
    TeaTableColumn,
  },
  data(){
    return {
      list: null,

      youtube_options: [],
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
    // await this.initCreaetTAppModalOptions();
  },

  methods: {
    async refreshList(){
      this.$root.loading(true);
      await layer2.entity.queryAll(this, async (list)=>{
        this.list = list;
      });
      
      this.$root.loading(false);
    },
    showLink(scope){
      
    },
    toEntityDetail(scope){
      this.$root.goPath('/entity/'+encodeURIComponent(scope.row.id));
    },
    
    async createNewTApp(){
      try{
        await layer2.tapp.createNew(this, async (rs)=>{
          this.$root.success("create tapp success");
          await this.refreshList();
        });
      }catch(e){
        this.$root.showError(e);
      }

    },

    async hostHandler(scope){
      
      try{
        await layer2.tapp.hostTApp(this, scope.row, async (rs)=>{
          this.$root.success("host tapp success");
          await this.refreshList();
        });
      }catch(e){
        this.$root.showError(e);
      }

    },

    async initCreaetTAppModalOptions(){
      const xl_1 = await request.layer1_rpc('cml_approvedLinks', [false]);
      const xl_2 = await request.layer1_rpc('cml_approvedLinks', [true]);
      const xl = _.differenceBy(xl_1, xl_2, (val)=>{
        return val.toString();
      });

      let list = await Promise.all(_.map(xl, async (arr)=>{
        const link = utils.rpcArrayToString(arr[0]);
        const tapp_id = arr[1];
        const desc = utils.rpcArrayToString(arr[2]);
        const creator = arr[3];

        let json = utils.parseJSON(link, {});
        return {
          tapp_id,
          desc,
          type: json.t || '',
          tid: json.v || '',
          creator,
        }
      }));

      list = _.filter(list, (x)=>{
        return x.type === 'YouTube' && !x.creator;
      });
      list = _.map(list, (x)=>{
        return {
          label: x.tid,
          value: x.tid
        };
      });
      
      this.youtube_options = list;
    }

  }
};

</script>
<style lang="scss">

</style>
