<template>
<div class="tea-page">
  <h4>Active miner list</h4>
  
  <el-button size="small" style="top: 0px;" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>


  <div style="margin-top: 20px;">
  These are the currently available mining nodes hosting the TAppStore. The TAppStore can be launched by clicking the Visit link in the desired miner's row listing.
  <br/>
  <!-- If your hosted node is not active on this list, use the <a href="https://github.com/tearust/teaproject/wiki/Mining:-Required-Open-Ports" target="_blank">following guide</a> to troubleshoot. -->
  </div>
  <TeaTable
    style="margin-top: 5px;"
    :data="list || []"
    name="active_miner_list_table"
  >
    <!-- <el-table-column
      prop="$index"
      label="Rank"
      width="60"
    >
      <template slot-scope="scope">
        {{scope.$index+1}}
      </template>
    </el-table-column> -->

    <el-table-column
      label="Cml Id"
      width="60"
    >
      <template slot-scope="scope">
        
        <span>{{scope.row.cml_id}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Token Id"
    >
      <template slot-scope="scope">
        <span>{{scope.row.token_id}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Owner"
    >
      <template slot-scope="scope">
        <span>{{scope.row.owner}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Machine Id"
    >
      <template slot-scope="scope">
        <span>{{scope.row.tea_id}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Ipfs cid"
    >
      <template slot-scope="scope">
        <span>{{scope.row.cid || cid}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Epoch"
    >
      <template slot-scope="scope">
        <span>{{epoch}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Version"
    >
      <template slot-scope="scope">
        <span>{{version}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Status"
    >
      <template slot-scope="scope">
        <span v-if="scope.row.node_status!=='pending'">{{scope.row.node_status}}</span>
        <span v-if="scope.row.node_status==='pending'">
          {{scope.row.node_status}} 
          <a style="margin-left: 5px;font-weight:bold;" href="https://github.com/tearust/teaproject/wiki/Mining:-Required-Open-Ports" target="_blank">(why?)</a>
        </span>
      </template>
    </el-table-column>

    <el-table-column
      label="IP"
    >
      <template slot-scope="scope">
        <span>{{scope.row.ip}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Link"
      width="80"
    >
      <template slot-scope="scope">
        <el-button :disabled="scope.row.node_status!=='active'" size="small" type="text" @click="openTo(scope.row)">Visit</el-button>
      </template>
    </el-table-column>

    

  </TeaTable>
  <ul>
    <li>If your hosted node is not active on this list, use the <a href="https://github.com/tearust/teaproject/wiki/Mining:-Required-Open-Ports" target="_blank">following guide</a> to troubleshoot. </li>
    <li>For more information on how to run a mining node, please visit our <a href="https://www.youtube.com/playlist?list=PLOhw_qkI0ILWh5HDI8ZiFARjfkfvNPqev" target="_blank">YouTube playlist</a>.</li>
  </ul>

</div>
</template>
<script>
import TeaTable from '../components/TeaTable';
import TeaTableColumn from '../components/TeaTableColumn';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import { mapGetters, mapState } from 'vuex';
import layer2 from '../layer2';

export default {
  components: {
    TeaTable,
    TeaTableColumn,
  },
  data(){
    return {
      list: null,
      cid: '',
      version: '',
      epoch: '',
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.cid = utils.get_env('TAPPSTORE_CID');
    this.version = utils.get_env('VERSION');
    this.epoch = utils.get_env('EPOCH_VERSION');
    this.wf = new Base();
    await this.wf.__init__();

    await this.refreshList();
  },
  methods: {
    async refreshList(){
      const list = await layer2.log.queryActiveMiners(this);
      this.list = list;
    },

    openTo(row){
      const cid = row.cid || this.cid;
      window.open(`http://${row.ip}:8080/ipfs/${cid}`, '_blank');
    }

  }
}
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#app .tea-section{
  margin: 0 auto;
  width: 1080px;
  padding: 24px 0 40px;
}
.c-pageheader1{
  position: sticky;
  top: 0;
  display: block;
  background: #fff;
  z-index: 99;
  text-align: center;
}

.p-header1{
  padding: 0 0 10px;
  width: 1080px;
  margin: 0 auto !important;
  height: 50px;
  .lg{
    font-size: 20px;
    color: #333;
    position: relative;
    vertical-align: top;
    top: 20px;
    left: 90px;
  }
  .el-image{
    width: 60px; 
    height: 60px;
    width: 90px;
    height: 90px;
    position: absolute;
    top: -10px;
  }
  
}
</style>