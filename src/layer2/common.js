
import base from './base';
import txn from './txn';

const F = {
  async queryTappAccount(){
    const param = {
      tappIdB64: base.getTappId(),
    };
    const rs = await txn.query_request('queryTappAccount', param);
    return rs;
  },
  async queryTappStoreAccount(){
    const param = {};
    const rs = await txn.query_request('queryTappStoreAccount', param);
    return rs;
  },
};

export default F;