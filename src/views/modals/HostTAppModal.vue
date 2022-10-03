<template>

  <el-dialog
    title="Host / Unhost TApp"
    :visible="visible"
    width="80%"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i>

  <div v-if="!loading && param && param.tapp">
      <p class="c-info" v-if="param.tapp.is_full">This TApp no longer accepts new hosts</p>
      <p class="c-info" v-if="!param.tapp.is_full">
        {{param.tapp.name}} requires {{param.tapp.host_performance}} performance to host. Please select one of your qualified CML to host this TApp. <br/>
        Note that you need to pay 100 TEA as a deposit which will be forfeited if your miner goes offline without unhosting first. <br />
        For more info about maximizing your hosting revenue, <a class="t-wiki" href="https://github.com/tearust/teaproject/wiki/Mining:-Host-and-Unhost-TApps" target="_blank">visit our wiki</a>.
      </p>

      <!-- <p class="c-info">
        Note: Please make sure your miner software version is <b>{{layer1_image}}</b><br/>
        Click <a class="t-wiki" href="https://github.com/tearust/teaproject/wiki/Mining:-Host-and-Unhost-TApps" target="_blank">here</a> to learn how to check version.
        
      </p> -->
    

    <el-table 
      v-if="cml_list"
      :data="cml_list"
      class="tea-table"
      stripe
      size="small"
      border
    >
      
      <el-table-column
        prop="id"
        label="CML ID"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="
            close();
            $root.goPath('/cml_details/'+scope.row.id);
          ">{{scope.row.id}}</el-button>
        </template>
      </el-table-column>

      <el-table-column
        label="Miner address"
      >
        <template slot-scope="scope">
          {{scope.row.miner.ip}}
        </template>
      </el-table-column>

      <el-table-column
        label="Current performance"
      >
        <template slot-scope="scope">
          {{scope.row.layer2.performance}}
        </template>
      </el-table-column>
     
      <el-table-column
        prop="life_day"
        label="Life remaining"
      />
      <el-table-column
        label="Miner status"
      >
        <template slot-scope="scope">
          {{scope.row.miner.status}}
        </template>
      </el-table-column>

      <el-table-column
        label="Actions"
        width="200">
        <template slot-scope="scope">

          <TeaIconButton :disabled="
            false 
          " tip="Host" icon="download" icon_style="font-size:20px;" @click="hostApp(scope)" />

          <!-- <TeaIconButton style="position:relative;top:1px;" :disabled="!scope.row.is_on" tip="Hosting this TApp now. Unhost?" icon="upload" icon_style="font-size:20px;" @click="unhostApp(scope)" /> -->
          
        </template>
      </el-table-column>
      
    
    </el-table>
    <h5 v-if="!cml_list" style="font-size:20px;">You can only host a TApp using a currently mining CML.</h5>


  </div>
    <span slot="footer" class="dialog-footer">
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
import TeaIconButton from '../../components/TeaIconButton';
import {hexToU8a} from '@polkadot/util';

import layer2 from '../../layer2';

export default {
  components: {
    TeaIconButton
  },
  data(){
    return {
      cml_list: null,
      loading: true,

      tapp: null,
      layer1_image: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible:state => store.state.modal.host_tapp.visible,
      param: state => store.state.modal.host_tapp.param,
    }),
  },

  methods: {
    async init_cml_list(){

      this.tapp = this.param.tapp;
      this.cml_list = await Promise.all(_.map(this.param.cml_id_list, async (id)=>{
        const cml = await layer2.miner.queryCmlDetails(this, {
          cml_id: id,
        });
        console.log(3, cml);
        return cml;
      }));
      this.loading = false;
    },

    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      await this.init_cml_list();

      // this.layer1_image = utils.get_env('layer1_image');
    },

    close(){
      this.loading = true;
      this.cml_list = null;
      this.$store.commit('modal/close', 'host_tapp');
    },

    async hostApp(scope){
      // const x = await this.$confirm(
      //   'You\'ll need to pay a 100 TEA deposit to host a TApp and can\'t unhost until 1000 blocks later. <br/>Are you sure?', 
      //   {
      //     dangerouslyUseHTMLString: true,
      //   }).catch(()=>{}
      // );
      // if(!x){
      //   return false;
      // }

      const layer1_instance = this.wf.getLayer1Instance();
      const tapp_id = this.param.tapp.id;
      const cml_id = scope.row.id;
      let sig = await layer1_instance.signWithExtension(this.layer1_account.address, 'test');
      sig = utils.uint8array_to_base64(hexToU8a(sig));

      const authB64 = layer2.user.checkLogin(this);
      const opts = {
        tappIdB64: layer2.base.getTappId(),
        address: this.layer1_account.address,
        targetTappIdB64: tapp_id,
        cmlId: _.toNumber(cml_id),
        signature: sig,
        authB64,
      };

      const cb = utils.mem.get('host_tapp');
      try{
        const rs = await layer2.txn.txn_request('hostTApp', opts);

        console.log(11, rs);
        
        this.close();

        if(cb){
          await cb();
        }
      }catch(e){
        this.$root.showError(e);
      }
      this.$root.loading(false);
      
    },
    async unhostApp(scope){
      const tapp_id = this.param.tapp.id;
      const cml_id = scope.row.id;

      try{
        await this.$confirm(`Your CML ${cml_id} will no longer host this TApp, continue?`, 'Unhost');
      }catch(e){
        return;
      }

      this.$root.loading(true);
      const cb = utils.mem.get('host_tapp');

      await layer2.tapp.unhostTApp(this, {
        tapp_id, 
        cml_id,
      }, async ()=>{
        
        this.close();
        if(cb){
          await cb();
        }
      });
      this.$root.loading(false);
    },

    
  }
}
</script>
