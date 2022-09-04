import { ethers, BigNumber } from "ethers";
import utils from '../tea/utils';
import { ChainMap, ContractMap } from "./consts";
import {_} from 'tearust_utils';

const U = ethers.utils;

const help = {
  toBN(n){
    let bn = BigNumber.from(n);
    return bn; 
  }
};

class Instance {
  constructor(){
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

  }
  async init(){
    
  }

  async requestWalletAddressList(){
    const list = await this.provider.send("eth_requestAccounts", []);
    console.log('requestWalletAddressList:', list);
    return list;
  }
  async getBalance(){
    const signer = this.provider.getSigner();
    const n = await signer.getBalance();
    const balance = U.formatUnits(n, 'ether');
    return balance;
  }

  async getChain(){
    const signer = this.provider.getSigner();
    const cid = await signer.getChainId();
    const cname = _.get(ChainMap, cid, 'UnknownChainId');
    return {
      id: cid,
      name: cname,
    };
  }

  async topup(){

    const erc20Token = this.tea_contract;
    const lock = this.lock_contract;
    const signer = this.provider.getSigner();
    const current_address = await signer.getAddress();
    await erc20Token.approve(lock.address, help.toBN('100000000000000000000'));
       
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
    const amount = help.toBN('2000000000000000000');
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
console.log(22, res);
    
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