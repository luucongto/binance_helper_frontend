
import React, { Component } from 'react'
import { Badge, Card, CardBody, CardHeader, Col, Collapse, Row, FormGroup, InputGroupAddon, InputGroupText, InputGroup, Input } from 'reactstrap'
import SocketApi from '../../../../Services/SocketApi'
import Utils from '../../../../Utils/Utils'
import ConfirmButton from './ConfirmButton'
class AutoOrderRow extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pair: props.order ? props.order.pair : '',
      asset: props.order ? props.order.asset : '',
      currency: props.order ? props.order.currency : '',
      currency_num: props.order ? props.order.currency_num : 0,
      asset_num: props.order ? props.order.asset_num : 0,
      offset: props.order ? props.order.offset : 0,
      type: props.order ? props.order.type : '',
      status: props.order ? props.order.status : ''
    }
  }
  updateOrder (orderId) {
    SocketApi.emit('auto_order', {
      command: 'updateOrder',
      id: orderId,
      currency_num: this.state.currency_num,
      asset_num: this.state.asset_num,
      offset: this.state.offset,
      status: this.state.status
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
  _renderButtton (order) {
    let avai = (this.state.currency_num !== order.currency_num) ||
    (this.state.asset_num !== order.asset_num) ||
    (this.state.offset !== order.offset) ||
    (this.state.status !== order.status)
    return (
      <CardHeader>
        <Col xl='auto'>
          <ConfirmButton disabled={!avai} className='ml-3' size='sm' color={'danger'} onClick={() => this.updateOrder(order.id)} ><i className='fa fa-dot-circle-o' /> UPDATE </ConfirmButton>
        </Col>
      </CardHeader>
    )
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
    return (
      <Row className='mt-2'>
        <Col xl='6' >
          {this._renderInputItem('Balance', <Input type='number' value={this.state.currency_num} onChange={event => this.setState({currency_num: parseFloat(event.target.value)})} />, <InputGroupText>{this.state.currency}</InputGroupText>)}
        </Col>

        <Col xl='6' >
          {this._renderInputItem('Asset', <Input type='number' value={this.state.asset_num} onChange={event => this.setState({asset_num: parseFloat(event.target.value)})} />, <InputGroupText>{this.state.asset}</InputGroupText>)}
        </Col>

        <Col xl='6' >
          {this._renderInputItem('Offset', <Input type='number' value={this.state.offset} onChange={event => this.setState({offset: parseFloat(event.target.value)})} />)}
        </Col>
        <Col xl='6' >
          {this._renderInputItem('Status',
            <Input type='select' value={this.state.status} onChange={event => this.setState({status: event.target.value})}>
              <option value='waiting'>Waiting</option>
              <option value='watching'>Watching</option>
              <option value='cancel'>Cancel</option>
            </Input>
          )}
        </Col>
      </Row>
    )
  }
  _renderHeader (order) {
    return (
      <CardHeader onClick={() => this.props.toggle()}>
        <Badge color={'primary'}> {order.id} </Badge>
        <Badge color={'info'}> {order.currency_num > 10 ? order.currency_num.toFixed(2) : order.currency_num.toFixed(4)} </Badge>
        <Badge color={'light'}> {order.currency} </Badge>
        <Badge color={'info'}> {order.asset_num > 10 ? order.asset_num.toFixed(2) : order.asset_num.toFixed(4)} </Badge>
        <Badge color={'dark'}> {order.asset} </Badge>
        <Badge color={'dark'}> {order.offset} </Badge>
        <Badge color={order.offset_percent > 0 ? 'success' : 'danger'}> {order.offset_percent}% </Badge>
        <Badge color={'light'}> {order.estimate} </Badge>
        <Badge color={'dark'}> {order.initial_estimate}</Badge>
        <Badge color={order.initial_estimate_percent > 0 ? 'success' : 'danger'}> {order.initial_estimate_percent}% </Badge>
        <Badge color={this._color(order.type)}> {order.type} </Badge>
        <Badge color={this._color(order.status)}> {order.status} </Badge>
      </CardHeader>
    )
  }
  _renderBody (order) {
    return (<CardBody >
      <Row>
        <Col>
          <Badge color={'primary'}>ID {order.id} </Badge>
        </Col>
        <Col>
          <Badge color={'info'}>Balance {order.currency_num > 10 ? order.currency_num.toFixed(2) : order.currency_num.toFixed(4)} </Badge>
          <Badge color={'light'}> {order.currency} </Badge>
        </Col>
        <Col>
          <Badge color={'info'}>Asset {order.asset_num > 10 ? order.asset_num.toFixed(2) : order.asset_num.toFixed(4)} </Badge>
          <Badge color={'dark'}> {order.asset} </Badge>
        </Col>
        <Col>
          <Badge color={'dark'}>Offset {order.offset} </Badge>
          <Badge color={order.offset_percent > 0 ? 'success' : 'danger'}> {order.offset_percent}% </Badge>
        </Col>
        <Col>
          <Badge color={'light'}>Estimate {order.estimate} </Badge>
          <Badge color={'dark'}>{order.initial_estimate}</Badge>
          <Badge color={order.initial_estimate_percent > 0 ? 'success' : 'danger'}> {order.initial_estimate_percent}% </Badge>
        </Col>
        <Col>
          <Badge color={this._color(order.type)}> {order.type} </Badge>
          <Badge color={this._color(order.status)}> {order.status} </Badge>
        </Col>
      </Row>
      {this._renderEdit(order)}

    </CardBody>
    )
  }
  _renderItem (proporder) {
    return (
      <Col xs='12' xl='6' className='animated fadeIn' >
        <Card>
          {this._renderHeader(proporder)}
          <Collapse isOpen={this.props.isOpen}>
            {this._renderBody(proporder)}
            { this._renderButtton(proporder) }

          </Collapse>
        </Card>
      </Col>
    )
  }
  render () {
    return (this._renderItem(this.props.order)
    )
  }
}

export default AutoOrderRow
