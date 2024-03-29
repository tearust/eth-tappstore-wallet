<template>
  <div class="tea-page">
    <h4>Plant my Camellia</h4>

    <el-steps :active="step" simple>
      <el-step title="Fill"></el-step>
      <el-step title="Start mining"></el-step>
    </el-steps>

    <div class="t-step" v-if="step===1">
      <p>
        Please fill out the form below to generate the shell mining commands. 
        <br/>
        More info is available <a href="https://github.com/tearust/teaproject/wiki/Mining#mining-machines-are-no-longer-free" class="t-wiki" target="_blank">on our wiki.</a>
      </p>

      <el-form :model="form" label-width="320px" :rules="rules" ref="form" class="tea-modal">
        <el-form-item label="CML ID" prop="cml_id">
          <el-input :disabled="true" v-model="form.cml_id"></el-input>
        </el-form-item>

        <el-form-item label="Machine ID" prop="miner_id">
          <el-input  v-model="form.miner_id" show-word-limit maxlength="66" minlength="66"></el-input>
          <el-button slot="append" icon="el-icon-search"></el-button>

          <TeaIconButton icon_style="font-size:18px;" tip="Autogenerated unique name for your mining machine." icon="questionmark" />
        </el-form-item>

        <el-form-item label="Miner IP" prop="miner_ip">
          <el-input v-model="form.miner_ip"></el-input>

          <TeaIconButton icon_style="font-size:18px;" tip="The IP address of your mining machine. If you are planting a C CML, you can use any random number here. If running Ubuntu, you can find your machine's IP address by running the following from the command line: ip addr show eth0" icon="questionmark" />
        </el-form-item>
        <el-form-item label="Owner account">
          <el-input disabled :value="layer1_account?layer1_account.address:''"></el-input>

        </el-form-item>

        
      </el-form>

      <div style="display: flex; justify-content: space-between; margin-top: 20px">
        <el-button type="primary" size="small" plain @click="step=1">
          Previous step
        </el-button>
        <el-button type="primary" size="small" @click="clickStep1()">
          Next step
        </el-button>
      </div>

    </div>

    <div v-if="step===2" class="t-step">

      <p style="font-size:17px;font-weight:bold;">Install layer1 script</p>
      <div class="c-shell" style="margin-top:0;">
        <p style="font-weight:bold;">
          <span v-if="script_role===1" class="js_need_copy">
            sh -c "$(curl -fsSL https://raw.githubusercontent.com/tearust/delegator-resources/epoch10/install.sh)"
          </span>

          <span title="copy" data-clipboard-target=".js_need_copy" style="margin-left: 5px; float:right;" class="iconfont tea-icon-btn icon-copy js_copy"></span>
        </p>
      </div>
      
      <div style="margin-top:5px;">
        
        <div style="width:80%;margin:15px 0">
          Paste in Machine ID:
          <img src="../assets/images/p_1.png" style="width:100%" />
        </div>
      
        <div style="width:80%;margin:15px 0">
          Paste in miner IP address:
          <img src="../assets/images/p_2.png" style="width:100%" />
        </div>

        
        <div style="width:80%;margin:15px 0">
          Paste in owner account:
          <img src="../assets/images/p_3.png" style="width:100%" />
        </div>

        <div style="width:80%;margin:15px 0">
          When the shell commands have finished, you can return here after waiting 30 seconds and continue by clicking the Plant button:
          <img src="../assets/images/p_4.png" style="width:100%" />
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 20px">
        <el-button type="primary" size="small" plain @click="step=1">
          Previous step
        </el-button>

        <el-button
          style="padding-left: 25px; padding-right: 25px"
          size="small"
          @click="testPlant()"
          type="primary"
        >
          Plant
        </el-button>
        
      </div>
    </div>

    
<!-- <p v-if="cml_type==='C'" style="margin-top:5px;">
        C CML seeds aren't able to host TApps. They can earn public service rewards by running <a href="https://github.com/tearust/teaproject/wiki/Mining---Availability-Attestation" target="_blank">Availability Attestation</a> to monitor the availability of B CML mining machines.
      </p>  -->
      
      
  </div>
</template>
<script>
import Base from "../workflow/Base";
import { _ } from "tearust_utils";
import utils from "../tea/utils";
import { mapGetters } from "vuex";
import ClipboardJS from 'clipboard';
import TeaIconButton from '../components/TeaIconButton';
import layer2 from '../layer2';
export default {
  components: {
    TeaIconButton,
  },
  data() {
    return {
      step: 1,
      cml_type: null,
      form: {
        cml_id: null,
        miner_id: null,
        miner_ip: null,
      },
      rules: {
        cml_id: [{ required: true }],
        miner_id: [
          { required: true },
          {
            min: 66,
          },
          {
            max: 66
          }
        ],
        miner_ip: [
          { required: true },
          {
            validator: (rule, val, cb)=>{
              if(this.cml_type === 'B'){
                if(!utils.isValidIP(val)){
                  cb('Invalid ip address');
                }
                else{
                  cb();
                }
              }
              else{
                cb();
              }
              
            }
          }
        ],
        // account: [{ required: true }],
      },

      shell: false,
      script_role: 1, 
    };
  },
  computed: {
    ...mapGetters(["layer1_account"]),
  },
  async created(){
    this.initCopyEvent();
  },
  beforeDestroy(){
    this.clipboard && this.clipboard.destroy();
  },
  async mounted() {
    this.form.cml_id = this.$route.params.cml_id;

    this.wf = new Base();
    await this.wf.init();

    this.$root.loading(true);

    // const layer1_instance = this.wf.getLayer1Instance();
    // const api = layer1_instance.getApi();

    // let cml = await api.query.cml.cmlStore(this.form.cml_id);
    // cml = cml.toJSON();

    // const map = {
    //   A: "cmlAMiningMachineCost",
    //   B: "cmlBMiningMachineCost",
    //   C: "cmlCMiningMachineCost",
    // };

    this.cml_type = cml.intrinsic.cml_type;

    // this.form.miner_id = utils.uuid().replace(/\-/g, '');
    this.$root.loading(false);
  },
  methods: {
    initCopyEvent(){
      const clipboard = new ClipboardJS('.js_copy');
      this.clipboard = clipboard;
      clipboard.on('success', (e)=>{
        e.clearSelection();
        this.$root.success('Copied');
      });

      clipboard.on('error', (e)=>{
      });
    },
    async clickStep1() {
      const ref = this.$refs["form"];
      await ref.validate();

      try{
        const layer1_instance = this.wf.getLayer1Instance();
        const api = layer1_instance.getApi();

        this.$root.loading(true);
        const tx = api.tx.machine.registerForLayer2(this.form.miner_id, this.form.cml_id);
        await layer1_instance.sendTx(this.layer1_account.address, tx);

        this.step = 2;
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      
    },
    async testPlant() {
      const x = await this.beforeAction();
      if(!x) return false;
      const layer1_instance = this.wf.getLayer1Instance();
      const api = layer1_instance.getApi();

      this.$root.loading(true);
      try {
        const form = this.form;

        // validate tea and coffee balance
        // if(this.layer1_account.balance <= 1000){
        //   throw 'You need 1000 TEA for the first staking slot. You can put up some of your extra <a href="https://github.com/tearust/teaproject/wiki/Genesis-TEA-Loans" target="_blank">CML seeds for a Genesis Loan</a> and receive TEA in return.';
        // }
        

        await layer2.miner.startMining(this, form, ()=>{});
        
        this.$router.push("/mining_home");
      } catch (e) {
        if(_.includes(e, 'DuplicateEntryOnUniqueField')){
          e = 'Machine ID already in use';
        }
        this.$root.showError(e);
      }
      this.$root.loading(false);
    },
    async verifyMiner(){
      const x = await this.beforeAction();
      if(!x) return false;
      utils.cache.put('cml_plant_'+this.form.cml_id, this.form);

      const url = `http://${this.form.miner_ip}:8000/verify_deployed?cml=${this.form.cml_id}`;
      window.open(url, '_blank');

      
    },
    async beforeAction(){
      try{
        const html = 'Check that the command line output lists out all creation steps as <b>done</b>.<br/> Does your mining machine install script show that all creation steps are <b>done</b> and that <b>docker start completed?</b>';
        await this.$confirm(html, {
          dangerouslyUseHTMLString: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No - continue to wait',
        });

        return true;
      }catch(e){}
      return false;
    }
  },
};
</script>
<style lang="scss" scoped>
.c-shell {
  padding: 5px 15px;
  margin-top: 20px;
  height: 40px;
  background: #000;
  p {
    color: rgb(2, 250, 35);
    padding: 2px 0;
    margin: 0;
  }
}
.t-step{
  &>p{
    margin: 20px 0 5px;
  }
}
</style>
