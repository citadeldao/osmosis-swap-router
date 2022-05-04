export class TokenInfo {
    constructor(denom,symbol,usdPrice,decimal) {
        this.denom = denom;
        this.symbol = symbol;
        this.usdPrice = usdPrice;
        this.decimal = decimal;
    }
}


export class Assets
{
    constructor(token,weight,amount) {
        this.weight = weight;
        this.token = token;
        this.amount = amount;
    }
}
