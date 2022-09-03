<template>
  <div class="tea-page">
    <div class="tea-card">
      <i class="x-icon">
        <img src="fav.png" />
      </i>

      <div class="x-list" style="width: 100%">
        <div class="x-item">
          <b>{{ "Name" | cardTitle }}</b>
          <span>{{ layer1_account ? layer1_account.name : "" }}</span>
        </div>
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
        <div class="x-item">
          <b>{{ "Chain wallet COFFEE balance" }}</b>
          <span
            :inner-html.prop="layer1_account ? layer1_account.usd : '' | usd"
          ></span>
        </div>

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

          <el-button
            :disabled="!(layer1_account && layer1_account.balance)"
            v-if="layer1_account"
            type="primary"
            @click="transferBalance()"
            >Send TEA</el-button
          >
          <el-button
            :disabled="!(layer1_account && layer1_account.usd)"
            v-if="layer1_account"
            type="primary"
            @click="transferUsd()"
            >Send COFFEE</el-button
          >

          <el-button
            type="primary"
            v-if="layer1_account && layer1_account.balance > 0"
            @click="teaToUsd()"
          >
            Sell TEA ({{ rate.teaToUsd }} COFFEE/TEA)
          </el-button>
          <el-button
            type="primary"
            v-if="layer1_account && layer1_account.usd > 0"
            @click="usdToTea()"
          >
            Sell COFFEE ({{ rate.usdToTea }} TEA/COFFEE)
          </el-button>

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
import { numberToHex } from "tearust_layer1";
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

    const layer1_instance = this.wf.getLayer1Instance();
    const api = layer1_instance.getApi();
    const pl = api.consts.genesisExchange.interestPeriodLength.toJSON();
    const query_rate = (
      await api.query.genesisExchange.usdInterestRate()
    ).toJSON();
    const usd_interest_rate = query_rate;
    this.usd_interest_rate =
      usd_interest_rate / 100 + "% per " + pl + " blocks";
    this.usd_interest_rate_number = usd_interest_rate / 100 + "%";
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
          // await this.refreshTappBalanceHandler();
          this.$root.loading(false);
        });
      } catch (e) {
        this.$root.showError(e);
      }
    },

    async refreshAccount(flag = false) {
      flag && this.$root.loading(true);
      await this.wf.refreshCurrentAccount();

      const layer1_account = this.layer1_account;

      await this.queryTokenBalance();
      await this.queryDeposit();

      await this.getExchangeRate();
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
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit("modal/open", {
        key: "transfer_balance",
        param: {},
        cb: async (form, closeFn) => {
          this.$root.loading(true);
          try {
            const { address, amount } = form;

            await this.wf.transferBalance(address, amount);

            closeFn();
            this.$root.success();
            await this.refreshAccount();
          } catch (e) {
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    },
    async transferUsd() {
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit("modal/open", {
        key: "common_form",
        param: {
          title: "Send COFFEE",
          props: {
            target: {
              type: "Input",
              label: "Receiver's address",
            },
            amt: {
              type: "Input",
              label: "COFFEE amount",
            },
          },
        },
        cb: async (form, closeFn) => {
          this.$root.loading(true);
          try {
            const { target, amt } = form;

            await this.wf.transferBalance(target, amt, true);

            closeFn();
            this.$root.success();
            await this.refreshAccount();
          } catch (e) {
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
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

    async getExchangeRate() {
      let rs = null;
      const tmp = await request.layer1_rpc("cml_currentExchangeRate", []);
      console.log(`[cml_currentExchangeRate] result => ${tmp}`);

      this.rate.teaToUsd = utils.layer1.balanceToAmount(tmp[0]);
      this.rate.usdToTea = utils.layer1.balanceToAmount(tmp[1]);
    },

    async teaToUsd() {
      // sell tea
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit("modal/open", {
        key: "common_form",
        param: {
          title: "Sell TEA",
          text: "",
          props: {
            sell_tea_amount: {
              label: "Sell amount (TEA)",
              type: "number",
              // max: this.layer1_account.balance,
              min: 0,
              step: 0.1,
              max: 99999999999999,
              default: undefined,
              tip: 'Click "Confirm" button to see how much you can convert to, or input a number below to convert back.',
              model_action: {
                button_text: "Sell all",
                handler: async () => {
                  const val = utils.layer1.roundAmount(
                    this.layer1_account.balance - 0.01
                  );
                  return val;
                },
              },
            },
            coffee: {
              label: "COFFEE",
              type: "number",
              default: undefined,
              model_action: {
                button_text: "Convert back",
                handler: async (amount) => {
                  const val = utils.layer1.roundAmount(
                    this.rate.usdToTea * amount
                  );
                  return val;
                },
                ref: "sell_tea_amount",
              },
              tip_action: () => {
                helper.openUrl(
                  "https://github.com/tearust/teaproject/wiki/TEA-and-COFFEE#convert-back"
                );
              },
              tip: 'Click to visit wiki for "Convert back"',
            },
          },
        },
        cb: async (form, close) => {
          this.$root.loading(true);

          const amount = form.sell_tea_amount || 0;
          // let estimate = await request.layer1_rpc('cml_estimateAmount', [utils.layer1.amountToBalance(amount), false]);
          try {
            await this.$confirm(
              `Estimated amount is <b>${utils.layer1.roundAmount(
                this.rate.teaToUsd * amount
              )} COFFEE</b> for this exchange. <br/> Are you sure?`,
              {
                dangerouslyUseHTMLString: true,
              }
            );
          } catch (e) {
            this.$root.loading(false);
            return false;
          }

          try {
            const tx = api.tx.genesisExchange.teaToUsd(
              null,
              numberToHex(utils.layer1.amountToBalance(amount))
            );
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshAccount();
            this.$root.success();
            close();
          } catch (e) {
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
        open_cb: async (opts) => {
          await this.getExchangeRate();
          const rate = this.rate.teaToUsd;
          opts.text = `Current exchange rate is <b>${rate} COFFEE/TEA</b>.`;
        },
      });
    },

    async usdToTea() {
      // sell usd
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit("modal/open", {
        key: "common_form",
        param: {
          title: "Sell COFFEE",
          text: "",
          props: {
            sell_usd_amount: {
              label: "Sell amount (COFFEE)",
              type: "number",
              max: this.layer1_account.usd,
              min: 0,
              max: 99999999999999,
              step: 0.1,
              default: undefined,
              tip: 'Click "Confirm" button to see how much you can convert to, or input a number below to convert back.',
              model_action: {
                button_text: "Sell all",
                handler: async () => {
                  const val = this.layer1_account.usd;
                  return val;
                },
              },
            },
            tea: {
              label: "TEA",
              type: "number",
              default: undefined,
              model_action: {
                button_text: "Convert back",
                handler: async (amount) => {
                  const val = utils.layer1.roundAmount(
                    this.rate.teaToUsd * amount
                  );
                  return val;
                },
                ref: "sell_usd_amount",
              },
              tip_action: () => {
                helper.openUrl(
                  "https://github.com/tearust/teaproject/wiki/TEA-and-COFFEE#convert-back"
                );
              },
              tip: 'Click to visit wiki for "Convert back"',
            },
          },
        },
        cb: async (form, close) => {
          this.$root.loading(true);

          const amount = form.sell_usd_amount || 0;
          // let estimate = await request.layer1_rpc('cml_estimateAmount', [utils.layer1.amountToBalance(amount), true]);

          try {
            await this.$confirm(
              `Estimated amount is <b>${utils.layer1.roundAmount(
                this.rate.usdToTea * amount
              )} TEA</b> for this exchange. <br/> Are you sure?`,
              {
                dangerouslyUseHTMLString: true,
              }
            );
          } catch (e) {
            this.$root.loading(false);
            return false;
          }
          try {
            const tx = api.tx.genesisExchange.usdToTea(
              null,
              numberToHex(utils.layer1.amountToBalance(amount))
            );
            await layer1_instance.sendTx(this.layer1_account.address, tx);
            await this.refreshAccount();
            this.$root.success();
            close();
          } catch (e) {
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
        open_cb: async (opts) => {
          await this.getExchangeRate();
          const rate = this.rate.usdToTea;
          opts.text = `Current exchange rate is <b>${rate} TEA/COFFEE</b>.`;
        },
      });
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