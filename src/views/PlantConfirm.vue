<template>
<div>
  <div class="tea-page" v-if="step===1">
    <h4 v-if="action==='plant'">Activate miner for CML {{cml_id}}</h4>
    <h4 v-if="action==='migrate'">Migrate miner for CML {{cml_id}}</h4>

    <p v-if="!error && action==='plant'">
      You have completed setup of your mining machine. The final step is to click the below <strong>Activate miner</strong> button. <br/>
      Once your mining node has started, you can go to the CML detail page to manage your mining CML.
    </p>
    <p v-if="!error && action==='migrate'">
      You have completed setup of your mining machine. The final step is to click the below <strong>Migrate miner</strong> button. <br/>
    </p>
    
    <p style="font-size:18px; color: #f00;" v-if="error">
      Can't activate or migrate miner, see reason below.<br/>
      {{error}}
    </p>

    <div
      v-if="!error"
      style="display: flex; justify-content: flex-start; margin-top: 10px"
    >
      <el-button
        style="padding-left: 15px; padding-right: 15px; width:250px;"
        @click="testPlant()"
        v-if="action==='plant'"
        type="primary"
      >
        Activate miner
      </el-button>

      <el-button
        style="padding-left: 15px; padding-right: 15px; width:250px;"
        @click="testMigrate()"
        v-if="action==='migrate'"
        type="primary"
      >
        Migrate miner
      </el-button>
      
    </div>
  </div>

  <div class="tea-page" v-if="step===2">
    <h2>Miner activated successfully.</h2>

    <h4>
      Please read carefully before hosting any applications. Failure to do so could result in penalties.
    </h4>
    <p>
      After you activate your newly planted CML, you still need to wait for your new node to sync up with the blockchain's latest block. Depending on your network speed, this sync-up may take up to a few minutes to several hours. Your node cannot provide any hosting services while negotiating the sync even though the status shows "active". If you host any application and your node hasn't yet synced, your node may be marked as "offline" which will result in a penalty.
    </p>
    <h4>
      How to determine if your node is completely synced-up?
    </h4>

    <div>
      You will need to login (ssh) to your node and type in the following command:

      <b class="t-code">
        sudo docker logs -f -n 10 delegate-layer1
      </b>

    </div>

    <div style="margin-top:15px;">If you can see the output like the following screenshot (note the "Imported" lines in the log): </div>
    <div style="width:80%;margin:5px 0">
      <img src="../assets/images/c_1.png" />
    </div>
    <div>then your machine has completed syncing and is ready to host applications.</div>

    <div style="margin-top: 15px;">But if you see log messages as in the following screenshot (note the "Syncing .... target:.....best:... finalized #..." line):</div>
    <div style="width:80%;margin:5px 0;">
      <img src="../assets/images/c_2.png" />
    </div>
    <div>then your machine is still syncing up to the latest block. Do NOT host any applications just yet. Check again after a few minutes or hours.</div>

    
  </div>
    
</div>
</template>
<script>
import Base from "../workflow/Base";
import { _ } from "tearust_utils";
import utils from "../tea/utils";
import { mapGetters } from "vuex";
import layer2 from '../layer2';

export default {
  components: {

  },
  data() {
    return {
      step: 1,
      cml_id: null,
      orbit_id: null,
      form: null,
      action: null,

      error: null,
    };
  },
  computed: {
    ...mapGetters(["layer1_account"])
  },
  watch: {
    async layer1_account(){
      await this.checkCanActive();
    }
  },
  async mounted() {
    this.$root.loading(true);

    this.cml_id = utils.urlHashParam('cml');
    this.orbit_id = utils.urlHashParam('orbit');

    this.form = utils.cache.get('cml_plant_'+this.cml_id) || {};
    this.action = this.form.action&&this.form.action==='migrate' ? 'migrate' : 'plant';

    console.log('action =>', this.action);
    console.log('cml_id =>', this.cml_id);
    console.log('orbit_id =>', this.orbit_id);

    if(!this.cml_id || !this.orbit_id){
      this.fail('Invalid params.');
      return;
    }

    this.wf = new Base();
    await this.wf.init();

    if(this.action === 'plant'){
      await this.checkCanActive();
    }

    this.$root.loading(false);

  },
  methods: {

    async checkCanActive(){
      

      const cml = await layer2.miner.queryCmlDetails(this, {
        cml_id: this.cml_id,
      });

      if(cml.layer2 && cml.layer2.planted_at){
        // this.fail('CML already active.');
        this.step = 2;
        return;
      }

      if(cml.owner !== this.layer1_account.address){
        this.fail(`CML owner is invalid.`);
        return;
      }

      this.fail(null);
    },

    fail(str){
      if(str){
        this.error = str;
      }
      else{
        this.error = null;
      }
      this.$root.loading(false);
    },
    
    async testPlant() {

      const form = this.form;

      if(!form){
        this.fail('Invalid cache for CML.');
        return;
      }

      this.$root.loading(true);
      try {
        // validate tea and coffee balance
        // if(this.layer1_account.balance <= 1000){
        //   throw 'You need 1000 TEA for the first staking slot. You can put up some of your extra <a href="https://github.com/tearust/teaproject/wiki/Genesis-TEA-Loans" target="_blank">CML seeds for a Genesis Loan</a> and receive TEA in return.';
        // }
        // if(this.layer1_account.usd <= form.miner_price){
        //   throw 'You need '+form.miner_price+' COFFEE to pay for this mining machine.';
        // }

        const form = this.form;
       
        await layer2.miner.startMining(this, form, ()=>{});

        utils.cache.remove('cml_plant_'+this.cml_id);

        this.step = 2;
      } catch (e) {
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },

    async testMigrate() {
    
      const form = this.form;

      if(!form){
        this.fail('Invalid cache for CML.');
        return;
      }

      this.$root.loading(true);
      try {
        // validate tea and coffee balance
        // if(this.layer1_account.balance <= 1000){
        //   throw 'You need 1000 TEA for the first staking slot. You can put up some of your extra <a href="https://github.com/tearust/teaproject/wiki/Genesis-TEA-Loans" target="_blank">CML seeds for a Genesis Loan</a> and receive TEA in return.';
        // }
        // if(this.layer1_account.usd <= form.miner_price){
        //   throw 'You need '+form.miner_price+' COFFEE to pay for this mining machine.';
        // }

        await layer2.miner.migrate(this, form, ()=>{});

        utils.cache.remove('cml_plant_'+this.cml_id);
        this.$router.replace("/cml_details/"+this.cml_id);
      } catch (e) {
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    
  },
};
</script>
<style lang="scss" scoped>

</style>
