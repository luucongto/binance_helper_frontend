
import React, { Component } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Col, Row, Table, Collapse, FormGroup, Input, Label } from 'reactstrap'
import { connect } from 'react-redux'
import AutoOrdersActions from '../../../../Redux/AutoOrdersRedux'
import SocketApi from '../../../../Services/SocketApi'
import ConfirmButton from './ConfirmButton'
import Binance from 'binance-api-node'
import Utils from '../../../../Utils/Utils'
import api from '../../../../Services/Api'
import underscore from 'underscore'
class AutoOrders extends Component {
  constructor (props) {
    super(props)
    this.state = {
      orders: [],
      showOrder: false,
      showTest: false,
      showCancel: false
    }
    this._setupSocket()
  }
  refresh () {
    SocketApi.emit('auto_order', {command: 'refresh'})
  }
  _setupSocket () {
    let self = this
    SocketApi.on('auto_order', data => {
      self.props.updateOrder(data)
    })
    this.refresh()
  }

  cancelOrder (orderId) {
    SocketApi.emit('auto_order', {
      command: 'cancelOrder',
      id: orderId
    })
  }
  _color (status) {
    switch (status) {
      case 'watching':
        return 'success'
      case 'cancel':
        return 'danger'
      case 'waiting':
        return 'warning'
      case 'done':
        return 'info'
      case 'REAL':
        return 'danger'
      case 'TEST':
        return 'success'
      default:
        return 'light'
    }
  }
  _renderTable (orders) {
    return !orders.length ? ('') : (
      <Table responsive size='sm'>
        <thead>
          <tr>
            <th> id </th>
            <th> currency </th>
            <th> asset </th>
            <th> offset </th>
            <th> Estimate </th>
            <th> status </th>
          </tr>
        </thead>
        <tbody>
          {
            orders.map(element => {
              return (
                <tr key={element.id} >
                  <td>
                    <Badge color={'primary'}> {element.id} </Badge></td>
                  <td>
                    <Badge color={'info'}> {element.currency_num > 10 ? element.currency_num.toFixed(2) : element.currency_num.toFixed(4)} </Badge>
                    <Badge color={'light'}> {element.currency} </Badge>
                  </td>
                  <td>
                    <Badge color={'info'}> {element.asset_num > 10 ? element.asset_num.toFixed(2) : element.asset_num.toFixed(4)} </Badge>
                    <Badge color={'dark'}> {element.asset} </Badge>
                  </td>
                  <td>
                    <Badge color={'dark'}> {element.offset} </Badge>
                    <Badge color={element.offset_percent > 0 ? 'success' : 'danger'}> {element.offset_percent}% </Badge>
                  </td>
                  <td>
                    <Badge color={'light'}> {element.estimate} </Badge>
                    <Badge color={'dark'}> {element.initial_estimate}</Badge>
                    <img src={'https://tether.to/wp-content/uploads/2015/02/TetherIcon.png'} width='15' className='fa' />
                    <Badge color={element.initial_estimate_percent > 0 ? 'success' : 'danger'}> {element.initial_estimate_percent}% </Badge>
                  </td>
                  <td>
                    <Row>
                      <Col xs='6' lg='auto'>
                        <Badge color={this._color(element.type)}> {element.type} </Badge>
                      </Col>
                      <Col xs='6' lg='auto'>
                        <Badge color={this._color(element.status)}> {element.status} </Badge>
                      </Col>
                      {
                        element.status === 'watching'
                      ? (<Col xs='12' lg='4'>
                        <ConfirmButton color='danger' size='sm' onClick={() => this.cancelOrder(element.id)} > <i className='fa fa-ban' /> </ConfirmButton>
                      </Col>) : ''
                      }
                    </Row>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    )
  }

  _update (props) {
    let orders = Utils.clone(props.autoOrders)
    api.getPrices().then(prices => {
      orders.forEach(order => {
        let currencyNum = parseFloat(prices[order.asset + order.currency] || 0) * order.asset_num + order.currency_num
        order.estimate = parseFloat(prices[order.currency + 'USDT'] || 1) * currencyNum
        order.estimate = Utils.formatNumber(order.estimate)
        order.initial_estimate = Utils.formatNumber((parseFloat(prices[order.asset + order.currency] || 0) * order.initial_asset_num + order.initial_currency_num) * parseFloat(prices[order.currency + 'USDT'] || 1))
        order.initial_estimate_percent = Utils.formatNumber(order.estimate / order.initial_estimate * 100)
        order.offset_percent = Utils.formatNumber(parseFloat(order.offset) / parseFloat(prices[order.asset + order.currency] || 1) * 100)
      })
      orders = underscore.sortBy(orders, a => -new Date(a.updatedAt).getTime())
      this.setState({orders})
    }).catch(e => console.log(e))
  }
  componentDidMount () {
    this._update(this.props)
  }
  componentWillReceiveProps (props) {
    this._update(props)
  }

  render () {
    let orders = this.state.orders
    if (!this.state.showTest) {
      orders = orders.filter(order => order.type !== 'TEST')
    }
    if (!this.state.showCancel) {
      orders = orders.filter(order => order.status !== 'cancel')
    }
    return (
      <div className='animated fadeIn'>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <i className='fa fa-align-justify' /> Auto Order
                <FormGroup check inline>
                  <Badge color='success' className='pt-1 pb-1 ml-1'>
                    <Input className='form-check-input' type='checkbox' id='inline-radio1' name='showTest' checked={this.state.showTest} onChange={(event) => {
                      this.setState({showTest: event.target.checked})
                    }} />
                    <Label className='form-check-label' check htmlFor='inline-radio1'>Test</Label>
                  </Badge>
                </FormGroup>
                <FormGroup check inline>
                  <Badge color='danger' className='pt-1 pb-1 ml-1'>
                    <Input className='form-check-input' type='checkbox' id='inline-radio3' name='showCancel' checked={this.state.showCancel} onChange={(event) => this.setState({showCancel: event.target.checked})} />
                    <Label className='form-check-label' check htmlFor='inline-radio3'>Cancel</Label>
                  </Badge>
                </FormGroup>
                <a className=' float-right mb-0 card-header-action btn btn-minimize' onClick={() => this.setState({showOrder: !this.state.showOrder})}><i className={this.state.showOrder ? 'icon-arrow-up' : 'icon-arrow-down'} /></a>
                <a className=' float-right mb-0 card-header-action btn btn-minimize' onClick={() => this.refresh()}><i className='fa fa-refresh' /></a>
              </CardHeader>
              <Collapse isOpen={this.state.showOrder}>
                <CardBody>
                  {this._renderTable(orders)}
                </CardBody>
              </Collapse>
            </Card>
          </Col>
        </Row>
      </div>

    )
  }
}
const mapStateToProps = (state) => {
  return {
    login: state.login.data,
    autoOrders: state.autoOrders.data,
    fetching: state.autoOrders.fetching
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateOrder: (data) => dispatch(AutoOrdersActions.autoOrdersSuccess(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoOrders)
