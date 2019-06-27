import React, { Component } from 'react'
import {Button, Card, CardHeader, Col, Row, Table, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import { connect } from 'react-redux'
import OpenOrdersActions from '../../../../Redux/OpenOrdersRedux'
import SocketApi from '../../../../Services/SocketApi'
import Utils from '../../../../Utils/Utils'
import InfiniteScrollList from './InfiniteScrollList'
import OpenOrderRow from './OpenOrderRow'
import underscore from 'underscore'
class OpenOrders extends Component {
  constructor (props) {
    super(props)
    this.state = {
      large: false,
      currentOrder: {},
      showAuto: true,
      openingOrder: -1,
      orders: [],
      filters: {
        'done': false,
        'watching': true,
        'waiting': true,
        'cancel': false,
        'manual': true,
        'auto': true,
        'buy': true,
        'sell': true,
        'TEST': false,
        'REAL': true
      },
      hideSymbols: []
    }
    this._setupSocket()
    this.toggleLarge = this.toggleLarge.bind(this)
  }
  toggleLarge () {
    this.setState({
      large: !this.state.large
    })
  }
  refresh () {
    SocketApi.emit('update_order', {
      command: 'refresh'
    })
  }
  _setupSocket () {
    let self = this
    SocketApi.on('update_order', data => {
      self.props.updateOrder(data)
    })
    this.refresh()
  }

  holdOrder (orderId) {
    SocketApi.emit('update_order', {
      command: 'updateOrder',
      status: 'hold',
      id: orderId
    })
  }
  cancelOrder (orderId) {
    console.log('Press cancel')
    SocketApi.emit('update_order', {
      command: 'updateOrder',
      status: 'cancel',
      id: orderId
    })
  }
  resumeOrder (orderId) {
    SocketApi.emit('update_order', {
      command: 'updateOrder',
      status: 'watching',
      id: orderId
    })
  }

  _getButton (element) {
    switch (element.status) {
      case 'watching':
        return (<Button color='warning' size='sm' className='ml-3' onClick={() => this.holdOrder(element.id)} active> <i className='fa fa-pause' /> </Button>)
      default :
        return (<Button color='success' size='sm' className='ml-3' onClick={() => this.resumeOrder(element.id)} active> <i className='fa fa-play' /> </Button>)
    }
  }
  _color (status) {
    switch (status) {
      case 'watching':
      case 'buy':
      case 'TEST':
        return 'success'
      case 'cancel':
      case 'REAL':
      case 'sell':
        return 'danger'
      case 'waiting':
        return 'warning'
      case 'done':
        return 'info'
      case 'manual':
        return 'secondary'
      case 'auto':
        return 'primary'

      default:
        return 'light'
    }
  }
  componentWillReceiveProps (props) {
    let renderOrders = Object.values(props.openOrders) || []
    this.setState({orders: this._filter(renderOrders)})
  }
  _filter (renderOrders, filters = this.state.filters, hideSymbols = this.state.hideSymbols) {
    if (!renderOrders) {
      console.error('filter order null')
      return []
    }
    if (!filters.done) {
      renderOrders = renderOrders.filter(order => order.status !== 'done')
    }
    if (!filters.watching) {
      renderOrders = renderOrders.filter(order => order.status !== 'watching')
    }
    if (!filters.waiting) {
      renderOrders = renderOrders.filter(order => order.status !== 'waiting')
    }
    if (!filters.cancel) {
      renderOrders = renderOrders.filter(order => order.status !== 'cancel')
    }
    if (!filters.manual) {
      renderOrders = renderOrders.filter(order => order.balance_id > 0)
    }
    if (!filters.auto) {
      renderOrders = renderOrders.filter(order => order.balance_id === 0)
    }
    if (!filters.buy) {
      renderOrders = renderOrders.filter(order => order.mode !== 'buy')
    }
    if (!filters.sell) {
      renderOrders = renderOrders.filter(order => order.mode !== 'sell')
    }
    if (!filters.TEST) {
      renderOrders = renderOrders.filter(order => order.type !== 'TEST')
    }
    if (!filters.REAL) {
      renderOrders = renderOrders.filter(order => order.type !== 'REAL')
    }
    if (hideSymbols.length > 0) {
      hideSymbols.forEach(symbol => {
        renderOrders = renderOrders.filter(order => order.asset !== symbol && order.currency !== symbol)
      })
    }
    renderOrders = underscore.sortBy(renderOrders, order => order.id)
    return renderOrders
  }
  toggle (index) {
    if (this.state.openingOrder === index) {
      this.setState({openingOrder: -1})
    } else {
      this.setState({openingOrder: index})
    }
  }
  _renderList () {
    var orders = this.state.orders
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
            {orders.map(order => <OpenOrderRow key={order.id} order={order} isOpen={this.state.openingOrder === order.id} toggle={() => {
              this.setState({currentOrder: order})
              this.toggleLarge()
            }} isTable />)}
          </tbody>
        </Table>
      )
    }
    return (
      <InfiniteScrollList ref='scrollList'
        items={this.state.orders || []}
        renderItem={(order, index) => <OpenOrderRow key={order.id} order={order} isOpen={this.state.openingOrder === order.id} toggle={() => this.toggle(order.id)} />}
        />
    )
  }

  _renderHeader (openOrders) {
    let self = this
    let symbols = openOrders.map(order => order.asset).concat(openOrders.map(order => order.currency))
    symbols = underscore.uniq(symbols)

    return (
      <Card>
        <CardHeader>
          {Object.keys(this.state.filters).map(filter => (
            <Button key={filter} size='sm' className='mr-1 mt-1' color={this._color(filter)} onClick={() => {
              let filters = JSON.parse(JSON.stringify(this.state.filters))
              filters[filter] = !filters[filter]
              let orders = Object.values(self.props.openOrders) || []
              orders = self._filter(orders, filters)
              self.setState({filters, orders})
            }} >
              <i className={this.state.filters[filter] ? 'mr-1 fa fa-check-square-o' : 'mr-1 fa fa-square-o'} />
              {filter}
            </Button>
              ))}
          {symbols.map(symbol => (
            <Button key={symbol} size='sm' className='mr-1 mt-1' color={this._color(symbol)} onClick={() => {
              let hideSymbols = Utils.clone(this.state.hideSymbols)
              let index = hideSymbols.indexOf(symbol)
              if (index < 0) hideSymbols.push(symbol)
              else hideSymbols.splice(index, 1)
              let orders = Object.values(self.props.openOrders) || []
              orders = self._filter(orders, this.state.filters, hideSymbols)
              this.setState({hideSymbols, orders})
            }} >
              <i className={this.state.hideSymbols.indexOf(symbol) < 0 ? 'mr-1 fa fa-check-square-o' : 'mr-1 fa fa-square-o'} />
              {symbol}
            </Button>
              ))}
        </CardHeader>
      </Card>
    )
  }
  render () {
    var currentOrder = this.state.currentOrder
    return (
      <div className='animated fadeIn pl-0 pr-0'>
        <Row>
          <Col>
            {this._renderHeader(this.props.openOrders)}
          </Col>
        </Row>
        <Row>
          {this._renderList()}
        </Row>

        <Modal isOpen={this.state.large} toggle={this.toggleLarge}
          className={'modal-lg ' + this.props.className}>
          <ModalBody>
            <OpenOrderRow key={currentOrder.id} order={currentOrder} isOpen toggle={() => this.toggle(currentOrder.id)} />
          </ModalBody>

        </Modal>
      </div>

    )
  }
}
const mapStateToProps = (state) => {
  return {
    login: state.login.data,
    openOrders: state.openOrders.data,
    fetching: state.openOrders.fetching
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    request: (params) => dispatch(OpenOrdersActions.openOrdersRequest(params)),
    updateOrder: (data) => dispatch(OpenOrdersActions.openOrdersSuccess(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OpenOrders)
