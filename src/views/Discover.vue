<template>
<div class="tea-page">
  <div>
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
      Please switch to "All" to explore more.
    </span>
  </div>

  <el-button size="small" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refresh()"></el-button>

  <TeaTable
    :data="list || []"
    name="tapps_list_table"
    style="margin-top: 15px;"
  >
    <TeaTableColumn
      label="ID"
      tip="ID of the TApp"
      width="300"
    >
      <template slot-scope="scope">
        <span class="one-line">{{scope.row.id}}</span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="name"
      label="Name"
      width="150"
      tip="Name of TApp"
    >
      <template slot-scope="scope">
        <span class="one-line" v-if="(!user || !user.isLogin) || $root.is_tappstore(scope.row.id)">{{scope.row.name}}</span>
        <el-button v-if="(user && user.isLogin) && !$root.is_tappstore(scope.row.id)" size="small" type="text" @click="clickToOpen(scope.row)">{{scope.row.name}}</el-button>
      </template>
    </TeaTableColumn>

    

    <!-- <TeaTableColumn
      label="Accrued balance"
    >
      <template slot-scope="scope">
        <span :inner-html.prop="scope.row.consume_account_balance | teaIcon"></span>
      </template>
    </TeaTableColumn> -->

    <TeaTableColumn
      label="Spending limit"
      tip="Current spending limit for TApp"
      v-if="layer1_account && layer1_account.address"
    >
      <template slot-scope="scope">
        <span v-if="$root.is_tappstore(scope.row.id)" :inner-html.prop="'N/A'"></span>
        <span v-if="!$root.is_tappstore(scope.row.id)" :inner-html.prop="scope.row.account_balance.allowance | teaIcon"></span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Status"
      width="100"
      tip="The online status of the TApp"
    >
      <template slot-scope="scope">{{scope.row.status}}</template>
    </TeaTableColumn>

    <el-table-column
      label="Actions"
      width="100"
      fixed="right"
    >
      <template v-if="user && user.isLogin" slot-scope="scope">
        <TeaIconButton v-if="scope.row.fav" tip="Remove like" icon="el-icon-star-on" @click="unfav_tapp(scope.row, scope.$index)" style="font-size:24px;position:relative;top:2px;" />
        <TeaIconButton v-if="!scope.row.fav" tip="Like" icon="el-icon-star-off" @click="fav_tapp(scope.row, scope.$index)" :loading="scope.row.loading" style="font-size:20px;position:relative;top:2px;" />
      
        <TeaIconButton tip="Set spending limit" 
          v-if="!$root.is_tappstore(scope.row.id)"
          icon="el-icon-setting" 
          @click="set_allowance(scope.row)" style="font-size:20px;position:relative;top:2px;" />
      </template>
    </el-table-column>

  </TeaTable>

  <div class="tea-legend" style="
    margin-top: 40px;
    text-align: right;
  ">

    <el-button v-if="user && user.isLogin && $root.is_sudo(user.address)" style="width:400px;" type="primary" @click="createNewTApp()">Create new TApp</el-button>
  </div>

</div>
</template>
<script>
import Base from '../workflow/Base';
import utils from '../tea/utils';
import { mapGetters, mapState } from 'vuex';

import TeaTable from '../components/TeaTable';
import TeaIconButton from '../components/TeaIconButton';
import TeaTableColumn from '../components/TeaTableColumn';

import layer2 from '../layer2';
export default {
  components: {
    TeaTable,
    TeaIconButton,
    TeaTableColumn,
  },
  data(){
    return {
      mine: false,
      list: null,
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
    ...mapState([
      'user'
    ])
  },

  async mounted(){
    this.wf = new Base();
    await this.wf.init();

    if(this.user && this.user.isLogin){
      this.mine = false;
    }
    else{
      this.mine = false;
    }

    await this.refresh();
  },
  methods: {
    async query_my_fav_list(){
      try{
        const list = await layer2.tapp.queryFavTappList(this);
        return _.map(list, (item)=>{
          item.fav = true;
          return item;
        });
      }catch(e){}
      return [];
    },

    async refresh(){
      if(this.mine){
        this.list = await this.query_my_fav_list();
        return;
      }

      this.$root.loading(true);

      const param = {
        only_tapp: true,
        from: this.layer1_account.address,
      };

      await layer2.entity.queryAll(this, async (list)=>{
        const mine_list = [];
        const not_min_list = [];

        let my_fav = [];
        if(this.user && this.user.isLogin){
          my_fav = await this.query_my_fav_list();
        }
        _.each(list, (item)=>{
          if(_.find(my_fav, (x)=>x.id===item.id)){
            item.fav = true;
            mine_list.push(item);
          }
          else{
            item.fav = false;
            not_min_list.push(item);
          }
        });

        const all_list = _.concat(mine_list, not_min_list);
        this.list = all_list;
        console.log('tapp list =>', this.list);
        this.$root.loading(false);
      }, param);
    },
    async changeHandler(){
      await this.refresh();
    },
    
    
    async createNewTApp(){
      try{
        await layer2.tapp.createNew(this, async (rs)=>{
          this.$root.success("create tapp success");
          await this.refresh();
        });
      }catch(e){
        this.$root.showError(e);
      }

    },
    async unfav_tapp(row, i){
      layer2.base.set_special_log(this);
      const opts = {
        tapp_id: row.id,
        loading: (f)=>{
          this.list_loading(i, f);
        }
      };
      await layer2.tapp.unfavTapp(this, {tapp_id: row.id}, async ()=>{
        this.$root.success();
        await this.refresh();
      });
      layer2.base.set_global_log(this);
    },
    async fav_tapp(row, i){
      layer2.base.set_special_log(this);
      const opts = {
        tapp_id: row.id,
        loading: (f)=>{
          this.list_loading(i, f);
        }
      };
      await layer2.tapp.favTapp(this, opts, async ()=>{
        this.$root.success();
        await this.refresh();
      });

      layer2.base.set_global_log(this);
    },
    async set_allowance(row, extra=null){
      await layer2.tapp.setAllowance(this, {id: row.id, name: row.name, amount: 100, extra}, async ()=>{
        this.$root.success();
        await this.refresh();
      });
    },
    list_loading(i, f=false){
      const list = _.cloneDeep(this.list);
      _.set(list[i], 'loading', f);
      this.list = list;
    },
    async clickToOpen(row){
      if(row.id === '0x1000000000000000000000000000000000000000'){
        // seat
        if(_.toNumber(row.account_balance.allowance) < 10){
          await this.set_allowance(row, {
            allowance: 1200,
            url: utils.get_env('seat_url'),
          });
        }
        else{
          window.open(utils.get_env('seat_url'), '_blank');
        }
        
      }
      else if(row.id === '0x1000000000000000000000000000000000000001'){
        // leaderboard
        if(_.toNumber(row.account_balance.allowance) < 10){
          await this.set_allowance(row, {
            allowance: 20,
            url: utils.get_env('lb_url'),
          });
        }
        else{
          window.open(utils.get_env('lb_url'), '_blank');
        }
        
      }
      else if (row.id === '0x1000000000000000000000000000000000000002'){
        // cml
        if(_.toNumber(row.account_balance.allowance) < 10){
          await this.set_allowance(row, {
            allowance: 100,
            url: utils.get_env('cml_url'),
          });
        }
        else{
          window.open(utils.get_env('cml_url'), '_blank');
        }
        
      }
      else if (row.id === '0x1000000000000000000000000000000000000003'){
        if(_.toNumber(row.account_balance.allowance) < 10){
          await this.set_allowance(row, {
            allowance: 200,
            url: utils.get_env('seed_url'),
          });
        }
        else{
          window.open(utils.get_env('seed_url'), '_blank');
        }
      }
      else if (row.id === '0x1000000000000000000000000000000000000004'){
        if(_.toNumber(row.account_balance.allowance) < 10){
          await this.set_allowance(row, {
            allowance: 20,
            url: utils.get_env('fluencer_url'),
          });
        }
        else{
          window.open(utils.get_env('fluencer_url'), '_blank');
        }
      }
    }
  }
}
</script>