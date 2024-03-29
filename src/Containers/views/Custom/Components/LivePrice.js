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
import LivePriceWatching from './LivePriceWatching'
import _ from 'underscore'
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
    return _.sortBy(PAIRS[currency].assets, asset => asset).map(asset => {
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

  addPair() {
    let pair = this.state.asset + this.state.currency
    this.watchRef.addPair(pair)
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
  }
  render() {
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
                  <Badge className='ml-3' color='primary'> {SocketApi.serverTime} </Badge>
                  <Badge className='ml-1' color={SocketApi.connectionStatus === 'connect' ? 'success' : 'danger'}>
                    <i className='fa fa-wifi' />
                  </Badge>
                  <Badge className='ml-1' color={SocketApi.serverRealApi ? 'success' : 'danger'}>
                    {SocketApi.serverRealApi ? 'REAL' : 'TEST'}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col className='ml-3'>
                      Asset
                      <SelectSearch options={assets} value={this.state.asset} name='asset' placeholder='Choose asset' onChange={(event) => this.setState({ asset: event.value })}
                        renderOption={this.renderSearchItem} />

                      {/* <Input type='select' name='asset' id='asset' value={this.state.asset} onChange={(event) => this.setState({asset: event.target.value})}>
                            {
                                assets.map(e => <option key={e} value={e} >{e}</option>)
                              }
                          </Input> */}
                    </Col>
                    <Col className='ml-3'>
                      <Col className='ml-3'>
                        Currency
                          <SelectSearch options={currencies} value={this.state.currency} name='asset' placeholder='Choose asset' onChange={(event) => this.setState({ currency: event.value })}
                          renderOption={this.renderSearchItem} />
                      </Col>
                    </Col>
                    <Col className='ml-3'>
                      <FormGroup row>
                        <InputGroup>
                          <Button size='l' color='success' onClick={() => this.addPair()} > Add </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                  <LivePriceWatching setRef={ref => this.watchRef = ref} />
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
