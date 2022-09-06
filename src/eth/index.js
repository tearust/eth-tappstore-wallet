import { ethers, BigNumber } from "ethers";
import utils from '../tea/utils';
import { ChainMap, ContractMap } from "./consts";
import {_, moment} from 'tearust_utils';
import store from '../store';
import help from './help';

const U = ethers.utils;


class Instance {
  constructor(){
    this.cache = {
      block: null,
    };

    this.provider = new ethers.providers.Web3Provider(window.ethereum);

    this.maintainer_contract = new ethers.Contract(
      ContractMap.MAINTAINER, 
      require('./abi/Maintainer.sol/Maintainer.json').abi, 
      this.provider.getSigner(),
    );

    this.lock_contract = new ethers.Contract(
      ContractMap.LOCK,
      require('./abi/Lock.sol/Lock.json').abi,
      this.provider.getSigner(),
    );

    this.tea_contract = new ethers.Contract(
      ContractMap.TEA,
      require('./abi/ERC20.sol/ERC20Token.json').abi,
      this.provider.getSigner(),
    );

    this.signer = this.provider.getSigner();

    

  }
  async init(){
    
    await this.initCache();
    await this.initEvent();
  }

  async initEvent(){
    this.provider.on('block', (block)=>{
      this.cache.block = block;
      utils.publish('layer1_block', {block});
    });
  }

  async initCache(){
    const bb = await this.queryCurrentBlock();
    this.cache.block = bb.block;
    store.commit('set_chain', {
      current_block: bb.block
    });
  }

  async connect(){
    await this.provider.send("eth_requestAccounts", [])
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

  async topup(amt){

    const erc20Token = this.tea_contract;
    const lock = this.lock_contract;
    const signer = this.signer;

    const current_address = await signer.getAddress();
    // await erc20Token.approve(lock.address, help.unit(100));
       
    // lock
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const chainId = (await this.getChain()).id;
    const domain = {
      name: "TEA Project",
      version: "1",
      chainId: chainId,
      verifyingContract: erc20Token.address,
    };
    const deadline = parseInt(new Date().getTime() / 1000) + 10000;
    const amount = help.unit(amt);
    const value = {
      owner: current_address,
      spender: lock.address,
      value: amount,
      nonce: await erc20Token.nonces(current_address),
      deadline,
    };

    const signature = await signer._signTypedData(domain, types, value);
    const r = '0x' + signature.substring(2).substring(0, 64);
    const s = '0x' + signature.substring(2).substring(64, 128);
    const v = '0x' + signature.substring(2).substring(128, 130);
    const res = await lock.TopupWithPermit(
      erc20Token.address,
      amount,
      deadline,
      v,
      r,
      s,
      false
    );
    console.log('result:', res);
    
    return true;
  }

  async signMessage(message){
    await this.connect();
    const signature = await this.signer.signMessage(message);
    return signature;
  }

  async getMaintainerAddressList(){
    return await this.maintainer_contract.listValidators();
  }

  async queryCurrentBlock(){
    const rs = await this.provider.getBlock();
    return {
      block: rs.number,
      difficulty: rs.difficulty,
      time: new Date(rs.timestamp*1000)
    }
  }
  async getCurrentBlock(){
    return this.cache.block;
  }

  async test(){
    // console.log(this.maintainer_contract)
    const list = await this.maintainer_contract.listValidators();
    console.log(1, list);
    return list;
  }
}

let instance = null;
export default {
  help,
  async get(){
    if(instance) return instance;
    instance = new Instance();
    await instance.init();
    return instance;
  },
  
};