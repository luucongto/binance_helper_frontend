import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Col, Row, Table, Progress, Badge, Button } from 'reactstrap'
import { connect } from 'react-redux'
import TradeHistoryActions from '../../../Redux/TradeHistoryRedux'
import AccountInfoActions from '../../../Redux/AccountInfoRedux'
import Alert from 'react-s-alert'
import Const from '../../../Config/Const'
import SelectSearch from 'react-select-search'

import cryptoNames from './crypto.json'
var numeral = require('numeral')

const CPAIRS = Const.PAIRS
const PAIRS = {}
Object.values(CPAIRS).forEach(each => {
  let currency = each.value
  each.assets.forEach(asset => {
    const assetImg = <img src={cryptoNames[asset]} style={{width: 15, marginRight: 5}} alt='' />
    const currencyImg = <img src={cryptoNames[currency]} style={{width: 15, marginRight: 5}} alt='' />
    const img = (
      <div>
        {assetImg}
        {asset}
        {' => '}
        {currencyImg}
        {currency}
      </div>
    )
    const photo = assetImg
    const name = `${asset}-${currency}`
    const value = `${asset}${currency}`
    PAIRS[value] = {name, value, img, photo, assetImg, currencyImg}
  })
})
class TradeHistory extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 0,
      asset: '',
      buy: true,
      sell: true,
      data: []
    }
    this.props.accountInfoRequest()
  }
  componentWillReceiveProps (props) {
    if (props.error) {
      Alert.error(props.error, {
        position: 'bottom-right',
        effect: 'bouncyflip'
      })
    }
    if (this.props.accountInfo !== props.accountInfo) {
      const asset = Object.keys(props.accountInfo)[0] + 'USDT'
      this.setState({ asset })
      this.props.request({
        symbol: asset
      })
    }
    if (this.props.tradeHistory !== props.tradeHistory) {
      let data = []
      if (this.state.page > 0) {
        data = data.concat(this.state.data)
      }
      data = data.concat(props.tradeHistory)
      this.setState({data})
      if (props.tradeHistory.length === 500) {
        let page = this.state.page + 1
        this.setState({page})
        this.props.request({symbol: this.state.asset, fromId: page * 500})
      }
    }
  }
  formatNumber (num) {
    const NUMFORMAT = '0,0[.][0000]'
    return numeral(num).format(NUMFORMAT)
  }
  formatPercent (num) {
    const NUMFORMAT = '0,0[.][00]'
    return numeral(num).format(NUMFORMAT)
  }
  renderSearchItem (option) {
    return option.img
  }
  renderItem (item) {
    return (
      <tr key={item.id} class={item.isBuyer ? 'table-success' : 'table-danger'}>
        {/* <td>
          {PAIRS[item.symbol].img}
        </td> */}
        <td>{item.orderId}</td>
        <td>
          {PAIRS[item.symbol].currencyImg}{this.formatNumber(item.price)}
        </td>
        <td>
          <Badge>{this.formatPercent(item.price / item.avgMarketPrice * 100)}%</Badge>
        </td>
        <td>{PAIRS[item.symbol].assetImg}{this.formatNumber(item.qty)}</td>
        <td>{PAIRS[item.symbol].currencyImg}{this.formatNumber(item.quoteQty)}</td>
        {/* <td>{this.formatNumber(item.commission)}</td> */}
        {/* <td>{item.commissionAsset}</td> */}
        <td>{item.time}</td>
      </tr>
    )
  }
  renderPrice () {
    const item = this.state.data && this.state.data.length > 0 ? this.state.data[0] : null
    if (!item) return ('')
    console.log(item)
    return (
      <Col>
        {PAIRS[item.symbol].assetImg} 1
        <span className='ml-2 mr-2'>=</span>
        {PAIRS[item.symbol].currencyImg}
        {item ? this.formatNumber(item.avgMarketPrice) : '...'}
      </Col>
    )
  }
  render () {
    let data = [].concat(this.state.data)
    if (!this.state.buy) {
      data = data.filter(each => !each.isBuyer)
    }
    if (!this.state.sell) {
      data = data.filter(each => each.isBuyer)
    }
    const userAssets = []
    if (this.props.accountInfo) {
      Object.keys(this.props.accountInfo).forEach(each => {
        const pair = each + 'USDT'
        if (PAIRS[pair]) {
          userAssets.push(PAIRS[pair])
        }
      })
    }
    const pairs = Object.values(PAIRS)
    return this.props.fetching ? (<Progress animated color='danger' value='100' />)
      : (
        <div className='animated fadeIn'>
          <Row>
            <Col>
              <Card>
                <CardHeader >
                  <Row>
                    <Col xs='auto'>
                    Assets
                      <SelectSearch options={pairs} value={this.state.asset} name='language' placeholder='Choose asset' onChange={(event) => {
                        console.log('onChange', event)
                        const asset = event.value
                        this.setState({asset, page: 0}, () => {
                          this.props.request({symbol: asset})
                        })
                      }}
                        renderOption={this.renderSearchItem} />
                    </Col>
                    <Col xs='auto'>
                      Your Assets
                      <SelectSearch options={userAssets} value={this.state.asset} name='language' placeholder='Choose your asset' onChange={(event) => {
                        const asset = event.value
                        this.setState({asset, page: 0}, () => {
                          this.props.request({symbol: asset})
                        })
                      }} renderOption={this.renderSearchItem} />
                      {/* <Input type='select' name='asset' id='asset' value={this.state.asset} onChange={(event) => {
                    const asset = event.target.value
                    console.log('onChange', event.target.value)
                    this.setState({asset, page: 0}, () => {
                      this.props.request({symbol: asset})
                    })
                  }}>
                    {
                        PAIRS.map(e => <option key={e} value={e} >{e}</option>)
                      }
                  </Input> */}
                    </Col>
                    <Col xs='auto'>
                      <Button size='sm'
                        className='mr-1 mt-1'
                        color={'success'}
                        onClick={() => {
                          this.setState({buy: !this.state.buy})
                        }} >
                        <i className={this.state.buy ? 'mr-1 fa fa-check-square-o' : 'mr-1 fa fa-square-o'} />
                    Buy
                  </Button>
                      <Button size='sm'
                        className='mr-1 mt-1'
                        color={'danger'}
                        onClick={() => {
                          this.setState({sell: !this.state.sell})
                        }} >
                        <i className={this.state.sell ? 'mr-1 fa fa-check-square-o' : 'mr-1 fa fa-square-o'} />
                    Sell
                  </Button>
                    </Col>
                    <Col xs='auto'>
                      {this.renderPrice()}
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  <Table hover bordered striped responsive size='sm'>
                    <thead>
                      <tr>
                        {/* <th>symbol</th> */}
                        <th>orderId</th>
                        <th>price</th>
                        <th>vs market price</th>
                        <th>qty</th>
                        <th>quoteQty</th>
                        {/* <th>commission</th>
                        <th>commissionAsset</th> */}
                        <th>time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        data.map(element => this.renderItem(element))
                      }
                    </tbody>
                  </Table>
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
    accountInfo: state.accountInfo.data,
    tradeHistory: state.tradeHistory.data,
    fetching: state.tradeHistory.fetching,
    error: state.tradeHistory.error
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    accountInfoRequest: () => dispatch(AccountInfoActions.accountInfoRequest()),
    request: (params) => dispatch(TradeHistoryActions.tradeHistoryRequest(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TradeHistory)
