import { ethers, BigNumber } from "ethers";
import * as layer1 from 'tearust_layer1';

const U = ethers.utils;
window.U = U;
window._layer1 = layer1;

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
  }
};

export default F;