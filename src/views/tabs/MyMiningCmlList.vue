<template>
<div class="tea-page">

  <p style="float:right; margin-bottom: 4px; color: #999;">
    Please click <b>Create entity</b> to generate an investment token after planting. Failing to create an entity will result in a loss of all mining rewards.
  </p>

  <TeaTable 
    :data="list"
    name="profile_cml_list_table"
    v-loading="table_loading"
    :row-class-name="tableRowClassName"
  >
    <el-table-column
      prop="id"
      sortable
      label="CML ID"
      width="80"
    >
      <template slot-scope="scope">
        <el-button style="width:auto;" type="text" @click="$router.push('/cml_details/'+scope.row.id)">{{scope.row.id}}</el-button>

        <!-- <span v-if="scope.row.version_expired" @click="fixVersionExpired(scope)" style="color:red;font-size:12px;margin-left: 8px;">(Click to update)</span> -->
      </template>
    </el-table-column>

    <el-table-column
      label="ERC20 address"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.layer2 && scope.row.layer2.entity_id" :inner-html.prop="(scope.row.erc20_address ||'') | erc20"></span>
      </template>
    </el-table-column>


    <el-table-column
      prop="liferemaining"
      label="Life remaining"
      width="120"
      sortable
    >
      <template slot-scope="scope">
        {{scope.row.life_day}}
      </template>
    </el-table-column>

    <el-table-column
      prop="machine_id"
      label="Miner ID"
    > 
      <template slot-scope="scope">
        <el-button
          @click="showMinerInfo(scope.row)"
          type="text"
          size="small">
          {{scope.row.layer2 && scope.row.layer2.tea_id_b64 ? scope.row.layer2.tea_id_b64 : ''}}
        </el-button>
      </template>
    </el-table-column>

    <el-table-column
      prop="performance"
      label="Peak performance"
    />

    <!-- <el-table-column
      label="Remaining performance"
    >
      <template>
        {{'TODO'}}
      </template>

    </el-table-column> -->

    <el-table-column
      label="Entity"
      width="200"
    >
      <template slot-scope="scope">
        <el-button v-if="scope.row.layer2 && scope.row.layer2.entity_id" size="small" type="text" @click="$root.to_entity_detail(scope.row.layer2.entity_id)">{{scope.row.layer2.entity_id}}</el-button>

        <el-button v-if="!scope.row.layer2 || !scope.row.layer2.entity_id" :disabled="!(scope.row.layer2 && scope.row.layer2.planted_at)" size="small" type="text" @click="createEntity(scope.row)">Create entity</el-button>
      </template>
    </el-table-column>

    <el-table-column
      label="Actions"
      fixed="right"
      width="120"
    >
      <template slot-scope="scope">
        <TeaIconButton
          :disabled="!!(
            scope.row.layer2 && scope.row.layer2.planted_at 
          )"
          @click="clickPlantAction(scope)"
          tip="Plant"
          icon="plant"
        />
        <TeaIconButton
          :disabled="
            !(scope.row.layer2 && scope.row.layer2.planted_at )
          "
          @click="clickUnplantAction(scope)"
          tip="Unplant"
          icon="stop"
        />

        <TeaIconButton
          :disabled="!!(
            scope.row.layer2 && scope.row.layer2.planted_at 
          )"
          @click="transferToOther(scope)"
          tip="Transfer to other account"
          icon="pay-back"
        />

      </template>
    </el-table-column>
  </TeaTable>

  <el-dialog
    title="Update miner software"
    :visible="update_modal.visible"
    width="78%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @close="update_modal.visible=false"
  >
    <p class="c-info">
      Please follow the steps blow to update your miners software to the latest version. <br/>
      <ol>
        <li>
          Click
          <span class="button" @click="schedule_down()">Schedule down</span> your CML so that other validators will not report your node offline.
        </li>
        <li>
          Login to your mining node and run <br/>
          <pre class="code">
sh -c "$(curl -fsSL https://raw.githubusercontent.com/tearust/delegator-resources/epoch9/install.sh)" "" "update"
          </pre><br/>
          And if you are running as a validator in layer1, please run the following command instead.
          <pre class="code">
sh -c "$(curl -fsSL https://raw.githubusercontent.com/tearust/delegator-resources/epoch9/install.sh)" "" "update" "true"
          </pre><br/>
          This scripts will update the mining software and restart.
        </li>
        <li>
          The last step, as long as the previous command completed, click
          <span class="button" @click="schedule_up()">Schedule up</span>.
          Now you can click the [Update completed] button to close this window.

        </li>

      </ol>
    </p>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="update_modal.visible=false">Update later</el-button>
      <el-button size="small" type="primary" @click="update_modal_confrim()">
        Update completed
      </el-button>
    </span>
  </el-dialog>

</div>
</template>
<script>
import Base from '../../workflow/Base';
import {_} from 'tearust_utils';
import utils from '../../tea/utils';
import { mapGetters, mapState } from 'vuex';
import {hexToString, stringToHex, hexToU8a, compactAddLength, u8aToHex} from 'tearust_layer1';
import TeaTable from '../../components/TeaTable';
import TeaIconButton from '../../components/TeaIconButton';
import helper from '../helper';

import layer2 from '../../layer2';
export default {
  components: {
    TeaTable,
    TeaIconButton,
  },
  data(){
    return {
      list: [],
      table_loading: true,

      update_modal: {
        visible: false,
        param: null,
      }
    };
  },

  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  watch: {
    async layer1_account(from, to){
      if(from.address !== to.address){
        await this.refresh();
      }
      
    }
  },
  
  async mounted(){
    
    this.wf = new Base();
    await this.wf.init();

    utils.register('page-mining-my_cml', async ()=>{
      await this.refresh();
    });
    
    await this.refresh();
  },

  methods: {

    async refresh(){
      this.table_loading = true;

      this.list = null;
      await utils.sleep(1000);
      // this.list = await this.initCheckMinerVersion();

      const list = await layer2.miner.queryCmlList(this, {
        owner: this.layer1_account.address,
      });
      this.list = list;

      this.table_loading = false;
    },

    // async initCheckMinerVersion(){
    //   let expired_miner_list = [];
    //   try{
    //     expired_miner_list = await request.layer1_rpc('tea_versionExpiredNodes', []);
    //   }catch(e){}
      
    //   const cml_list = _.cloneDeep(this.layer1_account.cml);
    //   _.each(expired_miner_list, (mm)=>{
    //     const miner_id = u8aToHex(mm);

    //     const cml_index = _.findIndex(cml_list, (c)=>{
    //       return c.machine_id === miner_id;
    //     });
    //     if(cml_index > -1){
    //       cml_list[cml_index].version_expired = true;
    //     }
    //   });
    //   // cml_list[3].version_expired = true;
      
    //   return cml_list;
    // },
    

    async showMinerInfo(miner_id){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      let mm = await api.query.cml.minerItemStore(miner_id);
      mm = mm.toJSON();

      mm.id = ' '+utils.minerHexToB64(mm.id);
      mm.ip = hexToString(mm.ip);
      
      this.$store.commit('modal/open', {
        key: 'data_details',
        param: {
          ...mm,
          title: 'Miner Details',
        },
      });
    },

    clickPlantAction(scope){
      // if(this.layer1_account.balance <= 1001){
      //   this.$root.showError('You need at least 1001 TEA to plant CML. You can put up some of your extra <a href="https://github.com/tearust/teaproject/wiki/Genesis-TEA-Loans" target="_blank">CML seeds for a Genesis Loan</a> and receive TEA in return.');

      //   return;
      // }

      this.$router.push('/plant_helper/'+scope.row.id);
    },

    async transferToOther(scope){
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$store.commit("modal/open", {
        key: "common_form",
        param: {
          title: "Transfer CML",
          props: {
            cml_id: {
              type: 'Input',
              label: 'CML',
              disabled: true,
              default: scope.row.id,
            },
            target: {
              type: "Input",
              label: "Receiver's address",
            },
          },
        },
        cb: async (form, closeFn) => {
          this.$root.loading(true);
          try {
            const { cml_id, target } = form;

            const tx = api.tx.cml.transfer(cml_id, target);
            await layer1_instance.sendTx(this.layer1_account.address, tx);

            closeFn();
            this.$root.success();
            await this.wf.refreshCurrentAccount();
            await this.refresh();
          } catch (e) {
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });

    },

    async clickUnplantAction(scope){

      // const tmp = await request.layer1_rpc('cml_estimateStopMiningPenalty', [scope.row.id]);
      // const ct = utils.layer1.balanceToAmount(tmp);
      // try{
      //   let msg = 'Are you sure you want to unplant this CML? <br/>';
      //   if(ct > 0){
      //     msg = `Please note that you'll need to compensate a total of ${ct} TEA to stakers.`;
      //   }

      //   await this.$confirm(msg, {
      //     title: 'Info',
      //     dangerouslyUseHTMLString: true,
      //   });
      // }catch(e){
      //   return;
      // }

      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try{

        await layer2.miner.stopMining(this, {
          cml_id: scope.row.id,
        }, ()=>{});


        this.$root.success();
        await this.refresh();
        // utils.publish('refresh-current-account__account');
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    async resumeMiner(scope){
      await helper.resumeMiner(this, scope.row.id, async ()=>{
        this.$root.success();
        await this.refresh();
        // utils.publish('refresh-current-account__account');
      });
    },
    tableRowClassName({row}){
      if(row.version_expired){
        return 'v-error';
      }
      return '';
    },
    async fixVersionExpired(scope){
      this.update_modal.visible = true;
      this.update_modal.param = scope.row;
    },

    async schedule_down(){
      const row = this.update_modal.param;
      await helper.scheduleDownMiner(this, row.id, async ()=>{
        this.$root.success('success, please update your miner.');
      });
    },
    async schedule_up(){
      const row = this.update_modal.param;
      await helper.scheduleUpMiner(this, row.id, async ()=>{
        this.$root.success('success, please click [Update completed] to close the window.');
      });
    },
    async update_modal_confrim(){
      const row = this.update_modal.param;
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();
      this.$root.loading(true);
      try{
        const tx = api.tx.tea.resetExpiredState(row.machine_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        await utils.sleep(3000);
        this.update_modal.visible = false;
        
      }catch(e){
        this.$root.showError(e);
      }
    
      await this.refresh();
      this.$root.loading(false);
    },
    async transferToControllerAccount(row){
      await helper.transferToCmlControllerAccount(this, row.miner_controller_account, async ()=>{
        utils.publish('refresh-current-account__account');
      });
    },

    async createEntity(row){
      try{
        await layer2.miner.createEntityForCml(this, row.id, async (rs)=>{
          this.$root.success("create tapp success");
          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }
    }

  }

  
}
</script>
