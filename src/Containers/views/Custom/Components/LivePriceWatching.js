import React, { Component } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, InputGroup, InputGroupAddon, InputGroupText, Col, Row, Progress, FormGroup, Input } from 'reactstrap'
import { connect } from 'react-redux'
import Custom from 'binance-api-node'
import underscore from 'underscore'
import LivePriceActions from '../../../../Redux/LivePriceRedux'

import { PAIRS } from '../../../../Config/Const'
import Utils from '../../../../Utils/Utils'
import SocketApi from '../../../../Services/SocketApi'
import SelectSearch from 'react-select-search'
import cryptoNames from '../crypto.json'
var numeral = require('numeral')
const NUMFORMAT = '0,0[.][0000000]'

class LivePrice extends Component {
  constructor(props) {
    super(props)
    this.state = {
      marketPrices: {
      },
      pairs: [],
      currency: 'USDT',
      asset: this.assets('USDT')[0].value
    }
    this.binance = new Custom()
    this.assets = this.assets.bind(this)
  }
  assets(currency) {
    return PAIRS[currency].assets.map(asset => {
      const img = <div><img src={cryptoNames[asset]} style={{ width: 15, marginRight: 5 }} alt='' />{asset}</div>
      const name = asset
      const value = asset
      return { name, value, img }
    })
  }

  renderSearchItem(option) {
    return option.img
  }
  currencies() {
    return Object.values(PAIRS).map(each => { return { name: each.label, value: each.value, img: <div><img src={cryptoNames[each.value]} style={{ width: 15, marginRight: 5 }} alt='' />{each.value}</div> } })
  }
  componentDidMount() {
    this.props.setRef(this)
    if (this.props.livePricePairs) { this._setupWatchingEnpoint(this.props.livePricePairs) }
  }
  addPair(pair) {
    let currentPairs = Object.keys(this.state.marketPrices)
    currentPairs.push(pair)
    console.log(pair, this.state.marketPrices, currentPairs)
    this.props.update(underscore.uniq(currentPairs))
  }
  removePair(pair) {
    let pairs = Object.keys(this.state.marketPrices)
    pairs = pairs.filter(e => e !== pair)
    console.log(pair, pairs)
    this.props.update(pairs)
  }
  _setupWatchingEnpoint(pairs) {
    console.log('Setup Socket.... ', pairs)

    let self = this
    let marketPrices = {}
    let needUpdate = false
    pairs.forEach(pair => {
      if (!this.state.marketPrices[pair]) {
        marketPrices[pair] = { maker: true, price: '...' }
        needUpdate = true
      } else {
        marketPrices[pair] = this.state.marketPrices[pair]
      }
    })
    this.setState({ marketPrices })
    if (!needUpdate) return
    this.binance.ws.trades(pairs, (trades) => {
      self.watch(trades)
    })
  }

  watch(trades) {
    let marketPrices = this.state.marketPrices
    trades.price = parseFloat(trades.price)
    if (marketPrices[trades.symbol]) marketPrices[trades.symbol] = trades
    this.setState({ marketPrices: marketPrices })
  }

  componentWillReceiveProps(props) {
    let openOrders = Utils.clone(props.openOrders ? props.openOrders.filter(e => (e.status !== 'done' && e.status !== 'cancel')) : [])
    let pairs = openOrders.map(e => e.pair)
    let savedPairs = props.livePricePairs
    pairs = pairs.concat(savedPairs)
    if (pairs.length <= 0) return
    pairs = underscore.uniq(pairs)
    this._setupWatchingEnpoint(pairs)
  }
  render() {
    let pairs = Object.keys(this.state.marketPrices)
    let assets = this.assets(this.state.currency)
    console.log('{this.state.asset}', this.state.asset)
    return this.props.fetching ? (<Progress animated color='danger' value='100' />)
      : (
        <div className='animated fadeIn'>
          <Row>
            {
              pairs.map(pair => (
                <Col xs='12' lg='4' xl='4' md='6' key={pair}>
                  <Badge color='danger' onClick={() => this.removePair(pair)}><i className='fa fa-ban' /></Badge>
                  <Badge color='light'>{pair} </Badge>
                  {/* <Badge color='dark'>{this.state.marketPrices[pair].currency} </Badge> */}
                  <Badge color={this.state.marketPrices[pair].maker ? 'success' : 'danger'}>{numeral(this.state.marketPrices[pair].price).format(NUMFORMAT)}</Badge>

                </Col>
              ))
            }
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
