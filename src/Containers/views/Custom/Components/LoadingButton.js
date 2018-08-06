import React, { Component } from 'react'
import {
  Button
} from 'reactstrap'

class LoadingButton extends Component {
  constructor (props) {
    super(props)
    this.state = {
      buttonState: 'init'
    }
    this.handeClick = this.handleClick.bind(this)
  }
  handleClick () {
    this.setState({buttonState: 'loading'})
    // make asynchronous call
    this.props.request().then(data => {
      this.props.handle(data)
      this.setState({buttonState: 'success'})
      setTimeout(() => {
        this.setState({buttonState: 'init'})
      }, 2000)
    }).catch(error => {
      this.setState({buttonState: 'error'})
      setTimeout(() => {
        this.setState({buttonState: 'init'})
      }, 2000)
    })
  }

  render (){
    if(this.state.buttonState === 'loading'){
      return (
        <Button className={this.props.className || ''} size={this.props.size || 'sm'} active color={this.props.color || 'success'}>
          <i className='fa fa-spinner fa-spin' />
        </Button>
      )
    } else if (this.state.buttonState === 'success') {
      return (
        <Button className={this.props.className || ''} size={this.props.size || 'sm'} active color={'success'}>
          <i className='fa fa-check' />
        </Button>)
    } else if(this.state.buttonState === 'error'){
      return (
        <Button className={this.props.className || ''} size={this.props.size || 'sm'} active color={'danger'}>
          <i className='fa fa-exclamation-circle' />
        </Button>
      )
    } else {
      return (<Button className={this.props.className || ''} size={this.props.size || 'sm'} active color={this.props.color || 'success'} onClick={() => this.handleClick()}>
        {this.props.children}
      </Button>)
    }
  }
}

export default LoadingButton
