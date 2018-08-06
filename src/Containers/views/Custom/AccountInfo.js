import React, { Component } from 'react'
import { Card, CardBody, CardHeader, Col, Row, Table, Progress } from 'reactstrap'
import { connect } from 'react-redux'
import AccountInfoActions from '../../../Redux/AccountInfoRedux'
import ApiKeySetting from './Components/ApiKeySetting'
import Alert from 'react-s-alert'
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
  render () {
    let balances = this.props.accountInfo ? Object.keys(this.props.accountInfo).filter(e => parseFloat(this.props.accountInfo[e].available) + parseFloat(this.props.accountInfo[e].onOrder) > 0) : []
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
                  <i className='fa fa-align-justify' /> Combined All Table
                </CardHeader>
                <CardBody>
                  <Table hover bordered striped responsive size='sm'>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Free</th>
                        <th>Locked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        balances.map(element => {
                          return (
                            <tr key={element} >
                              <td>{element}</td>
                              <td>{this.props.accountInfo[element].available}</td>
                              <td>{this.props.accountInfo[element].onOrder}</td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </Table>
                  {/* <nav>
                  <Pagination>
                    <PaginationItem><PaginationLink previous tag='button'>Prev</PaginationLink></PaginationItem>
                    <PaginationItem active>
                      <PaginationLink tag='button'>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem><PaginationLink tag='button'>2</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink tag='button'>3</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink tag='button'>4</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink next tag='button'>Next</PaginationLink></PaginationItem>
                  </Pagination>
                </nav> */}
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
