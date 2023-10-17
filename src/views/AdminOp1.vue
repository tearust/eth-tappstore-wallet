<template>
<div class="tea-page">
  <h4>Only available for admin user</h4>
  <el-divider />
  <div>
    <el-button :disabled="not_admin" style="width:200px;" type="primary" @click="admin_topup_handler()">Admin topup</el-button>

   
  </div>

</div>
</template>
<script>
import Base from '../workflow/Base';
import utils from '../tea/utils';
import {_, moment} from 'tearust_utils';
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
    async admin_topup_handler(){
      await layer2.admin.admin_topup(this, {}, async ()=>{
        
      });
    }
    
  }
}
</script>