import { getAllPools } from './swapRouter/poolLists'
import { getOutAmountRoute } from './swapRouter/getOutAmountRoute.js'
import { getInAmountRoute } from './swapRouter/getInAmountRoute'
(async function () {
    getAllPools().then(async(result) => {
        console.log(result, '--result');
        if(result.swapPools){
            const tradeOut = await getOutAmountRoute('OSMO','ATOM',1)
            console.log(tradeOut, '--tradeOut');
            const tradeIn = await getInAmountRoute('OSMO','ATOM',1)
            console.log(tradeIn, '--tradeIn');
        }
    });
}())