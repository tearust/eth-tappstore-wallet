<template>
<div class="tea-page tea-AdminOp">
  <h4>Only available for admin user</h4>
  <el-divider />

  <h4>Admin utility</h4>
  <div>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="query_special_balance_action()">Query account balance</el-button>
  </div>

  <el-divider />
  <h4>Credit system</h4>
  <div>
    <el-button :disabled="not_admin" class="xbt" style="width:200px;" type="primary" @click="start_credit_system()">Start credit system</el-button>

    <el-button :disabled="not_admin" class="xbt" style="width:200px;" type="primary" @click="add_global_credit()">Topup global credit</el-button>

    <el-button :disabled="not_admin" class="xbt" style="width:200px;" type="primary" @click="test_trigger_close_cronjob()">Test trigger close cronjob</el-button>
  </div>
  <TeaTable
    style="margin-top: 5px;"
    :data="credit_info_list || []"
    name="txn_credit_system_list_table"
    v-if="credit_info_list"
  >
    <el-table-column
      label="Total credit"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.total | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="Current credit"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.current | teaIcon"></span>
      </template>
    </el-table-column>

    <el-table-column
      label="End time"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.end_time"></span>
      </template>
    </el-table-column>
    

  </TeaTable>

  <el-divider v-if="!$root.mobile()" />

  <div v-if="!$root.mobile()">
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="freeze_state()">Freeze state</el-button>
    <el-button :disabled="not_admin" style="width:300px;" type="primary" @click="upgradeVersion()">Upgrade version</el-button>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="cancel_freeze_state()">Cancel freeze state</el-button>
    <br/><br/>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="query_actor_version()">Query actor version</el-button>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="query_remote_actor_version()">Query remote actor version</el-button>
  </div>


  <el-divider v-if="!$root.mobile()" />
  <h4 v-if="!$root.mobile()">Txn Gas Fee</h4>
  <div style="display:flex;justify-content: space-between;" v-if="!$root.mobile()">
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

  <el-divider />
  <h4>Reference reward</h4>
  <div style="display:block;">
    <el-button :disabled="not_admin" class="xbt" style="width:200px;" type="primary" @click="query_reward_account()">Query reward account</el-button>

    <el-button :disabled="not_admin" class="xbt" style="width:200px;" type="primary" @click="add_reward_account()">Insert reward account</el-button>
    <br/>
    <el-button :disabled="not_admin" class="xbt" style="width:320px;margin-top:20px;" type="primary" @click="query_global_reward_account()">Query global reference reward account balance</el-button>
    <el-button :disabled="not_admin" class="xbt" style="width:320px;margin-top:20px;" type="primary" @click="topup_to_global_reward_account()">Topup global reference reward account balance</el-button>
  </div>

  <el-divider />
  <h4 v-if="!$root.mobile()">Seat</h4>
  <el-button v-if="!$root.mobile()" :disabled="not_admin" style="width:200px;" type="primary" @click="admin_add_seat()">Admin add seat</el-button>
  <el-button v-if="!$root.mobile()" :disabled="not_admin" style="width:200px;" type="primary" @click="admin_delete_seat()">Admin delete seat</el-button>

  

</div>
</template>
<script>
import Base from '../workflow/Base';
import utils from '../tea/utils';
import {_, moment} from 'tearust_utils';
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
      credit_info_list: null,
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

    await this.query_credit_system_info();
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
      this.$root.loading(true);
      try{
        const list = await layer2.log.queryTxnGasFeeList(this, {});
        this.gas_fee_list = list;
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    async update_txn_gas_fee(){
      await layer2.log.update_txn_gas_fee(this, {}, async ()=>{
        await this.query_txn_gas_fee();
        this.$root.success();
      });
    },

    async query_credit_system_info(){
      const item = await layer2.admin.query_credit_system_info(this, {});
      if(!item.info){
        return;
      }

      this.credit_info_list = [{
        ...item.info,
        total: utils.layer1.balanceToAmount(item.info.total),
        end_time: moment(_.toNumber(item.info.end_time)).format('YYYY-MM-DD kk:mm:ss'),
        current: utils.layer1.balanceToAmount(item.current),
      }];
    },

    async start_credit_system(){
      await layer2.admin.start_credit_system(this, {}, async (r)=>{
        await this.query_credit_system_info();
      });
    },
    async test_trigger_close_cronjob(){
      await layer2.admin.test_trigger_close_credit_system_cronjob(this, {}, async (r)=>{

      });
    },
    async add_global_credit(){
      await layer2.admin.add_global_credit(this, {}, async (r)=>{
        await this.query_credit_system_info();
      });
    },
    async query_reward_account(){
      this.$store.commit('modal/open', {
        key: 'common_form',
        param: {
          title: 'Query reward account',
          text: '',
          props: {
            address: {
              type: 'Input',
              default: '',
              label: 'Address'
            }
          },
        },
        cb: async (form, close) => {
          this.$root.loading(true);
          const reward_acct = await layer2.user.query_reference_reward_acct(this, {address: form.address});
          close();
          this.$root.loading(false);
          this.$root.alert_success(reward_acct);
        },
        
      });
    },
    async add_reward_account(){
      this.$store.commit('modal/open', {
        key: 'common_form',
        param: {
          title: 'Query reward account',
          text: '',
          props: {
            address: {
              type: 'Input',
              default: this.layer1_account.address,
              label: 'Address'
            },
            reward_address: {
              type: 'Input',
              default: '',
              label: 'Reward address'
            }
          },
        },
        cb: async (form, close) => {
          this.$root.loading(true);
          await layer2.user.add_reference_reward_acct(this, {address: form.address, reward_address: form.reward_address}, async ()=>{
            this.$root.success();
          });

          close();
          this.$root.loading(false);
        },
        
      });
    },
    async query_global_reward_account(){
      const target = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b';
      const r = await layer2.user.query_balance_with_ts(this, target, layer2.base.getTappId());
      this.$root.alert_success(JSON.stringify(r));
    },
    async topup_to_global_reward_account(){
      this.$store.commit('modal/open', {
        key: 'common_form',
        param: {
          title: 'Topup for reference reward account',
          text: '',
          props: {
            amount: {
              type: 'number',
              default: 100,
              label: 'Topup amount',
              min: 0.00001
            }
          },
        },
        cb: async (form, close) => {
          const session_key = layer2.user.checkLogin(this);
          const target = '0x0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b';
          await layer2.admin.admin_global_transfer(this, {
            session_key,
            from: '0xfefefefefefefefefefefefefefefefefefefefe',
            to: target,
            amount: form.amount,
          }, async ()=>{
            this.$root.success();
          });

          close();
          this.$root.loading(false);
        },
        
      });

    },

    async admin_add_seat(){
      await layer2.seat.admin_add_seat(this, {}, async ()=>{

      });
    },
    async admin_delete_seat(){
      await layer2.seat.admin_delete_seat(this, {}, async ()=>{

      });
    },
    async query_special_balance_action(token_id=null, acct=null){
      this.$store.commit('modal/open', {
        key: 'common_form',
        param: {
          title: 'Acct balance',
          text: `
          0xfefefefefefefefefefefefefefefefefefefefe (Dao_reserved_account) <br/>
          0xfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfdfd (Seat_collection_pool) <br/>
          0x0000000000000000000000000000000000000000 (Total_supply_account) <br/>
          `,
          props: {
            tid: {
              type: 'Input',
              label: 'TokenId',
              default: token_id || layer2.base.getTappId(),
            },
            acct: {
              type: 'Input',
              label: 'Acct',
              default: acct || '',
              required: true,
            }
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);

          try{
            const rs = await layer2.user.query_balance(this, form.acct, form.tid);
            this.$root.alert_success(rs);
          }catch(e){
            layer2.base.top_log(e, 'error');
          }

          close();
          this.$root.loading(false);
          
        }
      });
    },

    async query_actor_version(){
      const r = await layer2.admin.admin_query_actor_version(this, {});
      this.$root.alert_success(JSON.stringify(r));
    },
    async query_remote_actor_version(){
      const r = await layer2.admin.admin_query_remote_actor_version(this, {});
      this.$root.alert_success(JSON.stringify(r));
    },
  }
}
</script>
<style lang="scss">
.tea-AdminOp{
  .xbt{
    margin-left:0;
    margin-right: 10px;
    margin-bottom: 10px;
  }
}

</style>