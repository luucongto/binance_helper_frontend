import apisauce from 'apisauce'
import ApiConfig from '../Config/ApiConfig'
import SocketApi from './SocketApi'
class API {
  constructor (loginToken, baseURL = ApiConfig.baseURL) {
    this.api = apisauce.create({
      // base URL is read from the "constructor"
      baseURL,
      // here are some default headers
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // 15 second timeout...
      timeout: 15000
    })
    // const naviMonitor = (response) => console.log('hey!  listen! ', response)
    // this.api.addMonitor(naviMonitor)
    this.loginToken = loginToken
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.accountInfo = this.accountInfo.bind(this)
    this.openOrders = this.openOrders.bind(this)
    this.apiSetting = this.apiSetting.bind(this)
  }

  authenticated (loginToken) {
    this.loginToken = loginToken
    this.api.setHeader('Authorization', 'jwt ' + loginToken)
    SocketApi.setup(loginToken)
  }

  login (params) {
    console.log(params)
    if (params.type === 'local') {
      return this.api.post('login', params).then(data => {
        let result = data.data
        if (result.success && result.token) this.authenticated(result.token)
        return result
      })
    }
    return this.loginGoogle(params.tokenBlob)
  }
  loginGoogle (data) {
    return this.api.post('auth/google', data).then(data => {
      let result = data.data
      if (result.success && result.token) this.authenticated(result.token)
      return result
    })
  }

  logout () {
    return this.api.get('logout').then(result => {
      this.authenticated('empty')
      return result
    })
  }

  accountInfo () {
    return this.api.get('binance/accountInfo').then(result => {
      return result ? result.data : null
    })
  }

  openOrders (params) {
    if (params && params.command === 'updateOrder' && params.orderId) {
      return this.api.post('binance/updateOrder', {orderId: params.orderId, status: params.status}).then(result => {
        return result ? result.data : null
      })
    }
    if (params && params.command === 'placeOrder') {
      return this.api.post('binance/placeOrder', params).then(result => {
        return result ? result.data : null
      })
    }
    return this.api.get('binance/allOrders').then(result => {
      return result ? result.data : null
    })
  }

  apiSetting (params) {
    return this.api.post('binance/apiSetting', params).then(result => {
      return result ? result.data : null
    })
  }

  getPrices () {
    return this.api.get('binance/allPrices').then(data => {
      let result = data.data
      return result && result.success ? result.data : null
    })
  }
}
// const API = (loginToken, baseURL = ApiConfig.baseURL) => {
//   const api = apisauce.create({
//     // base URL is read from the "constructor"
//     baseURL,
//     // here are some default headers
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     },
//     // 15 second timeout...
//     timeout: 15000
//   })

//   const login = data => {
//     return api.post('login', data).then(result => {
//       if (result.success && result.token) loginToken = result.token
//       return result
//     })
//   }

//   const logout = () => {
//     return api.get('logout')
//   }

//   const accountInfo = () => {
//     console.log('loginToken' + loginToken)
//     return api.get('binance/accountInfo').then(result => {
//       return result ? result.data : null
//     })
//   }

//   return {
//     login,
//     logout,
//     accountInfo
//   }
// }

let api = new API()

export default api
