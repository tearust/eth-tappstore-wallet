<template>
<div class="tea-page p-home">
  

  <el-tabs type="border-card">
    <el-tab-pane label="TApp Store">
    


<strong style="display:block; font-size: 21px;">TApp Store Help</strong>
<p>
The TApp Store is the main access point to the various apps and investment opportunities in the TEA Project ecosystem. The Account tab allows users to move TEA tokens from Ethereum (the chain wallet) to the TApp Store wallet. Once funds are moved to the TApp Store wallet via the topup function, the TEA funds will be available to be used for TApps and investments.
<br/><br/>

The <b>TApps</b> tab lists all running TApps which can be launched by clicking on their name. Note that each TApp has a spending limit that must be set before using the TApp. This dictates how much TEA funds the TApp can withdraw from your TApp Store wallet. If you haven't set the limit, you'll be prompted to do so when you first launch the TApp.

<br/><br/>

The <b>Investments tab</b> allows you to purchase the tokenized assets of the various entities in the TEA ecosystem. These assets are issued on a bonding curve where price moves in step with supply.

<br/><br/>

The <b>TEA Vesting</b> tab shows the release schedule of any TEA that is due to the user from community rewards or investment.
<br/><br/>
If you have any questions, please ask them in our TG community - <a href="https://t.me/teaprojectorg" target="_blank">https://t.me/teaprojectorg</a> <br/>

TEA project team will answer them there.
</p>


<el-divider />

<div v-if="ai_block.t">
<div style="font-size: 16px;font-weight:bold;">{{ai_block.q}}</div>
<p style="font-size: 20px;">
{{ai_block.t}}
</p>

<div v-if="ai_block.related" style="margin-top: 20px;">
<div style="font-size: 14px;font-weight:bold;color:#555;">Related questions:</div>
<el-button style="display:block;margin-left:20px;padding:0;margin-top:5px;" type="text" v-for="(qq, i) of ai_block.related" :key="i" @click="ask_ai(qq)">{{qq}}</el-button>
</div>

<div style="margin-top: 20px;">
Please visit <a href="https://docs.teaproject.org/" target="_blank">https://docs.teaproject.org/</a> for more docs.
</div>

<el-divider />
</div>

Please input your question here.
<el-input placeholder="e.g. What is the easiest way to earn TEA token?" @keyup.enter.native="ask_ai()" v-model="ai_question">
  <el-button slot="append" icon="el-icon-search" @click="ask_ai()"></el-button>
</el-input>
    </el-tab-pane>
   
  </el-tabs>



<p style="margin-top: 24px;">We will have mining rewards during the contest but not for the public testing periods. Make sure to join our Telegram community for <a href="https://github.com/tearust/teaproject/wiki" target="_blank">updated rules</a> including starting time announcements: <a href="https://t.me/teaprojectorg" target="_blank">@teaprojectorg</a>.
  </p>
  

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
