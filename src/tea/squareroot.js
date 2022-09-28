import utils from './utils';
import {_} from 'tearust_utils';
import {k10, k7} from './kn';

const assert = (exp, val)=>{
  if(exp !== val && exp.toString() !== val.toString()){
    throw `Failed => ${exp} !== ${val}`;
  }
}

const bn_sqrt = (n)=>{
  if(n.eq(utils.toBN(0))) return utils.toBN(0);
  if (n.lte(utils.toBN(3))){
    return utils.toBN(1);
  }
  var z = utils.toBN(0);
  if (n.gt(utils.toBN(3))) {
    z = n;
    var x = n.div(utils.toBN(2)).add(utils.toBN(1));
    while (x.lt(z)) {
      z = x;
      x = n.div(x).add(x).div(utils.toBN(2));
    }
  } else if (n.eq(utils.toBN(0))) {
    z = utils.toBN(1);
  }
  return z;
};

const CENT = utils.toBN('10000000000000000');
const DOLLAR = CENT.mul(utils.toBN(100));

const SquareRoot = class {
  constructor(k){
    this.k = utils.toBN(k);
  }

  pool_balance(balance){
    const b = utils.toBN(balance);
    return bn_sqrt(b).mul(b).mul(this.k).mul(utils.toBN(2)).div(utils.toBN('1000000')).div(utils.toBN(30));
  }
  
  buy_price(total_supply){
    return bn_sqrt(utils.toBN(total_supply)).mul(this.k).div(utils.toBN(10)).mul(utils.toBN(1000000));
  }

  pool_balance_reverse(area, precision){
    const zero = utils.toBN(0);
    area = utils.toBN(area);
    if(area.eq(zero)){
      return zero;
    }

    let _times = 0;
    let last_diff = zero;
		let x_n = this.select_nearest_reference_point(area);

    const diff = (a, b)=>{
			return utils.toBN(a).sub(utils.toBN(b)).abs();;
		};

    while(_times<10000){
      let x_n_plus_1 = null; 
      if(x_n.toNumber()<1){
        x_n_plus_1 = zero;
      } else {
        x_n_plus_1 = 
          area.div(this.k)
          .mul(utils.toBN(10000000))
          .div(bn_sqrt(x_n))
          .sub(x_n.mul(utils.toBN(2)).div(utils.toBN(3)))
          .add(x_n);
      }

      if(this.approximately_equals(x_n, x_n_plus_1, precision)){
				return x_n_plus_1;
			} else {
				let new_diff = diff(x_n, x_n_plus_1);
				if( (last_diff.gt(utils.toBN(0))) && (new_diff.gt(last_diff)) ){
					return x_n;
				}
				x_n = x_n_plus_1;
				last_diff = new_diff;
				_times += 1;
			}
    }
    console.log(_times);
  }

  approximately_equals(a, b, precision){
    let abs = utils.toBN(a).sub(utils.toBN(b)).abs();

    return abs.lte(utils.toBN(precision));
  }

  select_nearest_reference_point(area){
		let default_starter = utils.toBN(1100000).mul(utils.toBN(1000000));
    
    const loop = (areas)=>{
      let nearest_index = 0;
      _.each(areas, (item, i)=>{
        if(item > area){
          return false;
        }
        nearest_index = i;
      });

      if(nearest_index < 1){
        return default_starter;
      }
      return utils.toBN(nearest_index*100*DOLLAR);
    };

    switch(this.k.toString()){
      case '10':
        return loop(k10);
      case '7':
        return loop(k7);
      default:
        return default_starter;
    }
	}

};

const F = {
  create(k){
    return new SquareRoot(k);
  },

  calculate_buy_amount(token_amount, total_supply, buy_k){
    const curve = F.create(buy_k);
    const current_pool_balance = curve.pool_balance(total_supply);
    const after_pool_balance = curve.pool_balance(utils.toBN(total_supply).add(utils.toBN(token_amount)));

    return after_pool_balance.sub(current_pool_balance).toString();
  },
  calculate_sell_amount(token_amount, total_supply, sell_k){
    const curve = F.create(sell_k);
    const current_pool_balance = curve.pool_balance(total_supply);
    const after_pool_balance = curve.pool_balance(utils.toBN(total_supply).sub(utils.toBN(token_amount)));

    return current_pool_balance.sub(after_pool_balance).toString();
  },

  test(){
    const pool_balance_works = ()=>{
      const root_square_10 = F.create(10);
      assert(root_square_10.pool_balance(0), 0);
      assert(root_square_10.pool_balance('100000'), 21);
      assert(root_square_10.pool_balance('1000000'), 666);
      assert(root_square_10.pool_balance('10000000'), 21080);
      assert(root_square_10.pool_balance('100000000'), 666666);
      assert(root_square_10.pool_balance(DOLLAR), 666666666666);
      assert(root_square_10.pool_balance(100 * DOLLAR), 666666666666666);

      const root_square_7 = F.create(7);
      assert(root_square_7.pool_balance(0), 0);
      assert(root_square_7.pool_balance(1000000), 466);
      assert(root_square_7.pool_balance(10000000), 14756);
      assert(root_square_7.pool_balance(100000000), 466666);
      assert(root_square_7.pool_balance(DOLLAR), 466666666666);
      assert(root_square_7.pool_balance(100 * DOLLAR), 466666666666666);
    };

    const combined_test_buy_sell_tapp_tokevin = ()=>{
      const root_square_10 = F.create(10); // y = 10√x
		  const root_square_7 = F.create(7); // y = 7√x
		  let x = root_square_10.buy_price(DOLLAR);
		  assert(x, DOLLAR);
      x = root_square_10.buy_price(100 * DOLLAR);
      assert(x, 10*DOLLAR);
  
      x = root_square_7.buy_price(DOLLAR);
      assert(x, 0.7*DOLLAR);
      x = root_square_7.buy_price(100 * DOLLAR);
      assert(x, 7*DOLLAR);

      const x1 = root_square_10.pool_balance(DOLLAR);
      x = root_square_10.pool_balance_reverse(x1, 10);
      assert(x, 999999999994);

      const x2 = root_square_10.pool_balance(DOLLAR*100);
      x = root_square_10.pool_balance_reverse(x2, 10);
      assert(x, 100000000000003);

      const x3 = root_square_7.pool_balance(DOLLAR);
      x = root_square_7.pool_balance_reverse(x3, 10);
      assert(x, 999999999994);

      const x4 = root_square_7.pool_balance(DOLLAR*100);
      x = root_square_7.pool_balance_reverse(x4, 10);
      assert(x, 100000000000003);
    };

    const buy_and_sell_price_works = ()=>{
      let root_square_10 = F.create(10); // y = 10√x
      assert(root_square_10.buy_price(0), 0);
      assert(root_square_10.buy_price(DOLLAR), DOLLAR);
      assert(root_square_10.buy_price(100 * DOLLAR), 10*DOLLAR);
      assert(
        root_square_10.buy_price(10000 * DOLLAR),
        100*DOLLAR
      );
  
      let root_square_7 = F.create(7);
      assert(root_square_7.buy_price(0), 0);
      assert(root_square_7.buy_price(DOLLAR), 0.7*DOLLAR);
      assert(root_square_7.buy_price(100*DOLLAR), 7*DOLLAR);
      assert(root_square_7.buy_price(10000*DOLLAR), 70*DOLLAR);
    }

    const check_pool_balance_multiply_overflow = ()=>{
      let root_square_10 = F.create(10); 
      assert(
        root_square_10.pool_balance('1000000000000000000000000'),
        '666666666666666666666666666666',
      );
  
      assert(
        root_square_10.pool_balance('10000000000000000000000000'),
        '21081851067786666666666666666666'
      );
    }

    pool_balance_works();
    combined_test_buy_sell_tapp_tokevin();
    buy_and_sell_price_works();
    check_pool_balance_multiply_overflow();

    return 'Test success.';
  }
};

window.sq_root = F;
export default F;