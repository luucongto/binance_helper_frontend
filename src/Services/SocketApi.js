import ApiConfig from '../Config/ApiConfig'
import io from 'socket.io-client'
class SocketApi {
  constructor () {
    this.socket = null
    this.handlers = []
    this.connectionStatus = 'disconnect'
    this.serverTime = '...'
    this.serverRealApi = true
  }

  setup (loginToken) {
    let self = this
    if(this.socket) this.socket.disconnect()
    if(loginToken === 'empty') return
    console.log("Setup socket ", loginToken)
    this.socket = io(ApiConfig.baseURL, {query: `auth_token=${loginToken}`})
    this.socket.on('server_setting', data => {
      this.serverTime = data.time
      this.serverRealApi = data.type === 'true'
    })
    this.socket.on('connect', () => {
      self.connectionStatus = 'connect'
    })
    this.socket.on('disconnect', () => {
      self.connectionStatus = 'disconnect'
    })
    this.handlers.forEach(handle => {
      this.socket.on(handle.event, data => {
        handle.callback(data)
      })
    })
  }
  on(event, callback){
    this.handlers.push({event, callback})
    if(this.socket) {
      console.log('Set listen', event)
      this.socket.on(event, data=> {callback(data)})
    }
  }
  emit(event, data){
    if(this.socket){
      this.socket.emit(event, data)
      return true
    }
    return false
  }
  socket() {
    return this.socket
  }
}

let api = new SocketApi()

export default api
