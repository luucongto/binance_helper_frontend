const exchangeInfo = require('./exchangeInfo.json')
const fs = require('fs')
const symbols = exchangeInfo.symbols
const result = {
  PAIRS: {
    'USDT': { value: 'USDT', label: 'USDT', assets: [] },
    'ETH': { value: 'ETH', label: 'ETH', assets: [] },
    'BNB': { value: 'BNB', label: 'BNB', assets: [] },
    'BTC': { value: 'BTC', label: 'BTC', assets: [] }
  }
}
console.log(symbols.length)
const apiInfo = {}
symbols.forEach(symbol => {
  apiInfo[symbol.symbol] = symbol.filters.find(each => each.filterType === 'LOT_SIZE')
  if (result.PAIRS[symbol.quoteAsset]) {
    result.PAIRS[symbol.quoteAsset].assets.push(symbol.baseAsset)
  }
})

// console.log(JSON.stringify(result))
fs.writeFileSync('api_info.json', JSON.stringify(apiInfo))