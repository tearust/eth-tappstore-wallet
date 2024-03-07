import { _ } from 'tearust_utils';

const PREFIX_MSG = [
  ['ExecTxnFailed', 'Execute txn failed: '],
  ['ClientUtilsError', 'Operate failed: '],
  ['Tappstore error', 'TAppstore txn error: '],
];
const MSG = [
  ['NotEnoughBalanceForTxn', 'Not enough balance to operate.'],
  ['overdraft', 'Not enough balance.'],
  ['overdraw', 'Not enough balance.'],
  ['Not enough balance', 'Not enough balance.'],
  ['The retweet URL has already been used', 'The retweet URL has already been used.'],
  ['Current address already faucet', 'Current address already faucet.'],
  ['SpendOverAllowance', 'Not enough spend limit.'],
  ['Invalid bid price, min bid price is 10000 cents', 'Invalid bid price, min bid price is 10000 cents.'],
  ['Account already exists', 'Account already exists.'],
  ['Not enough USDT balance for Nitro deposit', 'Not enough balance for Nitro deposit.'],
  ['not_enouth_balance_for_gas', "There isn't enough balance in your wallet to cover the gas fee (transaction fee) for this transaction.<br/>New users can claim airdrop credits from TEAFluencer app.", 'Insufficient Funds'],
  
];

const error_message = (ori_msg)=>{
  const msg = _.toLower(ori_msg);
  let prefix = '';
  _.each(PREFIX_MSG, ([k, v])=>{
    k = _.toLower(k);
    if(_.includes(msg, k)){
      prefix = v;
      return false;
    }
  });

  let body = null;
  let title = null;
  _.each(MSG, ([k, v, _tt])=>{
    k = _.toLower(k);
    if(_.includes(msg, k)){
      body = v;
      if(_tt){
        title = _tt;
      }
      return false;
    }
  });

  if(body){
    if(title){
      return [prefix+body, title];
    }
    return prefix+body;
  }

  return ori_msg;
};

export default error_message;