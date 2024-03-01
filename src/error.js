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
  ['not_enouth_balance_for_gas', 'Not enough balance for txn gas, please topup TEA or go to Tea Fluencer tapp to get credit.']
  
];

const error_message = (msg)=>{
  msg = _.toLower(msg);
  let prefix = '';
  _.each(PREFIX_MSG, ([k, v])=>{
    k = _.toLower(k);
    if(_.includes(msg, k)){
      prefix = v;
      return false;
    }
  });

  let body = null;
  _.each(MSG, ([k, v])=>{
    k = _.toLower(k);
    if(_.includes(msg, k)){
      body = v;
      return false;
    }
  });

  if(body){
    return prefix+body;
  }

  return false;
};

export default error_message;