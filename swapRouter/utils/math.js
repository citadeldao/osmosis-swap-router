import { Dec, Int } from "@keplr-wallet/unit";
const twoInt = new Int(2);
const oneDec = new Dec(1);
const powPrecision = new Dec("0.00000001");
const zeroInt = new Int(0);

export function pow(base, exp) {
  if (!base.isPositive()) {
    throw new Error("base must be greater than 0");
  }
  const integer = exp.truncate();
  const fractional = exp.sub(new Dec(integer));

  const integerPow = powInt(base, integer);

  if (fractional.isZero()) {
    return integerPow;
  }
  const fractionalPow = powApprox(base, fractional, powPrecision);
  return integerPow.mul(fractionalPow);
}

export function calcOutGivenIn(
  tokenBalanceIn,
  tokenWeightIn,
  tokenBalanceOut,
  tokenWeightOut,
  tokenAmountIn,
  swapFee
) {
  const oneDec = new Dec("1");
  const weightRatio = tokenWeightIn.quo(tokenWeightOut);
  let adjustedIn = oneDec.sub(swapFee);
  adjustedIn = tokenAmountIn.mul(adjustedIn);
  const y = tokenBalanceIn.quo(tokenBalanceIn.add(adjustedIn));
  const foo = pow(y, weightRatio);
  const bar = oneDec.sub(foo);
  return tokenBalanceOut.mul(bar);
}

export function calcSpotPrice(
  tokenBalanceIn,
  tokenWeightIn,
  tokenBalanceOut,
  tokenWeightOut,
  swapFee
) {
  const number = tokenBalanceIn.quo(tokenWeightIn);
  const denom = tokenBalanceOut.quo(tokenWeightOut);
  const scale = oneDec.quo(oneDec.sub(swapFee));
  return number.quo(denom).mul(scale);
}

function powInt(base, power) {
  if (power.equals(zeroInt)) {
    return oneDec;
  }
  let tmp = oneDec;

  for (let i = power; i.gt(new Int(1)); ) {
    if (!i.mod(twoInt).equals(zeroInt)) {
      tmp = tmp.mul(base);
    }
    i = i.div(twoInt);
    base = base.mul(base);
  }

  return base.mul(tmp);
}
export function absDifferenceWithSign(a, b) {
  if (a.gte(b)) {
    return [a.sub(b), false];
  } else {
    return [b.sub(a), true];
  }
}

export function powApprox(base, exp, precision) {
  if (exp.isZero()) {
    return new Dec(0);
  }

  const a = exp;
  const [x, xneg] = absDifferenceWithSign(base, oneDec);
  let term = oneDec;
  let sum = oneDec;
  let negative = false;

  // TODO: Document this computation via taylor expansion
  for (let i = 1; term.gte(precision); i++) {
    const bigK = oneDec.mul(new Dec(i.toString()));
    const [c, cneg] = absDifferenceWithSign(a, bigK.sub(oneDec));
    term = term.mul(c.mul(x));
    term = term.quo(bigK);

    if (term.isZero()) {
      break;
    }
    if (xneg) {
      negative = !negative;
    }

    if (cneg) {
      negative = !negative;
    }

    if (negative) {
      sum = sum.sub(term);
    } else {
      sum = sum.add(term);
    }
  }
  return sum;
}

export function calcPoolOutGivenSingleIn(
  tokenBalanceIn,
  tokenWeightIn,
  poolSupply,
  totalWeight,
  tokenAmountIn,
  swapFee
) {
  const oneDec = new Dec(1);
  const normalizedWeight = tokenWeightIn.quo(totalWeight);
  const zaz = oneDec.sub(normalizedWeight).mul(swapFee);
  const tokenAmountInAfterFee = tokenAmountIn.mul(oneDec.sub(zaz));
  const newTokenBalanceIn = tokenBalanceIn.add(tokenAmountInAfterFee);
  const tokenInRatio = newTokenBalanceIn.quo(tokenBalanceIn);
  const poolRatio = pow(tokenInRatio, normalizedWeight);
  const newPoolSupply = poolRatio.mul(poolSupply);
  return newPoolSupply.sub(poolSupply);
}


export const round = (num,decimal=6) => {
  let result = num
  if(num > 0 && !num.toString().includes('e')){
    let arr = num.toString().split('.')
    if(arr.length > 1){
      let drob = arr[1].substr(0,decimal)
      if(decimal==0){
        result = arr[0]
      }
      result = arr[0]+'.'+drob
    }
  }else if(num.toString().includes('e')){
    const numDec = Math.pow(10,decimal)
    result = Math.round((+num.toString() + Number.EPSILON) * numDec) / numDec;
  }
  return +result
}
