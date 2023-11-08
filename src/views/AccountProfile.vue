<template>
  <div class="tea-page">
    <el-alert
      v-if="!!top_log"
      effect="dark"
      @close="top_log=null"
      center
      :closable="true"
      :title="top_log"
      style="margin-top:-24px; margin-bottom:20px;"
      type="warning">
    </el-alert>

    <div class="tea-card">
      <i v-if="!is_mobile" class="x-icon">
        <img src="fav.png" />
      </i>

      <div class="x-list" style="width: 100%">
        
        <div class="x-item">
          <b v-if="!is_mobile">{{ "Address" | cardTitle }}</b>
          <span>
            <font v-if="!is_mobile" class="js_need_copy">{{
              layer1_account ? layer1_account.address : ""
            }}</font>
            <font v-if="is_mobile && layer1_account" data-clipboard-target=".js_need_copy" class="js_need_copy js_copy">{{
              layer1_account.address
            }}</font>
            <span
              v-if="!is_mobile"
              title="copy"
              data-clipboard-target=".js_need_copy"
              style="margin-left: 5px"
              class="iconfont tea-icon-btn icon-copy js_copy"
            ></span>
            <!-- <span @click="showAddressQrcode(layer1_account.address)" style="margin-left: 5px;" title="qrcode" class="iconfont tea-icon-btn icon-qr_code"></span> -->
          </span>
        </div>
        <div class="x-item" v-if="layer1_account && !layer1_account.email">
          <b>
            {{ is_mobile ? 'TEA balance (Chain)' : "Chain wallet TEA balance" }}
            <TeaIconButton
              v-if="!is_mobile"
              style="position: relative"
              place="right"
              tip="
            The amount of TEA in your layer1 wallet (e.g. Metamask wallet) <br/>
            Contract address: (0x89F9B8a7e73F09bee5890A703F4ee86f5Cda053C)
          "
              icon="questionmark"
            />
          </b>
          <span
            style="margin-right: 34px"
            :inner-html.prop="
              layer1_account ? layer1_account.balance : '' | teaIcon
            "
          ></span>
          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            circle
            @click="refreshLayer1Balance($event)"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-item" v-if="layer1_account && !layer1_account.email && layer1_account.usd">
          <b>
            {{ is_mobile ? 'USDT balance (Chain)' : "Chain wallet USDT balance" }}
            <TeaIconButton
              v-if="!is_mobile"
              style="position: relative"
              place="right"
              tip="
            The amount of USDT in your layer1 wallet (e.g. Metamask wallet) <br/>
            Contract address: (0xC2C527C0CACF457746Bd31B2a698Fe89de2b6d49)
          "
              icon="questionmark"
            />
          </b>
          <span
            style="margin-right: 34px"
            :inner-html.prop="
              layer1_account ? layer1_account.usd : ''
            "
          ></span>
          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            circle
            @click="refreshLayer1Balance($event)"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-item">
          <b>
            {{ is_mobile ? 'TEA balance' : "TApp Store wallet TEA balance" }}
            <TeaIconButton
              v-if="!is_mobile"
              style="position: relative"
              place="right"
              tip="
            The amount of TEA ready to be used in your layer2 wallet. These funds can be transferred gas-free to any TApp where you'd like to use the funds
          "
              icon="questionmark"
            />
          </b>
          <span
            v-if="!is_mobile"
            style="margin-right: 34px"
            :inner-html.prop="
              tapp_balance === null ? '...' : tapp_balance+' ('+tapp_balance_ts+')' | teaIcon
            "
          ></span>
          <span
            v-if="is_mobile"
            style="margin-right: 32px"
            :inner-html.prop="
              tapp_balance === null ? '...' : tapp_balance | teaIcon
            "
          ></span>

          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            circle
            @click="refreshTappBalanceHandler($event)"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-item" v-if="usdt_balance">
          <b>
            {{ is_mobile ? 'USDT balance' : "TApp Store wallet USDT balance" }}
            <TeaIconButton
              v-if="!is_mobile"
              style="position: relative"
              place="right"
              tip="
            The amount of USDT ready to be used in your layer2 wallet. These funds can be transferred gas-free to any TApp where you'd like to use the funds
          "
              icon="questionmark"
            />
          </b>
          <span
            v-if="!is_mobile"
            style="margin-right: 34px"
            :inner-html.prop="
              usdt_balance === null ? '...' : usdt_balance+' ('+usdt_balance_ts+')'
            "
          ></span>
          <span
            v-if="is_mobile"
            style="margin-right: 32px"
            :inner-html.prop="
              usdt_balance === null ? '...' : usdt_balance
            "
          ></span>

          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            circle
            @click="refreshTappBalanceHandler($event)"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-item">
          <b>
            {{ is_mobile ? 'TEA credit' : "TApp Store wallet TEA credit" }}
          </b>
          <span
            v-if="!is_mobile"
            style="margin-right: 34px"
            :inner-html.prop="
              tapp_credit === null ? '...' : tapp_credit+' ('+tapp_credit_ts+')' | teaIcon
            "
          ></span>
          <span
            v-if="is_mobile"
            style="margin-right: 32px"
            :inner-html.prop="
              tapp_credit === null ? '...' : tapp_credit | teaIcon
            "
          ></span>

          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            circle
            @click="refreshTappCreditHandler($event)"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-item">
          <b>
            {{ is_mobile ? 'TEA deposit' : "TApp Store wallet TEA deposit" }}
          </b>
          <span
            v-if="!is_mobile"
            style="margin-right: 34px"
            :inner-html.prop="
              tapp_deposit === null ? '...' : tapp_deposit+' ('+tapp_deposit_ts+')' | teaIcon
            "
          ></span>
          <span
            v-if="is_mobile"
            style="margin-right: 32px"
            :inner-html.prop="
              tapp_deposit === null ? '...' : tapp_deposit | teaIcon
            "
          ></span>

          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            circle
            @click="refreshTappDepositHandler($event)"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-item" v-if="usdt_deposit">
          <b>
            {{ is_mobile ? 'USDT deposit' : "TApp Store wallet USDT deposit" }}
          </b>
          <span
            v-if="!is_mobile"
            style="margin-right: 34px"
            :inner-html.prop="
              usdt_deposit === null ? '...' : usdt_deposit+' ('+usdt_deposit_ts+')'
            "
          ></span>
          <span
            v-if="is_mobile"
            style="margin-right: 32px"
            :inner-html.prop="
              usdt_deposit === null ? '...' : usdt_deposit
            "
          ></span>

          <el-button
            size="mini"
            type="primary"
            plain
            icon="el-icon-refresh"
            circle
            @click="refreshTappDepositHandler($event)"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-bottom" :style="is_mobile?'flex-direction:column;':''">

          <!-- <div><el-button
            type="primary"
            v-if="layer1_account"
            @click="toUniswap()"
          >
            TEA | ETH Exchange
          </el-button></div> -->

          <el-tooltip
            v-if="!is_mobile && layer1_account && !layer1_account.email"
            effect="light"
            placement="top"
            :content="`Query transaction with JSON`"
            style="margin-left:20px;"
          >
            <el-button @click="query_txn_with_hash()">Query transaction</el-button>
          </el-tooltip>
          
          <div><el-tooltip
            v-if="layer1_account && !layer1_account.email"
            effect="light"
            placement="top"
            style="margin-left:20px;"
            content="Move TEA funds back to your chain wallet(layer1)."
          >
            <el-button :disabled="!tapp_balance" @click="withdrawHandler()"
              >Withdraw</el-button
            >
          </el-tooltip>

          <el-tooltip
            v-if="layer1_account && !layer1_account.email"
            effect="light"
            placement="top"
            content="Move chain wallet (layer1) TEA funds to layer2 TApp Store wallet account."
          >
            <el-button
              v-if="layer1_account"
              @click="rechargeHandler()"
              >Topup</el-button
            >
          </el-tooltip></div>


          
          <el-button
            type="primary"
            style="margin-left:20px;"
            v-if="user && user.isLogin"
            @click="transferTea()"
          >
            Transfer TEA
          </el-button>

        </div>
      </div>
    </div>



  <TeaTable
    :data="history_list || []"
    name="txn_cache_list"
    style="margin-top: 30px;"
    :pagination="true"
  >
    <TeaTableColumn
      label="Time"
      width="140"
    >
      <template slot-scope="scope">
        {{scope.row.time}}
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Type"
      xs
    >
      <template slot-scope="scope">
        {{scope.row.txn_name}}
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Hash"
    >
      <template slot-scope="scope">
        {{scope.row.hash_hex}}
      </template>
    </TeaTableColumn>


    <TeaTableColumn
      label="Result"
      width="80"
      xs
    >
      <template slot-scope="scope">
        {{scope.row.status}}
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Error"
      xs
    >
      <template slot-scope="scope">
        {{scope.row.error}}
      </template>
    </TeaTableColumn>

    <TeaTableColumn label="Actions" width="140">
      <template slot-scope="scope">
        <TeaIconButton
          tip="Details"
          icon="el-icon-notebook-2"
          @click="show_details(scope.row)"
          style="font-size:21px;"
        />

        <TeaIconButton
          tip="Export to JSON"
          icon="el-icon-share"
          @click="export_details(scope.row)"
          style="font-size:21px;"
          :disabled="scope.row.status!=='Success'"
        />
        
      </template>
    </TeaTableColumn>
  


  </TeaTable>



  </div>
</template>
<script>
import SettingAccount from "../workflow/SettingAccount";
import { _ } from "tearust_utils";
import utils from "../tea/utils";
import { mapGetters, mapState } from "vuex";

import PubSub from "pubsub-js";
import ClipboardJS from "clipboard";
import TeaTable from '../components/TeaTable';
import TeaTableColumn from '../components/TeaTableColumn';
import TeaIconButton from "../components/TeaIconButton";

import layer2 from "../layer2";
import request from "../request";

export default {
  components: {
    TeaIconButton,
    TeaTable,
    TeaTableColumn,
  },
  data() {
    return {
      // tab: 'my_cml',
      tapp_balance: null,
      tapp_balance_ts: '',
      tapp_deposit: null,
      tapp_deposit_ts: '',
      tapp_credit: null,
      tapp_credit_ts: '',
      usdt_balance: null,
      usdt_balance_ts: '',
      usdt_deposit: null,
      usdt_deposit_ts: '',

      top_log: null,

      history_list: null,

      is_mobile: false,
    };
  },

  computed: {
    ...mapGetters(["layer1_account"]),
    ...mapState(['user'])
  },

  async created() {
    this.initCopyEvent();
  },
  beforeDestroy() {
    this.clipboard && this.clipboard.destroy();
  },

  async mounted() {
    this.is_mobile = this.$root.mobile();
    layer2.base.set_global_log(this);

    this.$root.loading(true);
    await utils.sleep(1500);
    this.wf = new SettingAccount();
    await this.wf.init();
    await this.refreshAccount();

    await this.query_history_list();

    this.$root.loading(false);

    utils.register(
      "refresh-current-account__account",
      async (key, param = {}) => {
        await this.refreshAccount();
      }
    );

    _.delay(()=>{
      this.check_balance_for_new_user();
    }, 6000);
  },

  methods: {
    showSelectLayer1() {
      this.wf.showSelectLayer1Modal();
    },

    async rechargeHandler() {
      layer2.user.topupFromLayer1(this, async () => {
        this.$root.success("Topup success.");

        await this.smartRefreshBalance();
      });
      
    },

    async withdrawHandler() {
      try {
        layer2.user.withdrawFromLayer2(this, 1, async () => {

          this.$root.success("Withdraw success.");
          await this.query_history_list();
          await this.smartRefreshBalance();
        });
      } catch (e) {
        this.$root.showError(e);
        await this.query_history_list();
      }
    },


    async refreshAccount(flag = false) {
      flag && this.$root.loading(true);
      await this.wf.refreshCurrentAccount();

      if(this.user && this.user.isLogin){
        await this.queryTokenBalance();
        await this.queryDeposit();

        await this.queryCredit();
      }
      
      
      flag && this.$root.loading(false);
    },

    async refreshTappBalanceHandler(e) {
      this.$root.loading(true, "Refreshing TApp balance ...");
      await this.queryTokenBalance();
      this.$root.loading(false);
      e && e.target && e.target.blur();
    },
    async refreshTappDepositHandler(e) {
      this.$root.loading(true, "Refreshing TApp deposit ...");
      await this.queryDeposit();
      this.$root.loading(false);
      e && e.target && e.target.blur();
    },
    async refreshTappCreditHandler(e) {
      this.$root.loading(true, "Refreshing TApp credit ...");
      await this.queryCredit();
      this.$root.loading(false);
      e && e.target && e.target.blur();
    },
    async refreshLayer1Balance(e) {
      this.$root.loading(true);
      await this.wf.refreshCurrentAccount();
      this.$root.loading(false);
      e && e.target && e.target.blur();
    },

    async queryTokenBalance() {
      try {
        const r = await layer2.user.query_balance_with_ts(this);
        this.tapp_balance = r.tea;
        this.tapp_balance_ts = r.ts;
        const r1 = await layer2.user.query_usdt_with_ts(this);
        this.usdt_balance = r1.tea;
        this.usdt_balance_ts = r1.ts;
      } catch (e) {
        console.error(e);
      }
    },
    async queryDeposit() {
      try {
        const r = await layer2.user.query_deposit_with_ts(this);
        this.tapp_deposit = r.tea;
        this.tapp_deposit_ts = r.ts;
        const r1 = await layer2.user.query_usdt_deposit_with_ts(this);
        this.usdt_deposit = r1.tea;
        this.usdt_deposit_ts = r1.ts;
      } catch (e) {
        console.error(e);
      }
    }, 
    async queryCredit() {
        const r = await layer2.user.query_credit_with_ts(this);
        this.tapp_credit = r.tea;
        this.tapp_credit_ts = r.ts;
    },

    async transferTea(){
      // if(!this.check_balance_for_new_user()) return;
      await layer2.user.transferTea(this, {}, async (is_success)=>{
        if(is_success){
          await this.refreshTappBalanceHandler();
          this.smartRefreshBalance();
        }
        
        await this.query_history_list();
      });
    },

    async transferBalance() {
      this.$root.alert_success("Please use Metamask wallet to send");
    },
    async transferUsd() {
      this.$root.alert_success("Please use Metamask wallet to send");
    },

    clickRefreshBtn() {
      utils.publish("refresh-current-account__account");
    },

    showAddressQrcode(address) {
      PubSub.publish("tea-qrcode-modal", {
        info: null,
        visible: true,
        text: address,
      });
    },

    initCopyEvent() {
      const clipboard = new ClipboardJS(".js_copy");
      this.clipboard = clipboard;
      clipboard.on("success", (e) => {
        e.clearSelection();
        this.$root.success("Copied");
      });

      clipboard.on("error", (e) => {});
    },

    toUniswap(){
      const url = 'https://app.uniswap.org/#/pool/45838';
      window.open(url, "_blank");
    },

    async smartRefreshBalance(){
      const max_time = 6;

      let n = 1;
      this.$root.loading(false);
      const loop = async ()=>{
        await this.wf.refreshCurrentAccount(); 
        await this.queryTokenBalance();

        if(n > max_time){
          return false;
        }

        await utils.sleep(5000);
        n++;
        await loop();
      };

      await loop();
    },

    async query_history_list(){
      const list = await layer2.log.query_history_list(this, {sender: this.layer1_account.address});

      if(this.is_mobile){
        this.history_list = _.map(list, (item)=>{
          item.mobile_data = {
            'Type': item.txn_name,
            'Hash': item.hash_hex,

            'Sender': item.sender,
            'Nonce': item.nonce,
            'Status': item.txn_status,
            'Result': item.status,
            'Error': item.error,
            'Executed at': item.exec_time,
          };
          return item;
        });
      }
      else{
        this.history_list = list;
      }
      
    },

    async show_details(row){
      const mm = {
        'Type': row.txn_name,
        'Hash': row.hash_hex,

        'Sender': row.sender,
        'Nonce': row.nonce,
        'Status': row.txn_status,
        'Result': row.status,
        'Error': row.error,
        'Executed at': row.exec_time,
      };
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...mm,
          title: 'Txn details',
        },
      });
    },

    async export_details(row){
      await layer2.log.export_details(this, row);
    },

    async query_txn_with_hash(){
      // if(!this.check_balance_for_new_user()) return;
      await layer2.log.import_txn_details_and_verify(this, {}, async(r)=>{
        if(!r.status && r.error === 'transaction dropped'){
          this.$root.showError("This transaction cannot be found.");
        }
        else if (r.ts){
          const time = layer2.base.ts_to_time(r.ts);
          this.$root.alert_success("This txn has been processed at "+time+"(local time)");
        }
        else if(r.str){
          this.$root.alert_success("This txn "+r.str);
        }
        else if (r.error) {
          this.$root.showError(r.error);
        }
      })
    },
    
    check_balance_for_new_user(){
      const b1 = this.layer1_account.balance;
      const b2 = this.tapp_balance;
      const b3 = this.tapp_credit;

      const key_id = (k)=>{
        return this.layer1_account.address+'__tip__'+k;
      };

      const t1 = !!utils.cache.get(key_id('t1'));
      if(!t1 && b1===0 && b2===0 && b3===0){
        const html = "If you're a first-time user of TEA Project or don't have any TEA tokens, we have created a credit faucet to assist you in getting TEA credits to start your journey here. <br/>Please navigate to 'TApps' on the navigation bar and click on the 'TEAfluence' app to visit the TEAfluencer page.";
        this.$root.alert_success(html, 'Welcome to TEA');

        utils.cache.put(key_id('t1'), true);
        return false;
      }
      const t2 = !!utils.cache.get(key_id('t2'));
      if(t2 && b2===0 && b3===0 && b1>0){
        const html = "You have zero TEA balance. <br/>Please top up your TEA token from Ethereum chain to TEA Project and continue";
        this.$root.alert_success(html, 'Topup first.');

        utils.cache.put(key_id('t2'), true);
        return false;
      }

      return true;
    },
    
  },
};
</script>

<style lang="scss">
.tea-page {
  .t-major-financial {
    margin-top: 5px;
    text-align: right;
    padding-right: 8px;

    b {
      color: #35a696;
    }
    span {
      margin: 0 5px;
      color: #c9c9c9;
    }
    span.iconfont {
      color: #35a696;
      margin: 0;
    }
  }
}
</style>