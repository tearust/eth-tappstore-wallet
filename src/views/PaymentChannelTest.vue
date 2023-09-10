<template>
<div class="tea-page">
  <h4> </h4>

  <el-button type="primary" size="small" style="position:absolute; top:0; right: 50px;" @click="open_channel()">Open payment-channel</el-button>
  <el-button size="small" style="top: 0px;" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

  <h4>Payer channel list ({{ts || '...'}})</h4>
  <TeaTable
    style="margin-top: 15px;"
    :data="payer_list || []"
    name="payment_channel_test_list_payer"
  >
    <el-table-column
      label="Channel ID"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.channel_id | short_address}}
      </template>
    </el-table-column>

    <el-table-column
      label="Payee account"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.payee_address | short_address}}
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
      width="120"
    >
      <template slot-scope="scope">
        {{scope.row.status}}
      </template>
    </el-table-column>

    <el-table-column
      label="Channel remaining"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.fund_remaining | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Updated payment"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.sign_amt | teaIcon"></span>
      </template>
    </el-table-column>


    <!-- <el-table-column
      label="Grace period(second)"
    >
      <template slot-scope="scope">
        {{scope.row.grace_period}}
      </template>
    </el-table-column> -->

    <el-table-column
      label="Expire time"
    >
      <template slot-scope="scope">
        {{scope.row.expire_time}}
      </template>
    </el-table-column>

    <el-table-column
      label="Update at"
    >
      <template slot-scope="scope">
        {{scope.row.latest_update_at}}
      </template>
    </el-table-column>

    


    <el-table-column label="Actions" width="200" fixed="right">
      <template slot-scope="scope">
        <!-- <TeaIconButton
          title="Refill"
          icon="NA"
          @click="refill_amount(scope.row)"
        /> -->

        <TeaIconButton
          v-if="!scope.row.is_expired"
          title="Early-terminate"
          icon="NA"
          @click="early_terminate(scope.row)"
        />

        <TeaIconButton
          v-if="scope.row.is_expired"
          title="Terminate"
          icon="NA"
          @click="terminate(scope.row)"
        />

        <TeaIconButton
          title="Sign-amount"
          icon="NA"
          @click="sign_remaining_fund(scope.row)"
        />
        
      </template>
    </el-table-column>
    

    
  </TeaTable>


  <h4 style="margin-top: 30px;">Payee channel list ({{ts || '...'}})</h4>
  <TeaTable
    style="margin-top: 15px;"
    :data="payee_list || []"
    name="payment_channel_test_list_payee"
  >
    <el-table-column
      label="Channel ID"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.channel_id | short_address}}
      </template>
    </el-table-column>
    <el-table-column
      label="Payer account"
      width="100"
    >
      <template slot-scope="scope">
        {{scope.row.payer_address | short_address}}
      </template>
    </el-table-column>

    <el-table-column
      label="Channel remaining"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.fund_remaining | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Cashed out"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.out_amt | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.status_type!==2">{{scope.row.status}}</span>
        <span v-if="scope.row.status_type===2" style="color:#f00;font-weight:bold;">{{scope.row.status}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Expire time"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.status_type!==2">{{scope.row.expire_time}}</span>
        <span v-if="scope.row.status_type===2" style="color:#f00;font-weight:bold;">{{scope.row.expire_time}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Update at"
    >
      <template slot-scope="scope">
        {{scope.row.latest_update_at}}
      </template>
    </el-table-column>

    

    
    <el-table-column label="Actions" fixed="right">
      <template slot-scope="scope">
        <!-- <TeaIconButton
          title="Terminate"
          icon="NA"
          @click="terminate(scope.row)"
        /> -->

        <TeaIconButton
          title="Cash-out"
          icon="NA"
          @click="payee_update_payment(scope.row)"
        />
        
      </template>
    </el-table-column>
    
    

  </TeaTable>

</div>
</template>
<script>
import TeaTable from '../components/TeaTable';
import TeaTableColumn from '../components/TeaTableColumn';
import TeaIconButton from '../components/TeaIconButton';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import { mapGetters, mapState } from 'vuex';
import layer2 from '../layer2';

export default {
  components: {
    TeaTable,
    TeaTableColumn,
    TeaIconButton,
  },
  data(){
    return {
      payer_list: null,
      payee_list: null,
      ts: null,
      
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
      const xl = await layer2.channel.query_all_channel_list(this, {});
console.log(11, xl);
      this.payer_list = xl.payer_list;
      this.payee_list = xl.payee_list;
      this.ts = xl.ts;
      this.$root.loading(false);
    },

    
    async open_channel(){
      await layer2.channel.open_channel(this, {}, async ()=>{
        await this.refreshList();
      });
    },
    async refill_amount(row){
      await layer2.channel.refill_fund(this, row, async ()=>{
        await this.refreshList();
      });
    },
    async early_terminate(row){
      await layer2.channel.early_terminate(this, row, async ()=>{
        await this.refreshList();
      });
    },
    async terminate(row){
      await layer2.channel.terminate(this, row, async ()=>{
        await this.refreshList();
      });
    },
    async sign_remaining_fund(row){
      await layer2.channel.sign_remaining_fund(this, row, async ()=>{
        await this.refreshList();
      });
    },
    async payee_update_payment(row){
      await layer2.channel.payee_update_payment(this, row, async ()=>{
        await this.refreshList();
      });
    }
  }
}
</script>
