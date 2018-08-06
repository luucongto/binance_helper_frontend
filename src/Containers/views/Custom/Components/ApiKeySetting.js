import React, { Component } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row,
  CardFooter,
  FormGroup,
  Input,
  Label,
  Progress
} from 'reactstrap'
import { connect } from 'react-redux'
import ApiSettingActions from '../../../../Redux/ApiSettingRedux'
import Alert from 'react-s-alert'

class ApiKeySetting extends Component {
  constructor (props) {
    super(props)
    this.state = {
      apiKey: '',
      apiSecret: ''
    }
  }
  update () {
    this.props.request({
      apiKey: this.state.apiKey,
      apiSecret: this.state.apiSecret
    })
  }
  reset () {
    this.setState({
      apiKey: '',
      apiSecret: ''
    })
  }
  componentWillReceiveProps (props) {
    if (this.props.fetching && props.data && props.data.success) {
      Alert.info('Updated', {
        position: 'bottom-right',
        effect: 'bouncyflip',
        timeout: 'none'
      })
      this.reset()
    }
    if (props.error) {
      Alert.error(props.error, {
        position: 'bottom-right',
        effect: 'bouncyflip'
      })
    }
  }
  render () {
    return this.props.fetching ? (<Progress animated color='danger' value='100' />)
      : (
        <Col xs='12'>
          <Card>
            <CardHeader>
              <i className='fa fa-align-justify' /> Api Settings}
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs='12'>
                  <FormGroup>
                    <Label htmlFor='name'>Api Key</Label>
                    <Input type='text' id='apiKey' placeholder='No Change' required value={this.state.apiKey} onChange={(event) => {
                      this.setState({apiKey: event.target.value})
                    }} />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs='12'>
                  <FormGroup>
                    <Label htmlFor='name'>Api Secret</Label>
                    <Input type='text' id='apiSecret' placeholder='No Change' required value={this.state.apiSecret} onChange={(event) => {
                      this.setState({apiSecret: event.target.value})
                    }} />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
            <CardFooter>
              <Button size='l' color='success' onClick={() => this.update()} ><i className='fa fa-dot-circle-o' /> Update </Button>
              <Button size='l' color='danger' onClick={() => this.reset()}><i className='fa fa-ban' /> Reset</Button>
              {

              }
            </CardFooter>
          </Card>
        </Col>
      )
  }
}
const mapStateToProps = (state) => {
  return {
    data: state.apiSetting.data,
    fetching: state.apiSetting.fetching,
    error: state.apiSetting.error
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    request: (params) => dispatch(ApiSettingActions.apiSettingRequest(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ApiKeySetting)
