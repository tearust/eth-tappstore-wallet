<template>
<div class="tea-page">
  <div style="height: 24px;">
    <el-switch
      v-if="false && user && user.isLogin"
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
    style="margin-top: 25px;"
  >
    <TeaTableColumn
      label="Token ID"
      tip="ID of the TApp"
      width="120"
    >
      <template slot-scope="scope">
        <span class="one-line">{{scope.row.id | short_address}}</span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      prop="name"
      label="Name"
      tip="Name of TApp"
      :fixed="$root.mobile()?'left':'left'"
      xs
    >
      <template slot-scope="scope">
        <span class="one-line" v-if="$root.is_tappstore(scope.row.id) || scope.row.is_service">{{tapp_name(scope.row.name)}}</span>
        <el-button v-if="!($root.is_tappstore(scope.row.id) || scope.row.is_service)" size="small" type="text" @click="clickToOpen(scope.row)">{{tapp_name(scope.row.name)}}</el-button>
      </template>
    </TeaTableColumn>


    <TeaTableColumn
      label="Spending limit"
      tip="Current spending limit for TApp"
      width="120"
      xs
      v-if="layer1_account && layer1_account.address"
    >
      <template slot-scope="scope">
        <span v-if="$root.is_tappstore(scope.row.id)" :inner-html.prop="'N/A'"></span>
        <span v-if="!$root.is_tappstore(scope.row.id)" :inner-html.prop="scope.row.allowance | teaIcon"></span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Status"
      width="100"
      tip="The online status of the TApp"
    >
      <template slot-scope="scope">{{scope.row.status}}</template>
    </TeaTableColumn>
    

    <TeaTableColumn
      label="IPFS CID"
    >
      <template slot-scope="scope">
        <span class="one-line">{{scope.row.cid}}</span>
      </template>
    </TeaTableColumn>

    <TeaTableColumn
      label="Actions"
      width="120"
      fixed="right"
      xs
    >
      <template v-if="user && user.isLogin" slot-scope="scope">
        <TeaIconButton v-if="mine && scope.row.fav" tip="Remove like" icon="el-icon-star-on" @click="unfav_tapp(scope.row, scope.$index)" style="font-size:24px;position:relative;top:2px;" />
        <TeaIconButton v-if="mine && !scope.row.fav" tip="Like" icon="el-icon-star-off" @click="fav_tapp(scope.row, scope.$index)" :loading="scope.row.loading" style="font-size:20px;position:relative;top:2px;" />
      
        <TeaIconButton tip="Set spending limit" 
          v-if="!$root.is_tappstore(scope.row.id) && !scope.row.is_service"
          icon="el-icon-setting" 
          @click="set_allowance(scope.row)" style="font-size:20px;position:relative;top:2px;" />
        
        <TeaIconButton tip="Update tapp" 
          v-if="user && user.isLogin && $root.is_sudo(user.address) && !scope.row.is_service"
          icon="el-icon-s-tools" 
          @click="updateTapp(scope.row)" style="font-size:20px;position:relative;top:2px;" />
      </template>
    </TeaTableColumn>

  </TeaTable>

  <div class="tea-legend" style="
    margin-top: 40px;
    text-align: right;
  ">

    <el-button v-if="!$root.mobile() && user && user.isLogin && $root.is_sudo(user.address)" style="width:400px;" type="primary" @click="createNewTApp()">Create new TApp</el-button>
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
import helper from './helper';
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

  created(){
    this.app_cid_map = {
      '0x1000000000000000000000000000000000000000': utils.get_env('seat_cid'),
      '0x1000000000000000000000000000000000000002': utils.get_env('cml_cid'),
      '0x1000000000000000000000000000000000000001': utils.get_env('lb_cid'),
      '0x1000000000000000000000000000000000000003': utils.get_env('seed_cid'),
      '0x1000000000000000000000000000000000000004': utils.get_env('fluencer_cid'),
      '0x1000000000000000000000000000000000000006': utils.get_env('devportal_cid'),
    };
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
      // if(this.mine){
      //   this.list = await this.query_my_fav_list();
      //   return;
      // }

      this.$root.loading(true);

      const param = {
        only_tapp: true,
        from: this.layer1_account.address,
      };
      await layer2.entity.queryAll(this, async (list)=>{
        const mine_list = [];
        const not_min_list = [];
        let my_fav = [];
        if(this.user && this.user.isLogin && this.mine){
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
        if(this.$root.mobile()){
          this.list = _.map(all_list, (item)=>{
            item.mobile_data = {
              'Name': item.name,
              'Token Id': item.id,
              'Status': item.status,
              'Ipfs cid': item.cid,
            };
            return item;
          });
        }
        else{
          this.list = all_list;
        }
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
    async updateTapp(row){
      try{
        await layer2.tapp.updateTapp(this, row, async (rs)=>{
          this.$root.success("Update tapp success");
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

    tapp_url(row, t){
      let cid = utils.get_env(t);
      if(row.cid){
        cid = row.cid;
      }
      return '/ipfs/'+cid;
    },

    tapp_name(name){
      if(name === 'Payment channel'){
        return 'Tea-party';
      }
      return name;
    },

    async clickToOpen(row){
      const mobile_text = 'This app only available for PC web.'

      if(row.id === '0x1000000000000000000000000000000000000000'){
        // seat
        if(_.toNumber(row.allowance) < 10 && this.user && this.user.isLogin){
          await this.set_allowance(row, {
            allowance: 1200,
            url: this.tapp_url(row, 'seat_cid'),
          });
        }
        else{
          helper.openUrl(this.tapp_url(row, 'seat_cid'));
        }
        
      }
      else if(row.id === '0x1000000000000000000000000000000000000001'){
        // leaderboard
        if(_.toNumber(row.allowance) < 10 && this.user && this.user.isLogin){
          await this.set_allowance(row, {
            allowance: 20,
            url: this.tapp_url(row, 'lb_cid'),
          });
        }
        else{
          helper.openUrl(this.tapp_url(row, 'lb_cid'));
        }
        
      }
      else if (row.id === '0x1000000000000000000000000000000000000002'){
        // cml
        if(this.$root.mobile()){
          this.$root.alert_success(mobile_text);
          return false;
        }
        if(_.toNumber(row.allowance) < 10 && this.user && this.user.isLogin){
          await this.set_allowance(row, {
            allowance: 100,
            url: this.tapp_url(row, 'cml_cid'),
          });
        }
        else{
         helper.openUrl(this.tapp_url(row, 'cml_cid'));
        }
        
      }
      else if (row.id === '0x1000000000000000000000000000000000000003'){
        if(_.toNumber(row.allowance) < 10 && this.user && this.user.isLogin){
          await this.set_allowance(row, {
            allowance: 200,
            url: this.tapp_url(row, 'seed_cid'),
          });
        }
        else{
          helper.openUrl(this.tapp_url(row, 'seed_cid'));
        }
      }
      else if (row.id === '0x1000000000000000000000000000000000000004'){
        helper.openUrl(this.tapp_url(row, 'fluencer_cid'));
      }
      else if(row.ori.tapp_type === 'fluencer'){
        helper.openUrl(this.tapp_url(row, 'fluencer_cid')+'?v='+row.id+'&t=fluencer');
      }
      else if(row.id === '0x1000000000000000000000000000000000000005'){
        helper.openUrl(this.tapp_url(row, 'email_cid'));
      }
      else if(row.id === '0x1000000000000000000000000000000000000006'){
        if(this.$root.mobile()){
          this.$root.alert_success(mobile_text);
          return false;
        }
        if(_.toNumber(row.allowance) < 10 && this.user && this.user.isLogin){
          await this.set_allowance(row, {
            allowance: 500,
            url: this.tapp_url(row, 'devportal_cid'),
          });
        }
        else{
          helper.openUrl(this.tapp_url(row, 'devportal_cid'));
        }
      }
      else if(row.id === '0xb8aaaaaaaa230340b78fa252ce4d47dd23e8a904'){
        this.$root.alert_success("Coming soon.");
        return false;
        // if(this.$root.mobile() && utils.wallet_webview()){
        //   this.$root.alert_success("This app cannot run inside Metamask");
        //   return false;
        // }
        // helper.openUrl(row.tapp_url);
      }
      else if(row.ori.tapp_type === 'User'){
        helper.openUrl(this.tapp_url(row, 'seat_cid'));
      }
      else if(row.ori.tapp_type === 'game'){
        this.$root.alert_success("Coming soon.");
        return false;
      }
      else if(row.tapp_url){
        helper.openUrl(row.tapp_url);
      }
      else{
        this.$root.showError("Invalid tapp url");
      }
    },

  }
}
</script>