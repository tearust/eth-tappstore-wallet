<template>
  <div class="tea-page">
    <div class="tea-card">
      <i class="x-icon">
        <img src="fav.png" />
      </i>

      <div class="x-list" style="width: 100%">
        
        <div class="x-item">
          <b>{{ "Address" | cardTitle }}</b>
          <span>
            <font class="js_need_copy">{{
              layer1_account ? layer1_account.address : ""
            }}</font>
            <span
              title="copy"
              data-clipboard-target=".js_need_copy"
              style="margin-left: 5px"
              class="iconfont tea-icon-btn icon-copy js_copy"
            ></span>
            <!-- <span @click="showAddressQrcode(layer1_account.address)" style="margin-left: 5px;" title="qrcode" class="iconfont tea-icon-btn icon-qr_code"></span> -->
          </span>
        </div>
        <div class="x-item">
          <b>
            {{ "Chain wallet TEA balance" }}
            <TeaIconButton
              style="position: relative"
              place="right"
              tip="
            The amount of TEA in your layer1 wallet (e.g. Metamask wallet)
          "
              icon="questionmark"
            />
          </b>
          <span
            :inner-html.prop="
              layer1_account ? layer1_account.balance : '' | teaIcon
            "
          ></span>
        </div>
        <!-- <div class="x-item">
          <b>
            {{ "Chain wallet ETH balance" }}
            <TeaIconButton
              style="position: relative"
              place="right"
              tip="
            The amount of ETH in your layer1 wallet (e.g. Metamask wallet)
          "
              icon="questionmark"
            />
          </b>
          <span
            :inner-html.prop="
              layer1_account ? layer1_account.eth : ''
            "
          ></span>
        </div> -->
        <!-- <div class="x-item">
          <b>{{ "Chain wallet COFFEE balance" }}</b>
          <span
            :inner-html.prop="layer1_account ? layer1_account.usd : '' | usd"
          ></span>
        </div> -->

        <div class="x-item">
          <b>
            {{ "TApp store wallet TEA balance" }}
            <TeaIconButton
              style="position: relative"
              place="right"
              tip="
            The amount of TEA ready to be used in your layer2 wallet. These funds can be transferred gas-free to any TApp where you'd like to use the funds
          "
              icon="questionmark"
            />
          </b>
          <span
            style="margin-right: 34px"
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
            @click="refreshTappBalanceHandler()"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-item">
          <b>
            {{ "TApp store wallet TEA deposit" }}
            <!-- <TeaIconButton
              style="position: relative"
              place="right"
              tip="
            The amount of TEA ready to be used in your layer2 wallet. These funds can be transferred gas-free to any TApp where you'd like to use the funds
          "
              icon="questionmark"
            /> -->
          </b>
          <span
            style="margin-right: 34px"
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
            @click="refreshTappDepositHandler()"
            style="right: 0; position: absolute"
          ></el-button>
        </div>

        <div class="x-bottom">
          
          <el-tooltip
            effect="light"
            placement="top"
            content="Move TEA funds back to your chain wallet(layer1)."
          >
            <el-button :disabled="!tapp_balance" @click="withdrawHandler()"
              >Withdraw</el-button
            >
          </el-tooltip>

          <el-tooltip
            effect="light"
            placement="top"
            content="Move chain wallet (layer1) TEA funds to layer2 TApp Store wallet account."
          >
            <el-button
              style="margin-right: 20px"
              v-if="layer1_account"
              @click="rechargeHandler()"
              >Topup</el-button
            >
          </el-tooltip>

          <!-- <el-button
            v-if="layer1_account"
            type="primary"
            @click="transferBalance()"
            >Send TEA</el-button
          >
          <el-button
            v-if="layer1_account"
            type="primary"
            @click="transferUsd()"
            >Send COFFEE</el-button
          > -->

          

          <el-button
            type="primary"
            v-if="layer1_account"
            @click="transferTea()"
          >
            Transfer TEA
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import SettingAccount from "../workflow/SettingAccount";
import { _ } from "tearust_utils";
import utils from "../tea/utils";
import { mapGetters, mapState } from "vuex";

import PubSub from "pubsub-js";
import ClipboardJS from "clipboard";
import TeaIconButton from "../components/TeaIconButton";

import layer2 from "../layer2";
import request from "../request";

export default {
  components: {
    TeaIconButton,
  },
  data() {
    return {
      // tab: 'my_cml',
      tapp_balance: null,
      tapp_deposit: null,

      rate: {
        usdToTea: null,
        teaToUsd: null,
      },
      usd_interest_rate: null,
      usd_interest_rate_number: null,
    };
  },

  computed: {
    ...mapGetters(["layer1_account"]),
  },

  async created() {
    this.initCopyEvent();
  },
  beforeDestroy() {
    this.clipboard && this.clipboard.destroy();
  },

  async mounted() {
    layer2.base.set_global_log(this);

    this.$root.loading(true);

    this.wf = new SettingAccount();
    await this.wf.init();
    await this.refreshAccount();

    this.$root.loading(false);

    utils.register(
      "refresh-current-account__account",
      async (key, param = {}) => {
        await this.refreshAccount();
      }
    );

    
  },

  methods: {
    showSelectLayer1() {
      this.wf.showSelectLayer1Modal();
    },

    async rechargeHandler() {
      layer2.user.topupFromLayer1(this, async () => {
        this.$root.success("Topup success.");

        await utils.sleep(2000);
        this.$root.loading(true, "Refreshing balance ...");
        await utils.sleep(8000);

        await this.refreshAccount();
        this.$root.loading(false);
      });
    },

    async withdrawHandler() {
      try {
        layer2.user.withdrawFromLayer2(this, 1, async () => {
          await utils.sleep(2000);
          this.$root.loading(true, "Refreshing balance ...");
          await utils.sleep(12000);
          await this.refreshAccount();
          this.$root.loading(false);
        });
      } catch (e) {
        this.$root.showError(e);
      }
    },

    async refreshAccount(flag = false) {
      flag && this.$root.loading(true);
      await this.wf.refreshCurrentAccount();

      await this.queryTokenBalance();
      await this.queryDeposit();

      flag && this.$root.loading(false);
    },

    async refreshTappBalanceHandler() {
      this.$root.loading(true, "Refreshing TApp balance ...");
      await this.queryTokenBalance();
      this.$root.loading(false);
    },
    async refreshTappDepositHandler() {
      // this.$root.loading(true, "Refreshing TApp deposit ...");
      await this.queryDeposit();
      // this.$root.loading(false);
    },

    async queryTokenBalance() {
      try {
        this.tapp_balance = await layer2.user.query_balance(this);
      } catch (e) {
        console.error(e);
      }
    },
    async queryDeposit() {
      try {
        this.tapp_deposit = await layer2.user.query_deposit(this);
      } catch (e) {
        console.error(e);
      }
    }, 

    async transferTea(){
      await layer2.user.transferTea(this, {}, async ()=>{
        await this.refreshTappBalanceHandler();
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