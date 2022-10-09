<template>
<div class="tea-page">
  <h4>Tea vesting</h4>
  <el-button size="small" style="top: 0px;" class="tea-refresh-btn" type="primary" plain icon="el-icon-refresh" circle @click="refreshList()"></el-button>

  <TeaTable
    style="margin-top: 15px;"
    :data="list || []"
    name="token_vesting_list_table"
  >

    <el-table-column
      label="Schedule id"
      prop="schedule_id"
    />

    <el-table-column
      label="Total"
    >
      <template slot-scope="scope">
        <span>{{scope.row.info.total}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Released"
    >
      <template slot-scope="scope">
        <span>{{scope.row.info.released}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Unreleased"
    >
      <template slot-scope="scope">
        <span>{{scope.row.info.available}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Duration"
    >
      <template slot-scope="scope">
        <span>{{scope.row.info.duration}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Slice period"
    >
      <template slot-scope="scope">
        <span>{{scope.row.info.period}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Cliff"
    >
      <template slot-scope="scope">
        <span>{{scope.row.info.cliff}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Started on"
    >
      <template slot-scope="scope">
        <span>{{scope.row.info.start}}</span>
      </template>
    </el-table-column>

    <el-table-column
      label="Actions"
      width="100"
      fixed="right"
    >
      <template slot-scope="scope">
        <TeaIconButton tip="Click to release your token." icon="el-icon-check" @click="releaseAction(scope.row)" style="font-size:24px;position:relative;top:2px;" />
      
      </template>
    </el-table-column>

  </TeaTable>

</div>
</template>
<script>
import TeaTable from '../components/TeaTable';
import TeaTableColumn from '../components/TeaTableColumn';
import TeaIconButton from '../components/TeaIconButton';
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import Base from '../workflow/Base';
import { mapGetters, mapState } from 'vuex';
import layer2 from '../layer2';

export default {
  components: {
    TeaTable,
    TeaTableColumn,
    TeaIconButton,
  },
  data(){
    return {
      list: null,
      
    };
  },
  computed: {
    ...mapGetters([
      'layer1_account'
    ]),
  },
  async mounted(){
    this.wf = new Base();
    await this.wf.init();

    await this.refreshList();
  },
  methods: {
    async refreshList(){
      this.$root.loading(true);
      const list = await this.wf.layer1.scheduleListForVesting();
      this.list = list;
      this.$root.loading(false);
    },

    
    async releaseAction(row){
      this.$store.commit('modal/open', {
        key: 'common_form', 
        param: {
          title: 'Release Tea',
          confirm_text: 'Confirm',
          text: `Input the tea amount you wanna released.`,
          props: {
            amount: {
              label: 'Tea amount',
              type: 'number',
              default: _.toNumber(row.info.available),
              min: 1,
              max: _.toNumber(row.info.available),
            },
          },
        },
        cb: async (form, close)=>{
          this.$root.loading(true);
          try{
            await this.wf.layer1.releaseTeaForVesting(row.schedule_id, form.amount);
            close();
            this.$root.alert_success('You will receive Tea after layer1 confirmed.');
            await this.refreshList();
          }catch(e){
            this.$root.showError(e);
          }
          this.$root.loading(false);
        },
      });
    }
  }
}
</script>