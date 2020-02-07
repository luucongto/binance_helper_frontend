import React, { Component } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, CardFooter, Col, Row, FormGroup, Form, Input, Label, Collapse, InputGroup, InputGroupText, InputGroupAddon } from 'reactstrap'
import { connect } from 'react-redux'
import moment from 'moment'
import {AppSwitch} from '@coreui/react'
import Utils from '../../../../Utils/Utils'
import ConfirmButton from './ConfirmButton'
import underscore from 'underscore'
import SocketApi from '../../../../Services/SocketApi'
import cryptoNames from '../crypto.json'
var numeral = require('numeral')
const NUMFORMAT = '0,0[.][000]'

class OpenOrderRow extends Component {
  constructor (props) {
    super(props)
    let order = props && props.order ? props.order : {}
    this.state = {
      isEditing: false,
      quantity: order.quantity || 0,
      type: order.type || 'NA',
      offset: order.offset || 0,
      price: order.price || 0,
      expect_price: order.expect_price || 0,
      total: order.quantity * order.expect_price || 0
    }
  }

  componentWillReceiveProps (props) {
    if (this.state.isEditing) return
    let order = props && props.order ? props.order : {}
    this.setState({
      quantity: order.quantity || 0,
      type: order.type || 'NA',
      offset: order.offset || 0,
      price: order.price || 0,
      expect_price: order.expect_price || 0,
      total: order.quantity * order.expect_price || 0
    })
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
  updateOrder (orderId) {
    this.setState({isEditing: false})
    SocketApi.emit('update_order', {
      command: 'updateOrder',
      id: orderId,
      quantity: this.state.quantity,
      type: this.state.type,
      offset: this.state.offset,
      expect_price: this.state.expect_price
    })
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
  waitingOrder (orderId) {
    SocketApi.emit('update_order', {
      command: 'updateOrder',
      status: 'waiting',
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
  _getButton (order) {
    switch (order.status) {
      case 'watching':
        return (
          <CardFooter>
            <ConfirmButton onCancel={() => this.setState({isEditing: false})} className='ml-3' size='sm' color={order.mode === 'buy' ? 'success' : 'danger'} onClick={() => this.updateOrder(order.id)} ><i className='fa fa-dot-circle-o' /> {order.mode.toUpperCase()}</ConfirmButton>
            <Button color='secondary' size='sm' className='ml-3' onClick={() => this.holdOrder(order.id)} active> <i className='fa fa-pause' /> </Button>
          </CardFooter>
        )
      case 'waiting':
        return (
          <CardFooter>
            <ConfirmButton onCancel={() => this.setState({isEditing: false})} className='ml-3' size='sm' color={order.mode === 'buy' ? 'success' : 'danger'} onClick={() => this.updateOrder(order.id)} ><i className='fa fa-dot-circle-o' /> {order.mode.toUpperCase()}</ConfirmButton>
            <Button color='secondary' size='sm' className='ml-3' onClick={() => this.holdOrder(order.id)} active> <i className='fa fa-pause' /> </Button>
            <Button color='success' size='sm' className='ml-3' onClick={() => this.resumeOrder(order.id)} active> <i className='fa fa-eye' /> </Button>
            <ConfirmButton onCancel={() => this.setState({isEditing: false})} color='danger' size='sm' className='ml-3' onClick={() => this.cancelOrder(order.id)} active> <i className='fa fa-stop' /> </ConfirmButton>
          </CardFooter>)
      case 'done':
      case 'cancel':
        return ('')
      default :
        return (
          <CardFooter>
            <ConfirmButton onCancel={() => this.setState({isEditing: false})} className='ml-3' size='sm' color={order.mode === 'buy' ? 'success' : 'danger'} onClick={() => this.updateOrder(order.id)} ><i className='fa fa-dot-circle-o' /> {order.mode.toUpperCase()}</ConfirmButton>
            <Button color='warning' size='sm' className='ml-3' onClick={() => this.waitingOrder(order.id)} active> <i className='fa fa-eye-slash' /> </Button>
            <Button color='success' size='sm' className='ml-3' onClick={() => this.resumeOrder(order.id)} active> <i className='fa fa-eye' /> </Button>
            <ConfirmButton onCancel={() => this.setState({isEditing: false})} color='danger' size='sm' className='ml-3' onClick={() => this.cancelOrder(order.id)} active> <i className='fa fa-stop' /> </ConfirmButton>
          </CardFooter>
        )
    }
  }
  _color (status) {
    switch (status) {
      case 'TEST':
      case 'watching':
        return 'success'
      case 'cancel':
      case 'REAL':
        return 'danger'
      case 'waiting':
        return 'warning'
      case 'done':
        return 'info'
      case 'hold':
        return 'secondary'
      default:
        return 'light'
    }
  }
  _renderInputItem (prependText, middle, append) {
    return (
      <FormGroup row>
        <Col xl='12'>
          <InputGroup>
            <InputGroupAddon addonType='prepend'>
              <InputGroupText>
                {prependText}
              </InputGroupText>
            </InputGroupAddon>
            {middle}
            { append
              ? (<InputGroupAddon addonType='append'>
                {append}
              </InputGroupAddon>) : ('')
            }
          </InputGroup>
        </Col>
      </FormGroup>
    )
  }
  _renderEdit (order) {
    if (order.status === 'done' || order.status === 'cancel') return ('')
    let offsetButtons = [1, 2, 3, 5, 10]
    return (
      <Row className='mt-3'>
        <Col xs='12' md='4' lg='4' xl='4'>
          {this._renderInputItem('REAL API', (
            <Button size='sm' className='ml-1' color={this._color(this.state.type)} onClick={() => this.setState({type: this.state.type === 'REAL' ? 'TEST' : 'REAL'})}>
              <i className={this.state.type === 'REAL' ? 'mr-1 fa fa-check-square-o' : 'mr-1 fa fa-square-o'} />
            </Button>
          ), null) }
          {this._renderInputItem('Quantity', (<Input type='number' id='quantity' placeholder='Enter quantity' required value={this.state.quantity} onChange={(event) => {
            let quantity = parseFloat(event.target.value)
            let total = (quantity * this.state.expect_price) || 0
            this.setState({quantity, total, isEditing: true})
          }} />), (<InputGroupText> {order.asset} </InputGroupText>))}

        </Col>
        <Col xs='12' md='4' lg='4' xl='4'>
          {this._renderInputItem('Offset', (<Input type='number' id='offset' placeholder='0' required value={this.state.offset} onChange={(event) => { this.setState({offset: event.target.value, isEditing: true}) }} />), (<InputGroupText> {order.currency} </InputGroupText>))}

          <FormGroup row>
            <Col xl='12'>
              <InputGroup>
                <Row>
                  { offsetButtons.map(offsetButton => (<Col xs='2' key={offsetButton}><Button size='sm' color={this.state.mode === 'buy' ? 'success' : 'danger'} active onClick={() => this.setState({offset: this.state.expect_price * offsetButton / 100})}> {offsetButton}% </Button></Col>)) }
                </Row>
              </InputGroup>
            </Col>
          </FormGroup>
        </Col>
        <Col xs='12' md='4' lg='4' xl='4'>

          {this._renderInputItem('Expect', (<Input type='number' id='price' placeholder='0' required value={this.state.expect_price} onChange={(event) => {
            let expectPrice = parseFloat(event.target.value)
            expectPrice = expectPrice > 0 ? expectPrice : 0
            let total = this.state.quantity * expectPrice
            this.setState({expect_price: expectPrice, total, isEditing: true})
          }} />), (<InputGroupText> {order.currency} </InputGroupText>))}

          {this._renderInputItem('Price', (<Input type='number' id='price' placeholder='0' required value={this.state.price} onChange={(event) => {
            let price = parseFloat(event.target.value)
            price = price > 0 ? price : 0
            this.setState({price: price, isEditing: true})
          }} />), (<InputGroupText> {order.currency} </InputGroupText>))}
        </Col>
      </Row>
    )
  }
  _renderItem (proporder) {
    let order = Utils.clone(proporder)
    let total = order.quantity * order.price
    let expectTotal = order.quantity * order.expect_price
    order.percent = Utils.formatNumber(total / expectTotal * 100 - 100)
    order.total = Utils.formatNumber(total)
    order.expectTotal = Utils.formatNumber(expectTotal)
    order.offset_percent = Utils.formatNumber(order.offset / order.expect_price * 100)
    if (this.props.isTable) {
      return (
        <tr onClick={() => this.props.toggle()}>
          <td><Badge color={'info'}> {order.id}</Badge></td>
          <td><Badge color={'info'}> {order.quantity} </Badge></td>
          <td><Badge color={'light'}> {order.asset} </Badge></td>
          <td><Badge color={'dark'}> {order.currency} </Badge></td>
          <td><Badge color={'light'}> {numeral(order.price).format(NUMFORMAT)} </Badge></td>
          <td><Badge color={'info'}> {order.offset} </Badge></td>
          <td><Badge color={(order.mode === 'buy' && order.percent <= 0) || (order.mode === 'sell' && order.percent >= 0) ? 'success' : 'danger'}> {order.percent}% </Badge></td>
          <td><Badge color={order.mode === 'buy' ? 'success' : 'danger'}> {order.mode} </Badge></td>
          <td><Badge color={order.type === 'TEST' ? 'success' : 'danger'}> {order.type}</Badge></td>
          <td><Badge color={order.balance_id > 0 ? 'primary' : 'secondary'}> {order.balance_id > 0 ? `Auto[${order.balance_id}]` : 'Manual'} </Badge></td>
          <td><Badge className='ml-3' color={this._color(order.status)}> {order.status} </Badge></td>
        </tr>
      )
    }
    return (
      <Col xs='12' xl='12' className='animated fadeIn' >
        <Card className={this.state.editing ? 'border-secondary' : ''}>
          <CardHeader onClick={() => this.props.toggle()}>

            <Badge color={'info'}> {order.id}</Badge>
            <Badge color={'info'}> {Utils.formatNumber(order.quantity)} </Badge>
            <Badge color={'light'}><img src={cryptoNames[order.asset]} style={{ height: 15, marginRight: 5}} alt='' />  {order.asset} </Badge>
            <Badge color={'dark'}> <img src={cryptoNames[order.currency]} style={{ height: 15,marginRight: 5}} alt='' /> {order.currency} </Badge>
            <Badge color={'light'}> {Utils.formatNumber(order.price)} </Badge>
            <Badge color={'info'}> {Utils.formatNumber(order.offset)} </Badge>
            <Badge color={(order.mode === 'buy' && order.percent <= 0) || (order.mode === 'sell' && order.percent >= 0) ? 'success' : 'danger'}> {order.percent}% </Badge>
            <Badge color={order.mode === 'buy' ? 'success' : 'danger'}> {order.mode} </Badge>
            <Badge color={order.type === 'TEST' ? 'success' : 'danger'}> {order.type}</Badge>
            <Badge color={order.balance_id > 0 ? 'primary' : 'secondary'}> {order.balance_id > 0 ? `Auto[${order.balance_id}]` : 'Manual'} </Badge>
            <Badge className='ml-3' color={this._color(order.status)}> {order.status} </Badge>
          </CardHeader>
          <Collapse isOpen={this.props.isOpen}>
            <CardBody >
              <Row>
                <Col xs='12' md='4' lg='4' xl='3' className='pr-1 pl-1'>
                  <Badge color={'info'}>ID:{order.id}</Badge>
                  {order.binance_order_id ? (<Badge color={'dark'}>BinanceID:{order.binance_order_id}</Badge>) : ('')}
                  <Badge color={order.balance_id > 0 ? 'primary' : 'secondary'}> {order.balance_id > 0 ? `Auto[${order.balance_id}]` : 'Manual'} </Badge>

                </Col>
                <Col xs='12' md='5' lg='5' xl='3' className='pr-1 pl-1'>
                  <Badge color={'light'}>Price Trigger:{Utils.formatNumber(order.price)} </Badge>
                  <Badge color={'dark'}>Expect:{Utils.formatNumber(order.expect_price)} </Badge>
                </Col>
                <Col xs='12' md='4' lg='3' xl='2' className='pr-1 pl-1'>
                  <Badge color={'info'}>{Utils.formatNumber(order.quantity)} </Badge>
                  <Badge color={'light'}>{order.asset} </Badge>
                </Col>
                <Col xs='12' md='3' lg='3' xl='2' className='pr-1 pl-1'>
                  <Badge color={'info'}>Offset:{Utils.formatNumber(order.offset)} </Badge>
                  <Badge color={'success'}>{Utils.formatNumber(order.offset_percent)}% </Badge>
                </Col>
                <Col xs='12' md='4' lg='4' xl='3' className='pr-1 pl-1'>
                  <Badge color={'light'}>Est Total:{ Utils.formatNumber(order.total)} </Badge>
                  <Badge color={'dark'}> {order.currency} </Badge>
                </Col>
                <Col xs='12' md='5' lg='5' xl='3' className='pr-1 pl-1'>
                  <Badge color={'dark'}>Est Expect:{ Utils.formatNumber(order.expectTotal)} </Badge>
                  <Badge color={'dark'}> {order.currency} </Badge>
                  <Badge color={(order.mode === 'buy' && order.percent <= 0) || (order.mode === 'sell' && order.percent >= 0) ? 'success' : 'danger'}> {order.percent}% </Badge>
                </Col>
                <Col xs='12' md='3' lg='3' xl='2' className='pr-1 pl-1'>
                  <Badge color={order.mode === 'buy' ? 'success' : 'danger'}> {order.mode} </Badge>
                  <Badge color={order.type === 'TEST' ? 'success' : 'danger'}> {order.type}</Badge>

                </Col>
                <Col xs='12' md='4' lg='4' xl='3' className='pr-1 pl-1'>
                  <Badge color={'light'}> {moment(order.updatedAt).format('MM/DD HH:mm')} </Badge>
                  <Badge color={this._color(order.status)}> {order.status} </Badge>
                </Col>
              </Row>
              {this._renderEdit(order)}

            </CardBody>
            { this._getButton(order) }
          </Collapse>
        </Card>
      </Col>
    )
  }
  render () {
    return this._renderItem(this.props.order)
  }
}

export default OpenOrderRow
