import React, { Component } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row,
  CardFooter,
  FormGroup,
  Input,
  Label,
  Progress
} from 'reactstrap'

class ConfirmButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isConfirming: false
    }
  }
  cancel () {
    this.setState({isConfirming: false})
    if(this.props.onCancel){
        this.props.onCancel()
    }
  }
  click () {
    if (this.state.isConfirming) {
      this.cancel()
      this.props.onClick()
    } else {
      this.setState({isConfirming: true})
      setTimeout(this.cancel.bind(this), 5000)
    }
  }

  render () {
    if (this.state.isConfirming) {
      return (
        <a className='mb-0 card-header-action btn btn-minimize' >
          <Button size={this.props.size || 'sm'} active color='danger' onClick={() => this.cancel()}>
            <i className='fa fa-ban' />
          </Button>
          <Button className='ml-2' size={this.props.size || 'sm'} active color='success' onClick={() => this.click()}>
            <i className='fa fa-check' />
          </Button>
        </a>
      )
    } else {
      return (
        <Button className={this.props.className || ''} size={this.props.size || 'sm'} active color={this.props.color || 'success'} onClick={() => this.click()} disabled={this.props.disabled}>
          {this.props.children}
        </Button>
      )
    }
  }
}

export default ConfirmButton
