import React, { Component } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, InputGroup, InputGroupAddon, InputGroupText, Col, Row, Progress, FormGroup, Input } from 'reactstrap'
import { connect } from 'react-redux'
import Binance from 'binance-api-node'
import underscore from 'underscore'
import LivePriceActions from '../../../../Redux/LivePriceRedux'

import {PAIRS} from '../../../../Config/Const'
import Utils from '../../../../Utils/Utils'
import SocketApi from '../../../../Services/SocketApi'
class LivePrice extends Component {
  constructor (props) {
    super(props)
    this.state = {
      marketPrices: {
      },
      pairs: [],
      currency: 'USDT',
      asset: this.assets('USDT')[0]
    }
    this.binance = new Binance()
    this.assets = this.assets.bind(this)
  }
  assets (currency) {
    return PAIRS[currency].assets
  }
  currencies () {
    return Object.values(PAIRS)
  }
  componentDidMount(){
    if(this.props.livePricePairs)
    this._setupWatchingEnpoint(this.props.livePricePairs)
  }
  addPair () {
    let pair = this.state.asset + this.state.currency
    let currentPairs = Object.keys(this.state.marketPrices)
    currentPairs.push(pair)
    console.log(pair, this.state.marketPrices, currentPairs)
    this.props.update(underscore.uniq(currentPairs))
  }
  removePair (pair) {
    let pairs =  Object.keys(this.state.marketPrices)
    pairs = pairs.filter(e => e!= pair)
    console.log(pair, pairs)
    this.props.update(pairs)
  }
  _setupWatchingEnpoint (pairs) {
    console.log('Setup Socket.... ', pairs)

    let self = this
    let marketPrices = {}
    let needUpdate = false
    pairs.forEach(pair => {
      if (!this.state.marketPrices[pair]) {
        marketPrices[pair] = {maker: true, price: '...'}
        needUpdate = true
      } else {
        marketPrices[pair] = this.state.marketPrices[pair]
      }
    })
    this.setState({marketPrices})
    if (!needUpdate) return
    this.binance.ws.trades(pairs, (trades) => {
      self.watch(trades)
    })
  }

  watch (trades) {
    let marketPrices = this.state.marketPrices
    trades.price = parseFloat(trades.price)
    if(marketPrices[trades.symbol]) marketPrices[trades.symbol] = trades
    this.setState({marketPrices: marketPrices})
  }

  componentWillReceiveProps (props) {
    let openOrders = Utils.clone(props.openOrders ? props.openOrders.filter(e => (e.status !== 'done' && e.status !== 'cancel')) : [])
    let pairs = openOrders.map(e => e.pair)
    let savedPairs = props.livePricePairs
    pairs = pairs.concat(savedPairs)
    if (pairs.length <= 0) return
    pairs = underscore.uniq(pairs)
    this._setupWatchingEnpoint(pairs)
  }
  render () {
    let pairs = Object.keys(this.state.marketPrices)
    let assets = this.assets(this.state.currency)
    let currencies = this.currencies()
    return this.props.fetching ? (<Progress animated color='danger' value='100' />)
      : (
        <div className='animated fadeIn'>
          <Row>
            <Col>
              <Card>
                <CardHeader >
                  Live Prices
                  <Badge className="ml-3" color='primary'> {SocketApi.serverTime} </Badge>
                  <Badge className="ml-1" color={SocketApi.connectionStatus === 'connect' ? 'success' : 'danger'}> 
                    <i className='fa fa-wifi'/>
                  </Badge>
                  <Badge className="ml-1" color={SocketApi.serverRealApi ? 'success' : 'danger'}> 
                    {SocketApi.serverRealApi ? 'REAL' : 'TEST'}
                  </Badge>
                  </CardHeader>
                <CardBody>
                  <Row>
                    <Col className='ml-3'>
                      <FormGroup row>
                          <InputGroup>
                            <InputGroupAddon addonType='prepend'>
                              <InputGroupText>
                            Asset
                              </InputGroupText>
                            </InputGroupAddon>
                            <Input type='select' name='asset' id='asset' value={this.state.asset} onChange={(event) => this.setState({asset: event.target.value})}>
                              {
                                assets.map(e => <option key={e} value={e} >{e}</option>)
                              }
                            </Input>
                          </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col className='ml-3'>
                    <FormGroup row>
                      
                        <InputGroup>
                          <InputGroupAddon addonType='prepend'>
                            <InputGroupText>
                      Currency
                            </InputGroupText>
                          </InputGroupAddon>
                          <Input type='select' name='currency' id='currency' onChange={(event) => this.setState({currency: event.target.value})}>
                            {
                              currencies.map(e => <option key={e.value} value={e.value} >{e.label}</option>)
                            }
                          </Input>
                        </InputGroup>
                      
                    </FormGroup>
                    </Col>
                    <Col className='ml-3'>
                    <FormGroup row>
                        <InputGroup>
                          <Button size='l' color='success' onClick={() => this.addPair()} > Add </Button>
                        </InputGroup>
                    </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    {
                      pairs.map(pair => (
                        <Col xs='12' lg='4' xl='4' md='6' key={pair}>
                          <Badge color='danger' onClick={() => this.removePair(pair)}><i className='fa fa-ban' /></Badge>
                          <Badge color='light'>{pair} </Badge>
                          {/* <Badge color='dark'>{this.state.marketPrices[pair].currency} </Badge> */}
                          <Badge color={this.state.marketPrices[pair].maker ? 'success' : 'danger'}>{this.state.marketPrices[pair].price}</Badge>
                          
                        </Col>
                      ))
                    }
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>

      )
  }
}
const mapStateToProps = (state) => {
  return {
    openOrders: state.openOrders.data,
    livePricePairs: state.livePrice.data
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    update: (pairs) => dispatch(LivePriceActions.livePriceSuccess(pairs))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LivePrice)
