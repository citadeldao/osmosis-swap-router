import { OutRoute, InRoute } from './Route';
import ExchangePool from './ExchangePool';
import { TokenInfo } from './TokenInfo';
export default class RouteFinder {
    
    getBestOutRoute(pairs, denomIn, denomOut, amount, temp, currentPairs, originalInDenom, bestRoutes){
      
        let maxNumResults = temp.maxNumResults ? temp.maxNumResults : 3
        let maxHops = temp.maxHops ? temp.maxHops : 3;
        if (currentPairs == undefined) {
            currentPairs = [];
        }
        if (originalInDenom == undefined) {
            originalInDenom = denomIn;
        }

        if (bestRoutes == undefined) {
            bestRoutes = [];
        }
        if(!pairs?.length) return
        if(!maxHops > 0) return
        if(!(originalInDenom === denomIn || currentPairs.length > 0)) return 
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            let denoms = []
            pair.assets.map(a => {
               denoms.push(a.token.denom)
            })
              
            if(!denoms.includes(denomIn)){
                continue
            }
            let tokenOut = pair.getOutputDenom(denomIn)
            if(tokenOut == denomOut){
                let bestRoute = new OutRoute(amount);
                bestRoute.poolRoute = []
                const routes = [].concat(currentPairs, [pair])
                routes.map((elem,i) => {
                    let elemIn = null
                    if(i==0){
                        elemIn = originalInDenom
                    } else {
                        elemIn = bestRoute.poolRoute[i-1].to.denom
                    }
                    let elemOut = elem.getOutputDenom(elemIn)
                    let exPath = elem.getPoolPath(elemIn,elemOut);
                    const from = new TokenInfo(exPath.inAsset.token.denom,exPath.inAsset.token.symbol,exPath.inAsset.token.usdPrice, exPath.inAsset.token.decimal)
                    const to = new TokenInfo(exPath.outAsset.token.denom,exPath.outAsset.token.symbol,exPath.outAsset.token.usdPrice, exPath.outAsset.token.decimal)
                    bestRoute.poolRoute.push(new ExchangePool({id: elem.id,from,to}))
                })
                this.sortedInsert(bestRoutes, bestRoute, maxNumResults, this.outRouteComparator);
            } else if (maxHops > 1 && pairs.length > 1) {
                var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length)); // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
                this.getBestOutRoute(pairsExcludingThisPair, tokenOut, denomOut, amount, {
                    maxNumResults: maxNumResults, maxHops: maxHops - 1}, [].concat(currentPairs, [pair]), originalInDenom, bestRoutes)
            }
        }
        return bestRoutes
    }

    getBestInRoute(pairs, denomIn, denomOut, amount, temp, currentPairs, originalInDenom, bestRoutes){
        try{
            let maxNumResults = temp.maxNumResults ? temp.maxNumResults : 3
            let maxHops = temp.maxHops ? temp.maxHops : 3;
            if (currentPairs == undefined) {
                currentPairs = [];
            }
            if (originalInDenom == undefined) {
                originalInDenom = denomIn;
            }
    
            if (bestRoutes == undefined) {
                bestRoutes = [];
            }
    
            if(!pairs?.length) return
            if(!maxHops > 0) return
            if(!(originalInDenom === denomIn || currentPairs.length > 0)) return 
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                let denoms = []
                pair.assets.map(a => {
                   denoms.push(a.token.denom)
                })
                if(!denoms.includes(denomIn)){
                    continue
                }
                let tokenOut = pair.getOutputDenom(denomIn)
                if(tokenOut == denomOut){
                    let bestRoute = new InRoute(amount);
                    bestRoute.poolRoute = []
                    const routes = [].concat(currentPairs, [pair])
                    routes.map((elem,i) => {
                        let elemIn = null
                        if(i==0){
                            elemIn = originalInDenom
                        } else {
                            elemIn = bestRoute.poolRoute[i-1].to.denom
                        }
                        let elemOut = elem.getOutputDenom(elemIn)
                        let exPath = elem.getPoolPath(elemIn,elemOut);
                        const from = new TokenInfo(exPath.inAsset.token.denom,exPath.inAsset.token.symbol,exPath.inAsset.token.usdPrice, exPath.inAsset.token.decimal)
                        const to = new TokenInfo(exPath.outAsset.token.denom,exPath.outAsset.token.symbol,exPath.outAsset.token.usdPrice, exPath.outAsset.token.decimal)
                        bestRoute.poolRoute.push(new ExchangePool({id: elem.id,from,to}))
                    })
                    this.sortedInsert(bestRoutes, bestRoute, maxNumResults, this.inRouteComparator);
                } else if (maxHops > 1 && pairs.length > 1) {
                    var pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
                    this.getBestInRoute(pairsExcludingThisPair, tokenOut, denomOut, amount, {
                        maxNumResults: maxNumResults, maxHops: maxHops - 1}, [].concat(currentPairs, [pair]), originalInDenom, bestRoutes)
                }
            }
            return bestRoutes
        }catch(e){
            console.log(e)
        }
       
    }
    
    outRouteComparator(a,b){
        if (a.estimateOutAmount().lt(b.estimateOutAmount())) {
            return 1;
        } else if (a.estimateOutAmount().gt(b.estimateOutAmount())) {
            return -1;
        } 
        return a.poolRoute.length - b.poolRoute.length
    }

    inRouteComparator(a,b){
        if (a.estimateInAmount().lt(b.estimateInAmount())) {
            return -1;
        } else if (a.estimateInAmount().gt(b.estimateInAmount())) {
            return 1;
        } 
        return a.poolRoute.length - b.poolRoute.length
    }

    sortedInsert(items, add, maxSize, comparator) {
        if(!(maxSize > 0)){
            return
        }
        if(!(items.length <= maxSize)){
            return
        }
      
        if (items.length === 0) {
          items.push(add);
          return null;
        } else {
          var isFull = items.length === maxSize; // short circuit if full and the additional item does not come before the last item
      
          if (isFull && comparator(items[items.length - 1], add) <= 0) {
            return add;
          }
      
          var lo = 0, hi = items.length;
      
          while (lo < hi) {
            var mid = lo + hi >>> 1;
      
            if (comparator(items[mid], add) <= 0) {
              lo = mid + 1;
            } else {
              hi = mid;
            }
          }
      
          items.splice(lo, 0, add);
          return isFull ? items.pop() : null;
        }
    }
      
}