<template>
  <el-dialog
    :title="tapp ? tapp.name : '---'"
    :visible="visible"
    width="900px"
    :close-on-click-modal="false"
    custom-class="tea-modal"
    :destroy-on-close="true"
    @opened="openHandler()"
    @close="close()"
  >

    <i v-if="!param || loading" class="el-icon-loading" style="display: block; width: 40px; height: 40px;font-size: 40px; margin: 0 auto;"></i>

    <div class="tea-modal-card" v-if="!loading" style="margin: 0 -20px; display:block;">
      
      <div v-if="tapp.is_active">

        <p style="
          font-size: 15px;
          margin: -5px 0 15px 0;
          word-break: break-word;
        ">
          These are individual miners' nodes that are hosting delegators. Your browser can load the TApp from any one of these delegators by clicking on them. You can setup your own node to host a delegator by following <a href="https://github.com/tearust/teaproject/wiki/Mining-With-Your-Own-Hardware" target="_blank">this guide to setup your own node</a>.
        </p>
        
        <p style="
          font-size: 15px;
          margin: -5px 0 15px 0;
          word-break: break-word;
        ">
        Please note that you may get a browser warning message when clicking on the delegator HTTP links: <br>
        <img width="140" alt="http-warning" src="https://user-images.githubusercontent.com/86096370/146291198-74ec561d-7261-45b5-bc02-c28b0055f2dd.png">
        <br>
        This is a false alarm and you can safely click through. For more on why this isn't a problem you can <a href="https://medium.com/p/how-tea-projects-use-of-http-in-web3-is-more-secure-than-https-in-web-2-0-d488265af3d2" target="_blank">read more here</a>.        
        </p>

        <h4 style="font-size: 18px;color: #666; margin: 0 0 5px 0;">Delegator list</h4>
        <TeaTable
          :data="list || []"
          name='tapp_detail_hosting_cml_list_table'
          :pagination="false"
        >
          <el-table-column
            label="Link"
          >
            <template slot-scope="scope">
              <el-link :href="scope.row.url" target="_blank" :inner-html.prop="scope.row.url"></el-link>
            </template>
          </el-table-column>

          <!-- <el-table-column
            label="Delay"
            prop="ping"
            width="100"
          /> -->


        </TeaTable>
      </div>
      <div v-if="!tapp.is_active" style="font-size:15px;">
        Current TApp is pending, will active until enough miner hosting it.
      </div>

    </div>
    
    <span slot="footer" class="dialog-footer">
      <!-- <el-button style="float:left;" size="small" type="primary" @click="openUrl('https://github.com/tearust/teaproject/wiki/Mining-With-Your-Own-Hardware')">
        I want to be a TApp host too
      </el-button> -->


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
import request from '../../request';
import TeaTable from '../../components/TeaTable';
import helper from '../helper';
import layer2 from '../../layer2';
export default {
  components: {
    TeaTable,
  },
  data(){
    return {
      loading: true,
      tapp: null,

      list: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState('modal', {
      visible: state => store.state.modal.tapp_link.visible,
      param: state => store.state.modal.tapp_link.param,
    })
  },

  methods: {
    close(){
      this.$store.commit('modal/close', 'tapp_link');
      this.loading = true;
      this.tapp = null;
      this.list = null;
    },
    async openHandler(){
      this.wf = new Base();
      await this.wf.init();

      this.layer1_instance = this.wf.getLayer1Instance();
      this.api = this.layer1_instance.getApi();

      const tapp_id = this.param.id;
      const tapp = this.param.data;

      await this.initInfo(tapp);

      this.loading = false;
    },

    async initInfo(tapp){

      const cml_id_list = _.map(tapp.ori.hosts, (x)=>x.cml_id);
      const cml_list = await Promise.all(_.map(cml_id_list, async (id)=>{
        const xx = await layer2.miner.queryCmlDetails(this, {cml_id: id});
 
        return xx;
      }));

      const tmp = {
        name: tapp.name,
        token_symbol: tapp.token_symbol,
        owner: tapp.owner,
        link: tapp.link,
        is_active: tapp.status==='Active',
      };

      tmp.is_active = true;
      
      this.tapp = tmp;

      const ori_ip_list = _.map(cml_list, (item)=>{
        if(item.cml_type !== 'B') return null;
        if(item.miner.status === 'Active'){
          return item.miner.ip;
        }
        return null;
      });
      const ip_list = _.filter(_.uniq(ori_ip_list));

      this.list = _.map(ip_list, (ip)=>{
        return {
          url: `http://${ip}:8080/ipfs/${tapp.ori.link}?id=${tapp.id}`,
        };
      });
    },


    openUrl(url){
      helper.openUrl(url);
    }
  }
}
</script>
