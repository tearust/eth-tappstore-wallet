<template>
  <div class="tea-page">
    <div style="min-height: 24px">
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
        Please switch to "All" to explore more seats.
      </span>


      <el-button
        size="small"
        class="tea-refresh-btn"
        type="primary"
        plain
        icon="el-icon-refresh"
        circle
        @click="refresh()"
      ></el-button>
    </div>

    <div style="position: relative; top: 15px">
      <el-tooltip effect="light">
        <div slot="content">
          Number of blocks until the next settlement period takes effect. <br/>When the settlement period is in effect, the self-assessed price cannot be changed and node licenses cannot be bought or sold. <br/>Additionally during the settlement period, the daily state maintainer tax is charged, any ownership transfers are executed, <br/>and the price for each node will be updated according to the latest self-assessments.
        </div>
        <span>Next settlement period: </span>
      </el-tooltip>
      <b style="color: #35a696">{{calculate_to_next_day(chain.current_block)}}</b>
      <span style="margin-left: 10px" v-if="disable_action_time">Seat market disabled now.</span>

      <span v-if="!mine && ave_price" style="color: #333;float:right;">
        Seat average price is <b style="color: #35a696;" :inner-html.prop="ave_price | balance"></b>
      </span>
    </div>

    <TeaTable
      style="margin-top: 15px"
      :data="list || []"
      name="seat_main_list_table"
    >
      <el-table-column prop="id" label="ID" width="70" sortable>
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>

      <TeaTableColumn label="Maintainer" width="120">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.maintainer"
            size="small"
            type="text"
            @click="$root.to_user_detail(scope.row.maintainer)"
            >{{ scope.row.maintainer }}</el-button
          >
        </template>
      </TeaTableColumn>

      <TeaTableColumn label="Status" width="80">
        <template slot-scope="scope">
          <span :inner-html.prop="scope.row.market_status"></span>
        </template>
      </TeaTableColumn>

      <TeaTableColumn
        prop="real_price"
        label="estimate price"
        width="120"
        sortable
      >
        <template slot-scope="scope">
          <span :inner-html.prop="scope.row.real_price | teaIcon"></span>
        </template>
      </TeaTableColumn>
      <TeaTableColumn label="Last estimate price" width="120">
        <template slot-scope="scope">
          <span
            v-if="!!scope.row.estimate_at"
            :inner-html.prop="scope.row.price | teaIcon"
          ></span>
        </template>
      </TeaTableColumn>
      <TeaTableColumn label="Last price change at" width="100">
        <template slot-scope="scope">
          <span :inner-html.prop="scope.row.estimate_at"></span>
        </template>
      </TeaTableColumn>

      <TeaTableColumn label="Next maintainer" width="120">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.deal_user"
            size="small"
            type="text"
            @click="$root.to_user_detail(scope.row.deal_user)"
            >{{ scope.row.deal_user }}</el-button
          >
        </template>
      </TeaTableColumn>

      <TeaTableColumn label="Sold at" width="100">
        <template slot-scope="scope">
          <span :inner-html.prop="scope.row.deal_at"></span>
        </template>
      </TeaTableColumn>

      <TeaTableColumn label="Sold price" width="100">
        <template slot-scope="scope">
          <span
            v-if="scope.row.deal_price"
            :inner-html.prop="scope.row.deal_price | teaIcon"
          ></span>
        </template>
      </TeaTableColumn>

      <TeaTableColumn label="Deposit" width="100">
        <template slot-scope="scope">
          <span :inner-html.prop="scope.row.market_deposit | teaIcon"></span>
        </template>
      </TeaTableColumn>

      <el-table-column label="Actions" fixed="right">
        <template v-if="user && user.isLogin" slot-scope="scope">
          <TeaIconButton
            tip="Buy seat"
            icon="buy"
            @click="buySeat(scope.row)"
            v-if="user && user.isLogin && scope.row.maintainer !== user.address"
            :disabled="scope.row.market_status === 'Pending'"
          />
          <TeaIconButton
            tip="Update estimate price"
            icon="upload"
            @click="updateSeatEstimate(scope.row)"
            v-if="user && user.isLogin && scope.row.maintainer === user.address"
            :disabled="
              scope.row.market_status === 'Pending' || !!scope.row.estimate_at
            "
          />
          <TeaIconButton
            tip="Giveup seat ownership"
            icon="unstake"
            @click="giveupSeatOwnership(scope.row)"
            v-if="user && user.isLogin && scope.row.maintainer === user.address"
            :disabled="scope.row.market_status === 'Pending'"
          />
        </template>
      </el-table-column>
    </TeaTable>
  </div>
</template>
<script>
import Base from "../workflow/Base";
import utils from "../tea/utils";
import { mapGetters, mapState } from "vuex";

import TeaTable from "../components/TeaTable";
import TeaIconButton from "../components/TeaIconButton";
import TeaTableColumn from "../components/TeaTableColumn";

import layer2 from "../layer2";

const seat_market_disabled_error =
  "Seat market is disabled now. please try later.";
export default {
  components: {
    TeaTable,
    TeaIconButton,
    TeaTableColumn,
  },
  data() {
    return {
      mine: true,
      list: null,

      disable_action_time: false,
      current_block: null,

      ave_price: null,
    };
  },
  computed: {
    ...mapGetters(["layer1_account"]),
    ...mapState(["user", "chain"]),
  },
  async mounted() {
    this.wf = new Base();
    await this.wf.init();

    if (this.user && this.user.isLogin) {
      this.mine = true;
    } else {
      this.mine = false;
    }

    await this.refresh();
  },
  methods: {
    async refresh() {
      this.$root.loading(true);

      const param = {};
      if (this.mine) {
        param.maintainer = this.layer1_account.address;
      }

      const x_list = await layer2.seat.querySeatList(this, param);
      console.log(11, x_list);
      this.list = x_list;

      if(!this.mine){
        this.ave_price = x_list[0].ave_price;
      }

      this.$root.loading(false);
    },
    async changeHandler() {
      await this.refresh();
    },

    async buySeat(row) {
      if (this.disable_action_time) {
        return this.$root.showError(seat_market_disabled_error);
      }
      await layer2.seat.buySeat(this, row, async () => {
        await this.refresh();
      });
    },
    async updateSeatEstimate(row) {
      if (this.disable_action_time) {
        return this.$root.showError(seat_market_disabled_error);
      }
      await layer2.seat.updateSeatEstimate(this, row, async () => {
        await this.refresh();
      });
    },
    async giveupSeatOwnership(row) {
      if (this.disable_action_time) {
        return this.$root.showError(seat_market_disabled_error);
      }
      await layer2.seat.giveupSeatOwnership(this, row, async () => {
        await this.refresh();
      });
    },

    calculate_to_next_day(block) {
      const { day_block, disabled_block } = layer2.seat.getMeta();

      if (block === this.current_block) {
        return day_block - (block % day_block);
      }

      this.current_block = block;
      const rem_block = block % day_block;
      if (rem_block === disabled_block) {
        this.refresh();
      }

      if (rem_block <= disabled_block) {
        if (!this.disable_action_time) this.disable_action_time = true;
      } else {
        if (this.disable_action_time) this.disable_action_time = false;
      }

      return day_block - rem_block;
    },
  },
};
</script>