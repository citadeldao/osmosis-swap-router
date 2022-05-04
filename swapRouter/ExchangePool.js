import { swapPools } from './poolLists'
import { Dec } from "@keplr-wallet/unit";
const zeroInt = new Dec(0);
export default class ExchangePool {
    constructor(opts) {
        this.id = opts.id;
        this.from = opts.from;
        this.to = opts.to;
    }
    estimateOutAmount(amount)
    {
        const pi = swapPools.find(p => p.id == this.id);
        if (pi.id == 0){
            return zeroInt;
        }  
        const ep = pi.getPoolPath(this.from.denom, this.to.denom);
        if (ep.isExists){
            return pi.outAmountWithSlippage(ep.inAsset, ep.outAsset, amount);
        } else {
            return zeroInt;
        }     
    }

    getOutRate(){
        const pi = swapPools.find(p => p.id == this.id);
        if (pi.id == 0){
            return zeroInt;
        }  
        const ep = pi.getPoolPath(this.from.denom, this.to.denom);
        if (ep.isExists){
            return pi.getRate(ep.inAsset, ep.outAsset);
        }else {
            return zeroInt;
        }   
    }

    getOutRateWithoutFee(){
        const pi = swapPools.find(p => p.id == this.id);
        if (pi.id == 0){
            return zeroInt;
        }  
        const ep = pi.getPoolPath(this.from.denom, this.to.denom);
        if (ep.isExists){
            return pi.getRateWithoutFee(ep.inAsset, ep.outAsset);
        }else {
            return zeroInt;
        } 
    }


    getSlippage(amountIn, amountOut){
        const pi = swapPools.find(p => p.id == this.id);
        if (pi.id == 0){
            return zeroInt;
        }  
        const ep = pi.getPoolPath(this.from.denom, this.to.denom);
        if (ep.isExists){
            return pi.getSlippage(ep.inAsset, ep.outAsset, amountIn, amountOut)
        }else {
            return zeroInt;
        } 
    }

    estimateInAmount(amount){
        const pi = swapPools.find(p => p.id == this.id);
        if (pi.id == 0){
            return zeroInt;
        }  
        const ep = pi.getPoolPath(this.from.denom, this.to.denom);
        if (ep.isExists){
            return pi.inAmountWithSlippage(ep.inAsset, ep.outAsset,amount)
        }else {
            return zeroInt;
        } 
    }

    getSwapFee(){
        const pi = swapPools.find(p => p.id == this.id);
        if (pi.id == 0){
            return zeroInt;
        }  
        return pi.swapFee;
    }

}