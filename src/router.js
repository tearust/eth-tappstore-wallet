import Vue from 'vue'
import Router from 'vue-router'

import Test from './views/Test';

import TappProfile from './views/TappProfile';
import MyNotification from './views/MyNotification';

import MiningTreeList from './views/MiningTreeList';

import LoginWithEmail from './views/LoginWithEmail';


import PlantHelper from './views/PlantHelper';
import PlantConfirm from './views/PlantConfirm';
import MigrateHelper from './views/MigrateHelper';

import EntityDetails from './views/EntityDetails';
import CmlDetails from './views/CmlDetails';

import LoginPage from './views/LoginPage';
import Welcome from './views/Welcome';

import Leaderboard from './views/Leaderboard';

import Investment from './views/Investment';
import AccountProfile from './views/AccountProfile';
import Discover from './views/Discover';
import MiningHome from './views/MiningHome';
import SeatMain from './views/SeatMain';

import UserDetail from './views/UserDetail';
import LogIndex from './views/log/Index';

import TokenVesting from './views/TokenVesting';
import ActiveMinerListForMetadata from './views/ActiveMinersListForMetadata';

import AdminOp from './views/AdminOp';

Vue.use(Router);


let routers = [
  {
    path: '/',
    redirect: '/welcome',
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: Welcome,
    meta: {
      needLogin: true,
    }
  },
  {
    path: '/investment',
    name: 'investment',
    component: Investment,
    meta: {
      keepAlive: true,
      // needLogin: true,
    }
  },

  {
    path: '/login_page',
    name: 'login_page',
    component: LoginPage,
  },
  {
    path: '/login_with_email',
    name: 'login_with_email',
    component: LoginWithEmail,
  },

  {
    path: '/account_profile',
    name: 'account_profile',
    component: AccountProfile,
    meta: {
      needLogin: true,
    }
  },

  {
    path: '/discover',
    name: 'discover',
    component: Discover,
    meta: {
      // keepAlive: true,
    }
  },


  {
    path: '/test',
    name: 'test',
    component: Test,
  },
  {
    path: '/mining_home',
    name: 'mining_home',
    component: MiningHome,
    meta: {
      needLogin: true,
    },
  },
  // {
  //   path: '/my_notification',
  //   name: 'my_notification',
  //   component: MyNotification,
  // },

  {
    path: '/top_tree_list',
    name: 'top_tree_list',
    component: MiningTreeList,
    meta: {
      needLogin: true,
    }
  },
  {
    path: '/plant_helper/:cml_id',
    name: 'plant_helper',
    component: PlantHelper,
    meta: {
      needLogin: true,
    }
  },
  {
    path: '/plant_confirm',
    name: 'plant_confirm',
    component: PlantConfirm,
    meta: {
      needLogin: true,
    }
  },
  {
    path: '/cml/migrate/:cml_id',
    name: 'migrate_cml',
    component: MigrateHelper,
    meta: {
      needLogin: true,
    }
  },
  {
    path: '/entity/:token_id',
    name: 'entity_detail',
    component: EntityDetails,
    meta: {
      needLogin: true,
    },
  },
  {
    path: '/cml_details/:id',
    name: 'cml_details',
    component: CmlDetails,
    meta: {
      needLogin: true,
    },
  },
  {
    path: '/user_detail/:user_id',
    name: 'user_detail',
    component: UserDetail,
    meta: {},
  },
  {
    path: '/leader_board',
    name: 'leader_board',
    component: Leaderboard,
    meta: {
      needLogin: true,
    },
  },
  {
    path: '/seat_main',
    name: 'seat_main',
    component: SeatMain,
  },
  {
    path: '/log',
    name: 'log',
    component: LogIndex,
    meta: {
      needLogin: true,
    },
  },
  {
    path: '/token_vesting',
    name: 'token_vesting',
    component: TokenVesting,
    meta: {
      
    }
  },
  {
    path: '/app/:ticker',
    name: 'ActiveMinerListForMetadata_app_ticker',
    component: ActiveMinerListForMetadata,
  },
  {
    path: '/node/:cml_id/:ticker',
    name: 'ActiveMinerListForMetadata_cml_ticker',
    component: ActiveMinerListForMetadata,
  },
  {
    path: '/node/:cml_id',
    name: 'ActiveMinerListForMetadata_cml',
    component: ActiveMinerListForMetadata,
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminOp,
  },
  
  
];


export default new Router({
  routes: routers
})