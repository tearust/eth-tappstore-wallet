import { ethers, BigNumber } from "ethers";
import * as _layer1 from '@polkadot/util';
import {forge} from 'tearust_utils';

const U = ethers.utils;
window.U = U;
window._layer1 = _layer1;

const UNIT = BigNumber.from('1000000000000000000');
const F = {
  toBN(n){
    return BigNumber.from(n);
  },
  unit(n){
    return BigNumber.from(n).mul(UNIT);
  },
  getUtils(){
    return U;
  },
  shortAddress(address){
    if(!U.isAddress(address)){
      return address;
    }
    return address.substr(0, 6)+'...'+address.substr(38, 42);
  },
  createNewWallet(pri=null){
    let privateKey = pri;
    if(!privateKey){
      const key = forge.random.generateSync(32);
      const hex = forge.util.bytesToHex(key);
      privateKey = _.toLower('0x'+hex);
    } 
    const wallet = new ethers.Wallet(privateKey);
    return {
      privateKey,
      address: _.toLower(wallet.address),
      wallet,
    };
  },
  async signWithWallet(wallet, message){
    const msg1 = (U.toUtf8Bytes(message));
    const signature = await wallet.signMessage(msg1);
    return signature;
  },
  verifyWithWallet(wallet, message, sig){
    try{
      const sig_address = U.verifyMessage(message, sig);
      return sig_address === wallet.address;
    }catch(e){
      return false;
    }
  },

  async test(){
    const {address, wallet} = F.createNewWallet();
    console.log(address);
    const sig = await F.signWithWallet(wallet, 'aaa');
    console.log('sig: ', sig);

    console.log('verify: ', F.verifyWithWallet(wallet, 'aaa', sig));


  }
};

window.help = F;
export default F;