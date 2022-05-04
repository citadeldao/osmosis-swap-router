import { Dec } from "@keplr-wallet/unit";
const oneDec = new Dec(1);
export default class PoolInfo{
        constructor(opts) {
            this.id = +opts.id;
            this.address = opts.address;
            this.swapFee = new Dec(opts.poolParams?.swapFee);
            this.exitFee = new Dec(opts.poolParams?.exitFee);
            this.assets = opts.listOfAssets;
            this.totalWeight = new Dec(opts.totalWeight.toFixed());
        }
        getRate(inAsset, outAsset){
            return oneDec.sub(this.swapFee).mul(outAsset.weight.quo(inAsset.weight)).mul(outAsset.amount.quo(inAsset.amount));
        }

        getOutputDenom(denomIn){
            const outAsset = this.assets.find(a => a.token.denom != denomIn);
            return outAsset.token.denom
        }

        getRateWithoutFee(inAsset, outAsset){
            return inAsset.weight.quo(outAsset.weight).mul(outAsset.amount.quo(inAsset.amount));
        }
        getSlippage(inAsset, outAsset, amountIn, amountOut){
            const fee = oneDec.sub(this.swapFee);
            const amountRatio = amountIn.quo(amountOut)
            const inAssetRatio = inAsset.amount.quo(inAsset.weight)
            const outAssetRatio = outAsset.amount.quo(outAsset.weight)
            return amountRatio.quo(inAssetRatio.quo(outAssetRatio).mul(oneDec.quo(fee))).sub(oneDec)
        }

        outAmountWithSlippage(inAsset, outAsset, amountIn){
            const fee = oneDec.sub(this.swapFee);
            const weightProportion = inAsset.weight.quo(outAsset.weight);
            const newInputTokenAmount = inAsset.amount.add(amountIn.mul(fee));
            const res = outAsset.amount.mul(new Dec(Math.pow(newInputTokenAmount.toString(), weightProportion.toString())).sub(new Dec(Math.pow(inAsset.amount.toString(), weightProportion.toString())))).quo(new Dec(Math.pow(newInputTokenAmount.toString(), weightProportion.toString())));
            return res
        }
        
     
        inAmountWithSlippage(inAsset, outAsset, amountOut){
            const fee = oneDec.sub(this.swapFee);
            const weightProportion = outAsset.weight.quo(inAsset.weight);
            const a = outAsset.amount.quo(outAsset.amount.sub(amountOut))
            const res = inAsset.amount.mul(new Dec(Math.pow(a.toString(), weightProportion.toString())).sub(oneDec)).quo(fee);
            return res; 
        }

        getPoolPath(denomIn, denomOut){
            let inId = -1;
            for (let i = 0; i < this.assets.length; i++)
            {
                if (denomIn == this.assets[i].token.denom)
                {
                    inId = i;
                    break;
                }
            }
            let outId = -1;
            for (let i = 0; i < this.assets.length; i++)
            {
                if (denomOut == this.assets[i].token.denom)
                {
                    outId = i;
                    break;
                }
            }

            if (inId == -1 || outId == -1)
                return new ExchangePath(null, null, false);

            return new ExchangePath(this.assets[inId], this.assets[outId], true);
        }
    }

    class ExchangePath
    {
        constructor(inA, outA, exists){
            this.inAsset = inA;
            this.outAsset = outA;
            this.isExists = exists;
        }
    }
