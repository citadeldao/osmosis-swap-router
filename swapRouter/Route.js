import {round} from './utils/math'
import { Dec } from "@keplr-wallet/unit";
const zeroDec = new Dec(0);
const oneDec = new Dec(1);
export class OutRoute {
    constructor(amount) {
        this.amount = new Dec(amount)
        this.poolRoute = null
    }
    estimateOutAmount() {
        if (this.poolRoute == null) return zeroDec;
        let outAmount = this.amount;
        this.poolRoute.forEach(pr => {
            outAmount = pr.estimateOutAmount(outAmount);
        });
        return outAmount; 
    }

    estimateSlipage(){
        if (this.poolRoute == null) return 0;
        let slippage = zeroDec
        let outAmount = this.amount;
        this.poolRoute.forEach((pr,i) => {
            outAmount = pr.estimateOutAmount(outAmount)
            pr.amountOut=outAmount
            if(i==0){
                slippage = slippage.add(pr.getSlippage(this.amount,outAmount));
            }else{
                slippage = slippage.add(pr.getSlippage(this.poolRoute[i-1].amountOut,outAmount));
            }
    
        });
        return round(slippage,6);
    }

    estimateRate() {
        if (this.poolRoute == null) return 0;
        return round(this.estimateOutAmount().quo(this.amount),this.poolRoute[this.poolRoute.length-1].to.decimal);
    }

    swapFee(){
        if (this.poolRoute == null) return zeroDec;
        let fee = oneDec;

        this.poolRoute.forEach(pr => {
            fee = fee.mul(oneDec.sub(pr.getSwapFee()));
        });
        return round(oneDec.sub(fee), 5);
    }
}


export class InRoute {
    constructor(amount) {
        this.amount = new Dec(amount)
        this.poolRoute = null
    }
    estimateInAmount() {
        if (this.poolRoute == null) return zeroDec;
        let inAmount = this.amount;
        this.poolRoute.forEach(pr => {
            inAmount = pr.estimateInAmount(inAmount);
        });
        return inAmount; 
    }

    estimateSlipage(){
        if (this.poolRoute == null) return 0;
        let slippage = zeroDec
        let inAmount = this.amount;
        this.poolRoute.forEach((pr,i) => {
            inAmount = pr.estimateInAmount(inAmount)
            pr.inAmount=inAmount
            if(i==0){
                slippage = slippage.add(pr.getSlippage(inAmount,this.amount));
            }else{
                slippage = slippage.add(pr.getSlippage(inAmount,this.poolRoute[i-1].inAmount));
            }
    
        });
        return round(slippage,6);
    }


    estimateRate() {
        if (this.poolRoute == null) return 0;
        return round(this.estimateInAmount().quo(this.amount),this.poolRoute[this.poolRoute.length-1].to.decimal);
    }

    swapFee(){
        if (this.poolRoute == null) return zeroDec;
        let fee = oneDec;

        this.poolRoute.forEach(pr => {
            fee = fee.mul(oneDec.sub(pr.getSwapFee()));
        });
        return round(oneDec.sub(fee), 5);
    }
}