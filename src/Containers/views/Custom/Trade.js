import React, { Component } from 'react'
import {Row, Col, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap'
import classnames from 'classnames';
import LivePrice from './Components/LivePrice'
import AutoOrders from './Components/AutoOrders'
import OpenOrders from './Components/OpenOrders'
import PlaceOrder from './Components/PlaceOrder'
import PlaceBotOrder from './Components/PlaceBotOrder'
class Trade extends Component {
  constructor(props){
    super(props)
    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1',
    };
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }
  render () {
    return (
      <div className='animated fadeIn'>
        <Row>
          <Col xl='6' md='12'>
            <LivePrice />
          </Col>
          <Col>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggle('1'); }}
                >
                  BUY
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggle('2'); }}
                >
                  SELL
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '3' })}
                  onClick={() => { this.toggle('3'); }}
                >
                  AUTO
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <PlaceOrder mode='buy' />
              </TabPane>
              <TabPane tabId="2">
                <PlaceOrder mode='sell' />
              </TabPane>
              <TabPane tabId="3">
                <PlaceBotOrder />
              </TabPane>
            </TabContent>
          </Col>
        </Row>
        <OpenOrders />
        <AutoOrders />
      </div>

    )
  }
}

export default Trade
