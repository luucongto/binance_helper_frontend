import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Col, Row, Table, Progress, Input } from 'reactstrap'
import { connect } from 'react-redux'
import TradeHistoryActions from '../../../Redux/TradeHistoryRedux'
import AccountInfoActions from '../../../Redux/AccountInfoRedux'
import ApiKeySetting from './Components/ApiKeySetting'
import Alert from 'react-s-alert'
var numeral = require('numeral')
class TradeHistory extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 0,
      asset: '',
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
      this.props.request({
        symbol: Object.keys(props.accountInfo)[0] + 'USDT'
      })
    }
    if (this.props.tradeHistory !== props.tradeHistory) {
      let data = [].concat(this.state.data).concat(props.tradeHistory)
      this.setState({data})
      if (props.tradeHistory.length === 500) {
        let page = this.state.page + 1
        this.setState({page})
        this.props.request({symbol: this.state.asset + 'USDT', fromId: page * 500})
      }
    }
  }
  formatNumber (num) {
    const NUMFORMAT = '0,0[.][0000]'
    return numeral(num).format(NUMFORMAT)
  }
  renderItem (item) {
    return (
      <tr key={item.id} class={item.isBuyer ? 'table-success' : 'table-danger'}>
        <td>{item.symbol}</td>
        {/* <td>{item.orderId}</td> */}
        <td>{this.formatNumber(item.price)}</td>
        <td>{this.formatNumber(item.qty)}</td>
        <td>{this.formatNumber(item.quoteQty)}</td>
        {/* <td>{this.formatNumber(item.commission)}</td> */}
        {/* <td>{item.commissionAsset}</td> */}
        <td>{item.time}</td>
      </tr>
    )
  }

  render () {
    return this.props.fetching ? (<Progress animated color='danger' value='100' />)
      : (
        <div className='animated fadeIn'>
          <Row>
            <Col>
              <Card>
                <CardHeader >
                  <Input type='select' name='asset' id='asset' value={this.state.asset} onChange={(event) => {
                    const asset = event.target.value
                    console.log('onChange', event.target.value)
                    this.setState({asset, page: 0}, () => {
                      this.props.request({symbol: asset + 'USDT'})
                    })
                  }}>
                    {
                        Object.keys(this.props.accountInfo).map(e => <option key={e} value={e} >{e}</option>)
                      }
                  </Input>
                </CardHeader>
                <CardBody>
                  <Table hover bordered striped responsive size='sm'>
                    <thead>
                      <tr>
                        <th>symbol</th>
                        {/* <th>orderId</th> */}
                        <th>price</th>
                        <th>qty</th>
                        <th>quoteQty</th>
                        {/* <th>commission</th>
                        <th>commissionAsset</th> */}
                        <th>time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        this.state.data.map(element => this.renderItem(element))
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
