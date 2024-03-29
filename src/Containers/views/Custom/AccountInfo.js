import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Col, Row, Table, Progress } from 'reactstrap'
import { connect } from 'react-redux'
import AccountInfoActions from '../../../Redux/AccountInfoRedux'
import ApiKeySetting from './Components/ApiKeySetting'
import Alert from 'react-s-alert'
import cryptoNames from './crypto.json'
var numeral = require('numeral')

class AccountInfo extends Component {
  constructor (props) {
    super(props)
    this.props.request()
  }
  componentWillReceiveProps (props) {
    if (props.error) {
      Alert.error(props.error, {
        position: 'bottom-right',
        effect: 'bouncyflip'
      })
    }
  }
  _renderBalance (element) {
    const NUMFORMAT = '0,0[.][0000]'
    var available = numeral(this.props.accountInfo[element].available).format(NUMFORMAT)
    var onOrder = numeral(this.props.accountInfo[element].onOrder).format(NUMFORMAT)
    var total = numeral(parseFloat(this.props.accountInfo[element].onOrder) + parseFloat(this.props.accountInfo[element].available)).format(NUMFORMAT)
    var est = numeral(parseFloat(this.props.accountInfo[element].usdtValue)).format(NUMFORMAT)
    return (
      <tr key={element} >
        <td>
          <img src={cryptoNames[element]} style={{width: 15, marginRight: 10}} alt='' />
          {element}
        </td>
        <td>{available}</td>
        <td>{onOrder}</td>
        <td>{total}</td>
        <td>{est}</td>
      </tr>
    )
  }
  render () {
    let balances = this.props.accountInfo ? Object.keys(this.props.accountInfo).filter(e => parseFloat(this.props.accountInfo[e].available) + parseFloat(this.props.accountInfo[e].onOrder) > 0) : []
    let totalUsdt = 0
    if (this.props.accountInfo) {
      Object.keys(this.props.accountInfo).forEach(element => {
        totalUsdt += parseFloat(this.props.accountInfo[element].usdtValue)
      })
      const NUMFORMAT = '0,0[.][00]'
      totalUsdt = numeral(totalUsdt).format(NUMFORMAT)
    }

    return this.props.fetching ? (<Progress animated color='danger' value='100' />)
      : (
        <div className='animated fadeIn'>
          <Row>
            <ApiKeySetting />
          </Row>
          <Row>
            <Col>
              <Card>
                <CardHeader>
                  <i className='fa fa-align-justify' /> {totalUsdt}
                </CardHeader>
                <CardBody>
                  <Table hover bordered striped responsive size='sm'>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Free</th>
                        <th>Locked</th>
                        <th>Total</th>
                        <th>EST</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        balances.map(element => this._renderBalance(element))
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
    fetching: state.accountInfo.fetching,
    error: state.accountInfo.error
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    request: () => dispatch(AccountInfoActions.accountInfoRequest())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountInfo)
