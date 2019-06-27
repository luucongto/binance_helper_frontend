
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Badge, Card, CardBody, CardHeader, Col, Collapse, FormGroup, Input, Label, Row, Table } from 'reactstrap'
import underscore from 'underscore'
import AutoOrdersActions from '../../../../Redux/AutoOrdersRedux'
import api from '../../../../Services/Api'
import SocketApi from '../../../../Services/SocketApi'
import Utils from '../../../../Utils/Utils'
import InfiniteScrollList from './InfiniteScrollList'
import AutoOrderRow from './AutoOrderRow'
class AutoOrders extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openingOrder: -1,
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
  toggle (index) {
    if (this.state.openingOrder === index) {
      this.setState({openingOrder: -1})
    } else {
      this.setState({openingOrder: index})
    }
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

  _update (props) {
    let orders = Utils.clone(props.autoOrders)
    api.getPrices().then(prices => {
      orders.forEach(order => {
        let currencyNum = parseFloat(prices[order.asset + order.currency] || 0) * order.asset_num + order.currency_num
        order.estimate = parseFloat(prices[order.currency + 'USDT'] || 1) * currencyNum
        order.estimate = Utils.formatNumber(order.estimate)
        order.initial_estimate = Utils.formatNumber((parseFloat(prices[order.asset + order.currency] || 0) * order.initial_asset_num + order.initial_currency_num) * parseFloat(prices[order.currency + 'USDT'] || 1))
        order.initial_estimate_percent = Utils.formatNumber(order.estimate / order.initial_estimate * 100 - 100)
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

  _renderList (orders) {
    if (this.props.isTable) {
      return (
        <Table responsive>
          <thead>
            <tr>
              <th> id</th>
              <th> quantity</th>
              <th> asset</th>
              <th> currency</th>
              <th> price</th>
              <th> offset</th>
              <th> percent</th>
              <th> mode</th>
              <th> type</th>
              <th> trigger</th>
              <th> status</th>
            </tr>
          </thead>
          <tbody>
            {this.state.orders.map(order => <AutoOrderRow key={order.id} order={order} isOpen={this.state.openingOrder === order.id} toggle={() => {
              this.setState({currentOrder: order})
              this.toggleLarge()
            }} isTable />)}
          </tbody>
        </Table>
      )
    }
    return (
      <InfiniteScrollList ref='scrollList'
        items={orders}
        renderItem={(order, index) => <AutoOrderRow key={order.id} order={order} isOpen={this.state.openingOrder === order.id} toggle={() => this.toggle(order.id)} />}
        />
    )
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
                  <Row>
                    {this._renderList(orders)}
                  </Row>
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
