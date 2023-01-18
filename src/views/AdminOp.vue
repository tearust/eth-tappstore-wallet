<template>
<div class="tea-page">
  <h4>Only available for admin user</h4>
  <div>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="freeze_state()">Freeze state</el-button>
    <el-button :disabled="not_admin" style="width:300px;" type="primary" @click="upgradeVersion()">Upgrade version</el-button>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="cancel_freeze_state()">Cancel freeze state</el-button>
  </div>

  <br/><br/>
  <h4>Tools</h4>

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
      not_admin: true,
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
  watch: {
    'user': {
      immediate: true,
      handler(){
        this.not_admin = !(this.user && this.user.isLogin && this.$root.is_sudo(this.user.address));
      }
    },
  },

  async mounted(){
    this.wf = new Base();
    await this.wf.init();


  },
  methods: {
    
    async upgradeVersion(){
      await layer2.log.upgrade_version(this, {}, async ()=>{
        this.$root.success();
      });
    },
    async freeze_state(){
      await layer2.log.freeze_state(this, {}, async ()=>{
        this.$root.success();
      });
    },
    async cancel_freeze_state(){
      await layer2.log.cancel_freeze_state(this, {}, async ()=>{
        this.$root.success();
      });
    },
  }
}
</script>