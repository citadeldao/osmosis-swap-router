import axios from "axios";
import PoolInfo from './PoolInfo';
import { Assets, TokenInfo } from './TokenInfo'
export let poolListResponse = null
export let poolListWithPagination = null
export let swapPools = null
import { Dec } from "@keplr-wallet/unit";

export const getTokenDecimal = (tokens,symbol,denom) => {
  let decimal = null
  if(denom.includes('gamm')){
    return 18;
  }
  if(symbol == 'OSMO'){
    return 6;
  }
  let osmosisToken = tokens?.osmosis;
    if (osmosisToken && symbol) {
      let keys = Object.keys(osmosisToken?.tokens);
      keys.forEach(net => {
        if(osmosisToken.tokens[net].code == symbol){
          decimal = +osmosisToken?.tokens[net].decimals;
        }
      })
    }
  return decimal;
}

export const getAllPools = async () => {
    try {
      poolListResponse = await axios.get(
        "https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=true"
      );
      poolListWithPagination = await axios.get(
        "https://lcd-osmosis.keplr.app/osmosis/gamm/v1beta1/pools?pagination.limit=750"
      );
      const tokens = await axios.get(
        "https://work.3ahtim54r.ru/api/networks.json"
      );
      swapPools = generatePoolList(poolListWithPagination.data?.pools,poolListResponse?.data,tokens?.data);
      const lastSuccessUpdateTime = new Date();
      return { swapPools: swapPools, lastSuccessUpdateTime };
    } catch(e) {
      console.log(e)
      setTimeout(async() => await getAllPools(), 5000)
      return { swapPools: swapPools };
    }
  };


const generatePoolList = (pools,poolList,tokens) => {
  try{
    let newPools = [];
    pools.map((pool) => {
      if(poolList[pool.id]){
        let listOfAssets = []
        poolList[pool.id]?.map((asset,i) => {
          let decimal = getTokenDecimal(tokens,asset.symbol,asset.denom)
          if(decimal){
            listOfAssets.push(new Assets(new TokenInfo(asset.denom,asset.symbol,asset.price,decimal), new Dec(pool.poolAssets[i].weight).quo(new Dec(pool.totalWeight)), new Dec(pool.poolAssets[i].token.amount).quo(new Dec(Math.pow(10, decimal)))));
          }  
        })
        if(listOfAssets.length == poolList[pool.id].length){
          const poolInfo = new PoolInfo({ ...pool, totalWeight: poolList[pool.id][0]?.liquidity,listOfAssets});
          newPools.push(poolInfo);
        }   
      } 
    });
    return newPools;
  }
  catch(e){
    console.log(e)
    return swapPools
  }
};
  

export const getDenomByCode = (code) => {
  try{
    let keys = Object.keys(poolListResponse?.data);
    let denom = "";
    for (let i = 0; i < keys.length; i++) {
      if (poolListResponse?.data[keys[i]][0].symbol == code) {
        denom = poolListResponse?.data[keys[i]][0].denom;
        break;
      } else if (poolListResponse?.data[keys[i]][1].symbol == code) {
        denom = poolListResponse?.data[keys[i]][1].denom;
        break;
      }
    }
    return denom;
  }catch{}
  };