import React, { Component } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Col, Row, Table, Collapse } from 'reactstrap'
import { connect } from 'react-redux'
import OpenOrdersActions from '../../../../Redux/OpenOrdersRedux'
import moment from 'moment'
import {AppSwitch} from '@coreui/react'
import SocketApi from '../../../../Services/SocketApi'
import Utils from '../../../../Utils/Utils'
import ConfirmButton from './ConfirmButton'
import underscore from 'underscore'
class OpenOrders extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showDoneOrder: false,
      showOrder: true,
      showAuto: true,
      showTest: false,
      openOrders: [],
      doneOrders: []
    }
    this._setupSocket()
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
  componentWillReceiveProps (props) {
    let openOrders = []
    let doneOrders = []
    if (props.openOrders) {
      let orders = Utils.clone(props.openOrders)
      openOrders = orders.filter(e => (e.status !== 'done' && e.status !== 'cancel'))
      doneOrders = orders.filter(e => (e.status === 'done'))
      openOrders = underscore.sortBy(openOrders, a => -new Date(a.updatedAt).getTime())
      doneOrders = underscore.sortBy(doneOrders, a => -new Date(a.updatedAt).getTime())
      this.setState({openOrders, doneOrders})
    }
  }
  _filterStatus (openOrders) {
    let status = {
      'done': 0,
      'watching': 0,
      'waiting': 0,
      'manual': 0,
      'auto': 0,
      'buy': 0,
      'sell': 0,
      'TEST': 0,
      'REAL': 0
    }
    openOrders.forEach(order => {
      status[order.status]++
      if (order.balance_id) status.auto++
      else status.manual ++
      status[order.type]++
      status[order.mode]++
    })
    return status
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
        return 'success'
      case 'cancel':
        return 'danger'
      case 'waiting':
        return 'warning'
      case 'done':
        return 'info'
      default:
        return 'light'
    }
  }
  _renderTable (orders) {
    let ordersTotal = 0
    let ordersExpectTotal = 0
    orders.forEach(element => {
      let total = element.quantity * element.price
      let expectTotal = element.quantity * element.expect_price
      element.percent = Utils.formatNumber(total / expectTotal * 100 - 100)
      element.total = Utils.formatNumber(total)
      element.expectTotal = Utils.formatNumber(expectTotal)
      ordersTotal += total
      ordersExpectTotal += expectTotal
      element.offset_percent = Utils.formatNumber(element.offset / element.expect_price * 100)
    })
    ordersTotal = Utils.formatNumber(ordersTotal)
    ordersExpectTotal = Utils.formatNumber(ordersExpectTotal)
    return !orders.length ? ('') : (
      <Table responsive size='sm'>
        <thead>
          <tr>
            {/* <th> id </th> */}
            <th> pair </th>
            <th>
              <Badge color={'light'}> Price </Badge>
              <Badge color={'dark'}> Expect </Badge>
              <Badge color={'info'}> Offset </Badge>
            </th>
            <th>
              <Badge color={'info'}> Estimate </Badge>
              <Badge color={'light'}> {ordersTotal} </Badge>
              <Badge color={'dark'}> {ordersExpectTotal} </Badge> </th>
            <th> mode

            </th>
            {/* <th> createdAt </th> */}
            <th> status </th>

          </tr>
        </thead>
        <tbody>
          {
            orders.map((element, index) => {
              return (
                <tr key={index} >
                  {/* <td> {element.id} </td> */}
                  <td>
                    <Badge color={'info'}> {Utils.formatNumber(element.quantity)} </Badge>
                    <Badge color={'light'}> {element.asset} </Badge>
                    <Badge color={'dark'}> {element.currency} </Badge>
                  </td>
                  <td>
                    <Badge color={'light'}> {Utils.formatNumber(element.price)} </Badge>
                    <Badge color={'dark'}> {Utils.formatNumber(element.expect_price)} </Badge>
                    <Badge color={'info'}> {Utils.formatNumber(element.offset)} </Badge>
                    <Badge color={'success'}> {Utils.formatNumber(element.offset_percent)}% </Badge>
                  </td>
                  <td>
                    <Badge color={'light'}> { Utils.formatNumber(element.total)} </Badge>
                    <Badge color={'dark'}> { Utils.formatNumber(element.expectTotal)} </Badge>
                    <Badge color={(element.mode === 'buy' && element.percent <= 0) || (element.mode === 'sell' && element.percent >= 0) ? 'success' : 'danger'}> {element.percent}% </Badge>
                  </td>
                  <td>
                    <Badge color={element.mode === 'buy' ? 'success' : 'danger'}> {element.mode} </Badge>
                    <Badge color={element.type === 'TEST' ? 'success' : 'danger'}> {element.type}</Badge>
                    {element.binance_order_id ? (<Badge color={'dark'}> {element.binance_order_id}</Badge>) : ('')}
                    <Badge color={element.balance_id > 0 ? 'primary' : 'secondary'}> {element.balance_id > 0 ? `Auto[${element.balance_id}]` : 'Manual'} </Badge>
                  </td>

                  <td>
                    <Row>
                      <Col lg='7'>
                        <Badge color={'light'}> {moment(element.updatedAt).format('MM/DD HH:mm')} </Badge>
                        <Badge className='ml-3' color={this._color(element.status)}> {element.status} </Badge>
                      </Col>
                      <Col>
                        { this._getButton(element) }
                        {
                      element.status === 'done' || element.status === 'cancel' ? ('') : (
                        <ConfirmButton color='danger' size='sm' className='ml-3' onClick={() => this.cancelOrder(element.id)} active> <i className='fa fa-stop' /> </ConfirmButton>
                      )
                    }
                      </Col>
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
  render () {
    let openOrders = Utils.clone(this.state.openOrders)
    let doneOrders = Utils.clone(this.state.doneOrders)
    let status = this._filterStatus(openOrders)
    let doneStatus = this._filterStatus(doneOrders)
    if (!this.state.showAuto) {
      openOrders = openOrders.filter(order => !order.balance_id)
      doneOrders = doneOrders.filter(order => !order.balance_id)
    }
    if (!this.state.showTest) {
      openOrders = openOrders.filter(order => order.type !== 'TEST')
      doneOrders = doneOrders.filter(order => order.type !== 'TEST')
    }
    return (
      <div className='animated fadeIn pl-0 pr-0'>
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <i className='fa fa-align-justify' /> Orders
                Connection:

                <Badge className='ml-3' color='primary'> Auto {status.auto}</Badge>
                <Badge className='ml-3' color='secondary'> Manual {status.manual}</Badge>
                <Badge className='ml-3' color='success'> TEST {status.TEST} </Badge>

                <Badge className='ml-3' color='danger'> REAL {status.REAL}</Badge>
                <Badge className='ml-3' color='warning'> Waiting {status.waiting}</Badge>
                <Badge className='ml-3' color='success'> Watching {status.watching}</Badge>
                <Badge className='ml-3' color='success'> Buy {status.buy}</Badge>
                <Badge className='ml-3' color='danger'> Sell {status.sell}</Badge>

                <a className=' float-right mb-0 card-header-action btn btn-minimize' onClick={() => this.setState({showOrder: !this.state.showOrder})} ><i className={this.state.showOrder ? 'icon-arrow-up' : 'icon-arrow-down'} /></a>
                <a className=' float-right mb-0 card-header-action btn btn-minimize' onClick={() => this.refresh()}><i className='fa fa-refresh' /></a>

                <AppSwitch className={'ml-1 mr-3 mb-0 float-right '} label color={'success'} defaultChecked={this.state.showTest} size={'sm'} onClick={() => this.setState({showTest: !this.state.showTest})} />
                <strong className='float-right'> Show Test </strong>
                <AppSwitch className={'ml-1 mr-3  mb-0 float-right'} label color={'info'} defaultChecked={this.state.showAuto} size={'sm'} onClick={() => this.setState({showAuto: !this.state.showAuto})} />
                <strong className='float-right'> Auto </strong>
              </CardHeader>
              <Collapse isOpen={this.state.showOrder} id='collapseExample'>
                <CardBody className='pl-0 pr-0'>
                  {this._renderTable(openOrders)}
                </CardBody>
              </Collapse>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card>
              <CardHeader>
                <i className='fa fa-align-justify' /> Completed Orders
                <Badge className='ml-3' color='primary'> Done {doneStatus.done}</Badge>
                <Badge className='ml-3' color='primary'> Auto {doneStatus.auto}</Badge>
                <Badge className='ml-3' color='secondary'> Manual {doneStatus.manual}</Badge>
                <Badge className='ml-3' color='success'> TEST {doneStatus.TEST}</Badge>
                <Badge className='ml-3' color='danger'> REAL {doneStatus.REAL}</Badge>
                <Badge className='ml-3' color='warning'> Waiting {doneStatus.waiting}</Badge>
                <Badge className='ml-3' color='success'> Watching {doneStatus.watching}</Badge>
                <Badge className='ml-3' color='success'> Buy {doneStatus.buy}</Badge>
                <Badge className='ml-3' color='danger'> Sell {doneStatus.sell}</Badge>
                <a className=' float-right mb-0 card-header-action btn btn-minimize' onClick={() => this.setState({showDoneOrder: !this.state.showDoneOrder})}><i className={this.state.showDoneOrder ? 'icon-arrow-up' : 'icon-arrow-down'} /></a>
              </CardHeader>
              <Collapse isOpen={this.state.showDoneOrder} id='collapseExample'>
                <CardBody className='pl-0 pr-0'>
                  {this._renderTable(doneOrders)}
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
