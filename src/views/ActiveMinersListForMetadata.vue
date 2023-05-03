<template>
<div class="tea-page">
  <h4>{{title}}</h4>
  
  <el-button size="small" style="top: 0px;" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

  <TeaTable
    style="margin-top: 5px;"
    :data="list || []"
    name="active_miner_list_for_metadata_table"
    v-if="xd && xd.has_app"
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
      label="TApp cid"
    >
      <template slot-scope="scope">
        <span>{{scope.row.cid || cid}}</span>
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
      title: '',
      xd: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  
  async mounted(){
    const {cml_id, ticker} = this.$route.params;
    const xt = _.startsWith(this.$route.path, '/node') ? 'node' : 'app';
    console.log(11, cml_id, ticker, xt);

    this.xd = {
      xt, cml_id, ticker: _.toUpper(ticker),
      has_cml: !!cml_id,
      has_app: !!ticker,
      cid: utils.get_env('TAPPSTORE_CID'),
    };

    if(this.xd.has_app){
      this.title = 'Tapp '+this.xd.ticker+' node list';
      this.xd.cid = this.get_cid(this.xd.ticker);
    }
    else{
      this.title = 'Redirect to Tappstore';
    }
    

    this.cid = this.xd.cid;
    this.version = utils.get_env('VERSION');
    this.epoch = utils.get_env('EPOCH_VERSION');
    this.wf = new Base();
    await this.wf.__init__();

    await this.refreshList();
  },
  methods: {
    get_cid(ticker){
      let x = ticker;
      if (ticker === 'LEADERBOARD') x = 'LB';
      if (ticker === 'HARBERGER') x = 'SEAT';
      if (ticker === 'MINER') x = 'CML';

      const r = utils.get_env(x+'_URL');
      return r.replace('/ipfs/', '');
    },
    async refreshList(){
      const list = await layer2.log.queryActiveMetadata(this, this.xd);
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