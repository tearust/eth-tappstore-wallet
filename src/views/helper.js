
import {_} from 'tearust_utils';
import utils from '../tea/utils';
import request from '../request';
// import tapp from '../tapp';
import store from '../store';

import layer2 from '../layer2';
import {NOT_LOGIN} from '../layer2/user';

// self means vue instance, required.
const F = {
  tableLoading(self, flag=false){
    if(flag){
      self.$root.loading(true);
      self.table_loading = true;
    }
    else{
      self.$root.loading(false);
      self.table_loading = false;
    }
    
  },

  checkForLayer1UserChanged(self){
    const u = self.$store.state.user;
    console.log(self.$route)
    if(self.$route.meta && self.$route.meta.needLogin && !u){
      self.$router.replace({ path: '/login_page' }).catch(()=>{});
      return false;
    }
    else{
      if(self.$route.name === 'login_page'){
        self.$router.replace({ path: '/welcome' }).catch(()=>{});
      }
      
    }
    return true;
  },

  checkReturnWithError(self, e){
    if(e.toString() === NOT_LOGIN){
      self.$router.replace({ path: '/login_page' }).catch(()=>{});
    }
  },

  openToTApp(self, row){
    // if(row.host_current < 1){
    //   self.$root.showError('This TApp has zero hosts at this moment. It has not been deployed yet.');
    //   return;
    // }

    // try{
    //   const json = JSON.parse(row.link);
    //   let url = tapp.template.call(row.type, 'url', [row.id, json.v]);
    //   url = utils.urlToLink(url);

    //   window.open(url, '_blank');

    // }catch(e){
    //   self.$root.showError(e);
    // }

  },

  
  async showNotificationLink(self){
    self.$store.commit('modal/open', {
      key: 'notification_link',
      param: {
      },
    });
  },

  getLastNotificationBlock(account){
    const epoch_v = utils.get_env('EPOCH_VERSION');
    const key = 'notification_last_block-'+account+'-'+epoch_v;
    let last_block = utils.cache.get(key);
    if(!last_block){
      return 1;
    }
    return last_block;
  },
  updateLastNotificationBlock(account){
    const epoch_v = utils.get_env('EPOCH_VERSION');
    const key = 'notification_last_block-'+account+'-'+epoch_v;

    const block = store.state.chain.current_block.toJSON();

    utils.cache.put(key, block);
  },

  // goToTAppWithIpfsCid(cid){
  //   const ss = utils.get_env('ipfs_url');

  //   window.open(ss+'/ipfs/'+cid, '_blank');
  // },

  async calculateTEAByToken(token_amount){
    const amount = utils.layer1.amountToBalance(token_amount)
    let estimate = await request.layer1_rpc('bonding_estimateTeaRequiredToBuyGivenToken', [
      null, amount, 100,
    ]);
    estimate = utils.layer1.balanceToAmount(estimate);

    return estimate;
  },

  
  openUrl(url){
    window.open(url, '_blank');
  },

  go_wallet(url){
    window.open(`https://wallet.teaproject.org/#`+url, '_blank');
  },


  async showMinerInfo(self, miner_id){
    self.$root.loading(true);
    const mm = await layer2.miner.queryMinerDetails(self, {
      tea_id_b64: miner_id,
    });
    mm.miner_id = mm.tea_id_b64;
    delete mm.tea_id_b64;
    self.$root.loading(false);
    
    self.$store.commit('modal/open', {
      key: 'data_details',
      param: {
        ...mm,
        title: 'Miner Details',
      },
    });
  },

  showDetailsModal(self, row){
    self.$store.commit('modal/open', {
      key: 'tapp_details',
      param: {
        id: row.id,
        data: row,
      },
    });
  },
  async showTAppLink(self, row){
    self.$store.commit('modal/open', {
      key: 'tapp_link',
      param: {
        id: row.id,
        data: row,
      },
    });
  }
  

};




export default F;
