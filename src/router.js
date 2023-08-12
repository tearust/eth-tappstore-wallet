import Vue from 'vue'
import Router from 'vue-router'

import Welcome from './views/Welcome';

import BankInfo from './views/BankInfo';


Vue.use(Router);


let routers = [
  {
    path: '/',
    redirect: '/',
  },
  {
    path: '/',
    name: 'welcome',
    component: Welcome,
  },
  {
    path: '/bank/:bank',
    name: 'bank_info',
    component: BankInfo,
  },
  
  
  
];



export default new Router({
  routes: routers
})