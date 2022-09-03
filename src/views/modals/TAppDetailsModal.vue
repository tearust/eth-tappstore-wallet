<template>
  <el-dialog
    :title="tapp ? tapp.name : '---'"
    :visible="visible"
    width="900px"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i>

    <div class="tea-modal-card" v-if="!loading" style="margin: 0 -20px; display:block;">
      <!-- <h4 style="font-size: 18px;color: #666; margin: 0 0 5px 0;">{{tapp.name}}</h4> -->
      <el-row class="x-list" style="flex-direction: row;">
        <el-col :span="24">

          <div class="x-item" v-for="(item, i) of item_list" :key="i">
            <b>{{item.label}} :</b>
            <span>{{item.value}}</span>
          </div>
          

          
        </el-col>
        
      </el-row>
      
      <h4 style="font-size: 18px;color: #666; margin: 20px 0 5px 0;">Hosting CML list</h4>
      <TeaTable
        :data="cml_list || []"
        name='tapp_detail_hosting_cml_list_table'
        :pagination="false"
      >
        <el-table-column
          prop="cml_id"
          label="CML ID"
          width="80"
          sortable
        >
          <template slot-scope="scope">
            <el-button type="text" @click="$root.go_wallet('/cml_details/'+scope.row.cml_id)">{{scope.row.cml_id}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="owner"
          label="Owner"
        >
          <template slot-scope="scope">
            <el-button 
              @click="$root.go_wallet('/user_details/'+scope.row.owner)"
              type="text">
              {{scope.row.owner}}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          prop="liferemaining"
          label="Life remaining"
          sortable
          width="120"
        >
          <template slot-scope="scope">
            {{scope.row.life_day}}
          </template>
        </el-table-column>
       
        <el-table-column
          prop="remaining_performance"
          label="Remaining performance"
          width="180"
          sortable
        />

        <el-table-column
          prop="miner_ip"
          label="Miner ip address"
          width="150"
        />

        <el-table-column
          prop="miner_status"
          label="Miner status"
          width="120"
        />



      </TeaTable>

    </div>
    
    <span slot="footer" class="dialog-footer">
      <!-- <el-button v-if="tapp && layer1_account && layer1_account.address === tapp.owner" style="float:left;" size="small" type="primary" @click="updateResourceCid()">Update resource Cid</el-button> -->

      <el-button size="small" @click="close()">Close</el-button>
    </span>

  </el-dialog>

</template>
<script>
import { mapState, mapGetters } from 'vuex';
import store from '../../store/index';
import utils from '../../tea/utils';
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import request from '../../request';
import TeaTable from '../../components/TeaTable';
import {hexToString} from 'tearust_layer1';

export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      loading: true,
      tapp: null,

      cml_list: null,
      item_list: [],
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible: state => store.state.modal.tapp_details.visible,
      param: state => store.state.modal.tapp_details.param,
    })
  },

  methods: {
    close(){
      this.$store.commit('modal/close', 'tapp_details');
      this.loading = true;
      this.tapp = null;
      this.cml_list = null;
    },
    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      this.layer1_instance = this.wf.getLayer1Instance();
      this.api = this.layer1_instance.getApi();

      const tapp_id = this.param.id;
      const data = this.param.data;

      await this.initDetailInfo(tapp_id, data);
      await this.initCmlInfo(tapp_id, data);

      this.loading = false;
    },

    async initDetailInfo(tapp_id, data){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      const tmp = {
        name: data.name,
        token_symbol: data.token_symbol,
        owner: data.owner,
        detail: data.detail,
        link: data.link,
        host_performance: data.host_performance,
        host_current: data.host_current,
        host_max: data.ori.max_allowed_hosts,
        host_min: data.ori.min_allowed_hosts,
        is_full: data.is_full,
        total_supply: data.total_supply,
        buy_price: data.buy_price,
        sell_price: data.sell_price,
      };

      let item_list = [
        {
          label: 'Ticker',
          value: tmp.token_symbol,
        },
        {
          value: tmp.detail,
          label: 'Details'
        },
        {
          value: tmp.host_performance,
          label: 'Host performance'
        }
      ];

      tmp.market_cap = data.market_cap;
      const item = (await api.query.bondingCurve.tAppBondingCurve(tapp_id)).toJSON();

      if(data.ori.billing_mode === 'FixedHostingToken'){
        tmp.billing_mode = 'Fixed TApp token and dividend payments per 1000 blocks';
        item_list.push({
          label: 'Billing model',
          value: data.billing_mode,
        });
        item_list.push({
          label: 'Reward token amount',
          value: data.ori.hosting_amount, //utils.layer1.balanceToAmount(data.ori.hosting_amount)
        });
      }
      else if(data.ori.billing_mode === 'FixedHostingFee'){
        tmp.billing_mode = 'Fixed TEA payment per 1000 blocks';
        item_list.push({
          label: 'Billing model',
          value: tmp.billing_mode
        });
        item_list.push({
          label: 'Reward per 1000 performance',
          value: data.ori.hosting_amount, //utils.layer1.balanceToAmount(data.ori.hosting_amount)
        });
      }
      
      tmp.type = item.tapp_type;
      this.tapp = tmp;

      item_list = _.concat(item_list, [
        {
          label: 'Theta',
          value: data.theta,
        },
        {
          label: 'Min / Max hosts',
          value: tmp.host_min+' / '+tmp.host_max
        },
        {
          label: 'Current hosts',
          value: tmp.host_current
        },
        {
          label: 'Total supply',
          value: tmp.total_supply,
        },
        {
          label: 'Buy / Sell price (TEA)',
          value: tmp.buy_price+' / '+tmp.sell_price
        },
        {
          label: 'Market cap (TEA)',
          value: tmp.market_cap
        },
        
      ]);

      this.item_list = item_list;

    },
    async initCmlInfo(tapp_id, tapp){
      const list = await Promise.all(_.map(tapp.ori.hosts, async (h)=>{
        const [cml] = await this.wf.getCmlByList([h.cml_id]);
        console.log(11, cml, h, tapp)
        const item = {
          cml_id: h.cml_id,
          owner: tapp.owner,
          life_day: cml.life_day,
          current_performace: 'todo',
          remaining_performance: cml.remaining_performance,
          peak_performance: cml.intrinsic.performance,
          miner_status: cml.miner_status,
          miner_ip: cml.miner_ip,
        };
        return item;
      }));

      this.cml_list = list;
    },

   

    openTo(){
      
    },

  }
}
</script>
