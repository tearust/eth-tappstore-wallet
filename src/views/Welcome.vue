<template>
<div class="tea-page p-home">
  

  <el-tabs type="border-card">
    <el-tab-pane label="TApp Store">

<div v-if="ai_block.t">
<div style="font-size: 16px;font-weight:bold;">{{ai_block.q}}</div>
<p style="font-size: 20px;">
{{ai_block.t}}
</p>

<div v-if="ai_block.related" style="margin-top: 20px;">
<div style="font-size: 14px;font-weight:bold;color:#555;">Related questions:</div>
<el-button style="display:block;margin-left:20px;padding:0;margin-top:5px;" type="text" v-for="(qq, i) of ai_block.related" :key="i" @click="ask_ai(qq)">{{qq}}</el-button>
</div>


<el-divider />
</div>
    



Please ask your question here, our AI bot will try to find the answer from <a href="https://docs.teaproject.org" target="_blank">https://docs.teaproject.org.</a><br/>
Looking for human? please join <a href="https://t.me/teaprojectorg" target="_blank">https://t.me/teaprojectorg</a>
<el-input style="margin-top:5px;" placeholder="e.g. What is the easiest way to earn TEA token?" @keyup.enter.native="ask_ai()" v-model="ai_question">
  <el-button slot="append" icon="el-icon-search" @click="ask_ai()"></el-button>
</el-input>


    </el-tab-pane>
   
  </el-tabs>


  

</div>
</template>
<script>
import {mapGetters, mapState} from 'vuex';
import Base from '../workflow/Base';
import _ from 'lodash';
import utils from '../tea/utils';
import {axios} from 'tearust_utils';

import layer2 from '../layer2';
import helper from '../views/helper';

import eth from '../eth';
export default {
  data() {
    return {

      ai_question: '',
      ai_block: {
        q: null,
        t: null,
        related: null,
      },
      
    };
  },
  computed: {
    ...mapGetters(['layer1_account']),
  },
  async mounted(){
    
  },

  methods: {
    async ask_ai(txt){
      const query = txt || this.ai_question || 'What is the easiest way to earn TEA token?';
      const url = 'https://api.gitbook.com/v1/orgs/6RfBNh1NuvfQc4xeHaLN/ask';
      this.$root.loading(true);
      const res = await axios.post(url, {
        query,
      }, {
        headers: {
          Authorization: 'Bearer gb_api_8np5Dmi8cmOtBitnk2KudbMg7MH4wphU2FqrsKcY',
        }
      });
      if(res.data.answer){
        const data = res.data.answer;
        this.ai_block = {
          q: _.clone(query),
          t: data.text,
          related: data.followupQuestions,
        };
      }
      else{
        this.ai_block = {
          q: _.clone(query),
          t: 'No answer.',
          related: null,
        };
      }


      this.$root.loading(false);
      this.ai_question = '';
      
    }
  }

}

</script>
<style lang="scss">
.p-home{
  h4{
    margin-top: 32px !important;
  }
  p{
    margin: 8px 0 12px;
    font-size: 18px;
    line-height: 24px;

  }
  .iconfont{
    color: #35a696;
    font-size: 14px;
    position: relative;
    left: 2px;
  }
  li{
    font-size: 17px;
    line-height: 22px;
    margin: 6px 0;
  }

  @media only screen and (max-device-width: 650px) {
    .el-tabs__header{
      display: none !important;
    }
    //.el-tabs--border-card{
    //  border: none !important;
    //  box-shadow: none !important;
    //}
    //.el-tabs__content{
    //  padding: 0 !important;
    //}
  }
}
</style>
