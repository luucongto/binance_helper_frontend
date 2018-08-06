import React, { Component } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row,
  CardFooter,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Collapse
} from 'reactstrap'
import ConfirmButton from './ConfirmButton'
import LoadingButton from './LoadingButton'
import {AppSwitch} from '@coreui/react'
import { connect } from 'react-redux'
import OpenOrdersActions from '../../../../Redux/OpenOrdersRedux'
import {PAIRS} from '../../../../Config/Const'
import SocketApi from '../../../../Services/SocketApi'
import Alert from 'react-s-alert'
import api from '../../../../Services/Api'
class PlaceBotOrder extends Component {
  constructor (props) {
    super(props)
    this.assets = this.assets.bind(this)
    this.currencies = this.currencies.bind(this)
    this.state = {
      show: false,
      asset: this.assets('USDT')[0],
      currency: 'USDT',
      type: this.types()[0].value,
      offset: 0,
      currency_num: 0,
      asset_num: 0
    }
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
    if (this.state.asset === this.state.currency) return
    if (this.state.offset <= 0) return
    SocketApi.emit('auto_order', {
      command: 'placeOrder',
      pair: this.state.asset + this.state.currency,
      asset: this.state.asset,
      currency: this.state.currency,
      currency_num: this.state.currency_num,
      asset_num: this.state.asset_num,
      type: this.state.type,
      offset: this.state.offset
    })
    Alert.info(`Added Auto Order ${this.state.currency_num}${this.state.currency} / ${this.state.asset_num + this.state.asset} ~ ${this.state.offset}`, {
      position: 'bottom-right',
      effect: 'bouncyflip'
    })
  }
  resetOrder () {
    this.setState({
      asset: this.assets('USDT')[0],
      currency: 'USDT',
      type: this.types()[0].value,
      offset: 0,
      currency_num: 0,
      asset_num: 0
    })
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

  render () {
    let assets = this.assets(this.state.currency)

    let currencies = this.currencies()
    let types = this.types()
    let offsetButtons = [1, 2, 3, 5, 10]
    return (
      <Col>
        <Card>
          <CardHeader onClick={() => this.setState({show: !this.state.show})}>
            <i className='fa fa-align-justify' /> Add Auto (test)
            <a className=' float-right mb-0 card-header-action btn btn-minimize'><i className={this.state.show ? 'icon-arrow-up' : 'icon-arrow-down'} /></a>
          </CardHeader>
          <Collapse isOpen={this.state.show}>
            <CardBody>
              <Row>
                <Col lg='12' md='12' xl='6'>
                  {
                  this._renderInputItem(
                    'Balance',
                    (<Input type='number' id='currency_num' placeholder='Enter currency num' required value={this.state.currency_num} onChange={(event) => {
                      let currency_num = parseFloat(event.target.value)
                      this.setState({currency_num})
                    }} />),
                    (<Input type='select' name='currency' id='currency' onChange={(event) => {
                      this.setState({currency: event.target.value, asset: this.assets(event.target.value)[0]})
                    }}>
                      {
                        currencies.map(e => <option key={e.value} value={e.value} >{e.label}</option>)
                      }
                    </Input>)
                  )
                }
                  {
                  this._renderInputItem(
                    'Offset',
                    (<Input type='number' id='price' placeholder='0' required value={this.state.offset} onChange={(event) => {
                      this.setState({offset: event.target.value})
                    }} />),
                    (<InputGroupText>
                      {this.state.currency}
                    </InputGroupText>)
                  )
                }

                  <FormGroup row>
                    <Col xl='12'>
                      <InputGroup>
                        <Row>
                          {
                          offsetButtons.map(offsetButton => (
                            <Col xs='2' key={offsetButton}>
                              <LoadingButton
                                size='sm' color={this.props.mode === 'buy' ? 'success' : 'danger'} 
                                request={() => api.getPrices()}
                                handle={(prices) => {
                                  let livePrice = parseFloat(prices[this.state.asset + this.state.currency] || 0)
                                  this.setState({offset: livePrice * offsetButton / 100})
                                }}
                              >
                                {offsetButton}%
                              </LoadingButton>
                            </Col>
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
                    'Asset',
                    (<Input type='number' id='price' placeholder='0' required value={this.state.asset_num} onChange={(event) => {
                      let assetNum = parseFloat(event.target.value)
                      this.setState({assetNum})
                    }} />),
                    (<Input type='select' name='asset' id='asset' value={this.state.asset} onChange={(event) => this.setState({asset: event.target.value})}>
                      {
                      assets.map(e => <option key={e} value={e} >{e}</option>)
                    }
                    </Input>)
                  )
                }
                  {
                  this._renderInputItem(
                    'REAL API',
                    (
                      <AppSwitch className={'ml-1 mr-3 mb-0 mt-1'} label color={'success'} defaultChecked={this.state.type === 'REAL'} size={'sm'} onClick={() => this.setState({type: this.state.type === 'REAL' ? 'TEST' : 'REAL'})} />
                    ),
                    null
                  )
                }
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <Row>
                <ConfirmButton className='ml-3' size='l' color='success' onClick={() => this.placeOrder()} ><i className='fa fa-dot-circle-o' /> Add </ConfirmButton>
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
    livePricePairs: state.livePrice.data
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    request: (params) => dispatch(OpenOrdersActions.openOrdersRequest(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlaceBotOrder)
