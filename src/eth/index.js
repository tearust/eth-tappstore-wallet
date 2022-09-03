import { ethers } from "ethers";
import utils from '../tea/utils';
import { ChainMap, ContractMap } from "./consts";
import {_} from 'tearust_utils';


const U = ethers.utils;
class Instance {
  constructor(){
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner();

    const abi = require('./abi/Maintainer.sol/Maintainer.json').abi;
    this.maintainer_contract = new ethers.Contract(ContractMap.MAINTAINER, abi, this.provider);
    console.log(this.maintainer_contract);
  }
  async init(){
    
  }

  async requestWalletAddressList(){
    const list = await this.provider.send("eth_requestAccounts", []);
    console.log('requestWalletAddressList:', list);
    return list;
  }
  async getBalance(){
    const n = await this.signer.getBalance();
    const balance = U.formatUnits(n, 'ether');
    return balance;
  }

  async getChain(){
    const cid = await this.signer.getChainId();
    const cname = _.get(ChainMap, cid, 'UnknownChainId');
    return {
      id: cid,
      name: cname,
    };
  }



  async test(){
    console.log(this.maintainer_contract)
    const rs = await this.maintainer_contract.validators_(1);
    return rs.toString();
  }
}

let instance = null;
export default {
  async get(){
    if(instance) return instance;
    instance = new Instance();
    await instance.init();
    return instance;
  }
};