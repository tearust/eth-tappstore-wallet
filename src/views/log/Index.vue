<template>
<div class="tea-page">
  <h4>Logs : {{showDate(current_date)}}</h4>

  <div>
    <el-switch
      v-if="user && user.isLogin && $root.is_sudo(user.address)"
      v-model="mine"
      active-color="#35a696"
      inactive-color="#409eff"
      active-text="Mine"
      :width="60"
      inactive-text="All"
      @change="changeHandler()"
    >
    </el-switch>

  </div>

  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshPage()"></el-button>


  <div>
    <el-button v-for="(d, i) of date_list" :key="i" 
      :disabled="showDate(current_date)===showDate(d)"
      @click="query_op_logs(d)"
      type="text">
      {{showDate(d)}}
    </el-button>
  </div>
  <TeaTable
    :data="list || []"
    name="logs_table"
  >

    <TeaTableColumn
      label="UTC"
      xs
    >
      <template slot-scope="scope">
        <span>{{f_time(scope.row.time)}}</span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="account"
      label="Account"
      width="110"
    >
      <template slot-scope="scope">
        <span>{{scope.row.account | short_address}}</span>
      </template>
    </TeaTableColumn>
    <TeaTableColumn
      prop="token_id"
      label="Token ID"
      width="110"
      xs
    >
      <template slot-scope="scope">
        <span>{{scope.row.token_id | short_address}}</span>
      </template>
    </TeaTableColumn>
    <TeaTableColumn
      label="Token type"
    >
      <template slot-scope="scope">
        <span>{{scope.row.state_type}}</span>
      </template>
    </TeaTableColumn>
    
    <TeaTableColumn
      label="Transcation type"
    >
      <template slot-scope="scope">
        <span>{{scope.row.statement_type}}</span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Token amount"
      width="120"
      xs
      tip="Units are either Tea token or corresponding entity token."
    >
      <template slot-scope="scope">
        <span v-if="scope.row.state_type==='Tea'" :inner-html.prop="scope.row.gross_amount | balance"></span>
        <span v-if="scope.row.state_type!=='Tea'" :inner-html.prop="scope.row.gross_amount | balance_number"></span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Memo"
    >
      <template slot-scope="scope">
        <span>{{scope.row.memo}}</span>
      </template>
    </TeaTableColumn>
    

    
  </TeaTable>
  
  


  

</div>
</template>

<script>
import {_, moment} from 'tearust_utils';
import utils from '../../tea/utils';
import { mapState, mapGetters } from 'vuex';
import TeaTable from '../../components/TeaTable';
import TeaTableColumn from '../../components/TeaTableColumn';
import layer2 from '../../layer2';
import Base from '../../workflow/Base';
export default {
  components: {
    TeaTable,
    TeaTableColumn,
  },
  data(){
    return {
      current_date: null,
      address: null,
      date_list: [],
      list: null,
      mine: true,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState([
      'user'
    ]),
  },
  async mounted(){
    this.wf = new Base();
    await this.wf.init();
    
    const xl = [];
    const today = moment.utc();
    xl.push(today.clone());
    const len = this.$root.mobile()?3:9;
    for(let i=0; i<len; i++){
      const tmp = today.subtract(1, 'days');
      xl.push(tmp.clone());
    }
    this.date_list = xl;
    this.address = this.layer1_account.address;
    this.current_date = moment.utc();

    if(this.user && this.user.isLogin){
      this.mine = true;
    }
    else{
      this.mine = false;
    }
    
    await this.refreshPage();
    
  },
  methods: {
    async refreshPage(){
      this.$root.loading(true);
      const d = this.current_date;
      const param = {
        day: d.date(),
        year: d.year(),
        month: d.month()+1,
      };
      if(this.mine){
        param.address = this.address;
      }
      const list = await layer2.log.queryOpLogs(this, param);

      if(this.$root.mobile()){
        this.list = _.map(list, (item)=>{
          item.mobile_data = {
            'UTC': this.f_time(item.time),
            'Account': item.account,
            'Token ID': item.token_id,
            'Token type': item.state_type,
            'Transcation type': item.statement_type,
            'Token quantity': utils.layer1.balanceToAmount(item.gross_amount),
            'Memo': item.memo,
          };
          return item;
        });
      }
      else{
        this.list = list;
      }
      
      this.$root.loading(false);
    },

    f_time(utc_time){
      return moment.utc(utc_time, 'DD/MM/YYYY kk:mm:ss').format('MM/DD/YYYY kk:mm:ss');
    },

    showDate(c){
      if(!c) return moment.utc().format('MM/DD/YYYY');
      return moment.utc(c).format('MM/DD/YYYY');
    },

    async query_op_logs(date=moment.utc()){
      this.current_date = date;
      await this.refreshPage();
    },
    async changeHandler(){
      await this.refreshPage();
    },

    
  }
  
}
</script>