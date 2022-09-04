import { ethers, BigNumber } from "ethers";

const UNIT = BigNumber.from('1000000000000000000');
const F = {
  toBN(n){
    return BigNumber.from(n);
  },
  unit(n){
    return BigNumber.from(n).mul(UNIT);
  }
};

export default F;