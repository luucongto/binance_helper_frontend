import React, { Component } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row,
  CardFooter,
  FormGroup,
  Input,
  Label,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Badge,
  Progress,
  Collapse
} from 'reactstrap'
import ConfirmButton from './ConfirmButton'
import {AppSwitch} from '@coreui/react'
import { connect } from 'react-redux'
import OpenOrdersActions from '../../../../Redux/OpenOrdersRedux'
import AccountInfoActions from '../../../../Redux/AccountInfoRedux'
import {PAIRS} from '../../../../Config/Const'
import SocketApi from '../../../../Services/SocketApi'
import Utils from '../../../../Utils/Utils'
import Alert from 'react-s-alert'
class PlaceOrder extends Component {
  constructor (props) {
    super(props)
    this.assets = this.assets.bind(this)
    this.currencies = this.currencies.bind(this)
    this.state = {
      show: false,
      quantity: 0,
      asset: this.assets('USDT')[0],
      currency: 'USDT',
      type: this.types()[0].value,
      offset: 0,
      price: 0,
      total: 0
    }
    this.props.requestAccount()
  }
  types () {
    return [{value: 'TEST', label: 'TEST'},
    {value: 'REAL', label: 'REAL'}]
  }
  assets (currency) {
    return PAIRS[currency].assets
  }

  currencies () {
    return Object.values(PAIRS)
  }
  placeOrder () {
    console.log(this.state)
    if (this.state.asset === this.state.currency) return
    if (this.state.expect_price <= 0 || this.state.quantity <= 0) return

    SocketApi.emit('update_order', {
      command: 'placeOrder',
      pair: this.state.asset + this.state.currency,
      asset: this.state.asset,
      currency: this.state.currency,
      price: 0,
      quantity: this.state.quantity,
      mode: this.props.mode,
      type: this.state.type,
      offset: this.state.offset,
      expect_price: this.state.expect_price
    })
    Alert.info(`Added Order ${this.state.type} ${this.props.mode} ${this.state.quantity}${this.state.asset} at ${this.state.expect_price}${this.state.currency}`, {
      position: 'bottom-right',
      effect: 'bouncyflip'
    })
  }
  resetOrder () {
    this.setState({
      quantity: 0,
      asset: this.assets('USDT')[0],
      currency: 'USDT',
      type: this.types()[0].value,
      price: 0,
      total: 0
    })
  }

  _renderInputItem (prependText, middle, append) {
    return (
      <FormGroup row>
        <Col xl='12'>
          <InputGroup>
            {
              prependText ? (<InputGroupAddon addonType='prepend'>
                <InputGroupText>
                  {prependText}
                </InputGroupText>
              </InputGroupAddon>) : ('')
            }
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
  render () {
    let assets = this.assets(this.state.currency)

    let currencies = this.currencies()
    let types = this.types()
    let offsetButtons = [1, 2, 3, 5, 10]
    let avaiBalance = 0
    let onOrderBalance = 0
    if (this.props.accountInfo) {
      let symbol = this.state.currency
      if (this.props.mode === 'sell') {
        symbol = this.state.asset
      }
      avaiBalance = Utils.formatNumber(parseFloat(this.props.accountInfo[symbol].available))
      onOrderBalance = Utils.formatNumber(parseFloat(this.props.accountInfo[symbol].onOrder))
    }
    return (
      <Col>
        <Card>
          <CardHeader onClick={() => this.setState({show: !this.state.show})}>
            <i className='fa fa-align-justify' /> {this.props.mode.toUpperCase()}
            <a className=' float-right mb-0 card-header-action btn btn-minimize'><i className={this.state.show ? 'icon-arrow-up' : 'icon-arrow-down'} /></a>
          </CardHeader>
          <Collapse isOpen={this.state.show}>
            <CardBody>
              <Row>
                <Col lg='12' md='12' xl='6'>
                  {this._renderInputItem(
                  'Quantity',
                  (<Input type='number' id='quantity' placeholder='Enter quantity' required value={this.state.quantity} onChange={(event) => {
                    let quantity = parseFloat(event.target.value)
                    let total = (quantity * this.state.expect_price) || 0
                    this.setState({quantity, total})
                  }}
                  />),
                  (<Input type='select' name='asset' id='asset' value={this.state.asset} onChange={(event) => this.setState({asset: event.target.value})}>
                    {
                        assets.map(e => <option key={e} value={e} >{e}</option>)
                      }
                  </Input>)
                )}

                  {this._renderInputItem(
                  'Offset',
                  (<Input type='number' id='price' placeholder='0' required value={this.state.offset} onChange={(event) => {
                    this.setState({offset: event.target.value})
                  }} />),
                  (<InputGroupText>
                    {this.state.currency}
                  </InputGroupText>)
                )}

                  <FormGroup row>
                    <Col xl='12'>
                      <InputGroup>
                        <Row>
                          {
                          offsetButtons.map(offsetButton => (
                            <Col xs='2' key={offsetButton}><Button size='sm' color={this.props.mode === 'buy' ? 'success' : 'danger'} active onClick={() => this.setState({offset: this.state.expect_price * offsetButton / 100})}> {offsetButton}% </Button></Col>
                          ))
                        }
                        </Row>
                      </InputGroup>
                    </Col>
                  </FormGroup>
                </Col>

                <Col>
                  {
                  this._renderInputItem(
                    'REAL API',
                    (
                      <AppSwitch className={'ml-1 mr-3 mb-0 mt-1'} label color={'success'} defaultChecked={this.state.type === 'REAL'} size={'sm'} onClick={() => this.setState({type: this.state.type === 'REAL' ? 'TEST' : 'REAL'})} />
                    ),
                    null
                  )
                }

                  {this._renderInputItem(
                  'Expect',
                  (<Input type='number' id='price' placeholder='0' required value={this.state.expect_price} onChange={(event) => {
                    let expectPrice = parseFloat(event.target.value)
                    expectPrice = expectPrice > 0 ? expectPrice : 0
                    let total = this.state.quantity * expectPrice
                    this.setState({expect_price: expectPrice, total})
                  }} />),
                  (<Input type='select' name='currency' id='currency' onChange={(event) => {
                    this.setState({currency: event.target.value, asset: this.assets(event.target.value)[0]})
                  }}>
                    {
                      currencies.map(e => <option key={e.value} value={e.value} >{e.label}</option>)
                    }
                  </Input>)
                )}

                  {this._renderInputItem(
                  'Total',
                  (<Input type='number' id='name' placeholder='Enter total' required value={this.state.total} onChange={(event) => {
                    try {
                      let total = parseFloat(event.target.value)
                      if (this.state.expect_price > 0) {
                        let quantity = total / this.state.expect_price
                        this.setState({total, quantity})
                      } else {
                        let price = total / this.state.quantity
                        this.setState({total, price})
                      }
                    } catch (e) {
                      console.log(e, event)
                    }
                  }} />),
                  (<InputGroupText>
                    {this.state.currency}
                  </InputGroupText>)
                )}
                  {this._renderInputItem(null, (<Badge color='light'>{this.props.mode === 'buy' ? this.state.currency : this.state.asset } Avai {avaiBalance}</Badge>), (<Badge color='dark'>OnOrder {onOrderBalance}</Badge>))}
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <Row>
                <ConfirmButton className='ml-3' size='l' color={this.props.mode === 'buy' ? 'success' : 'danger'} onClick={() => this.placeOrder()} ><i className='fa fa-dot-circle-o' /> {this.props.mode.toUpperCase()}</ConfirmButton>
                <Button className='ml-3' size='l' color='warning' onClick={() => this.resetOrder()}><i className='fa fa-ban' /> Reset</Button>
              </Row>
            </CardFooter>
          </Collapse>
        </Card>
      </Col>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    accountInfo: state.accountInfo.data
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    request: (params) => dispatch(OpenOrdersActions.openOrdersRequest(params)),
    requestAccount: () => dispatch(AccountInfoActions.accountInfoRequest())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceOrder)
