import React, { Component } from 'react'
import { Row } from 'reactstrap'
import PropTypes from 'prop-types'
class InfiniteScrollList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 0,
      items: [],
      hasMore: true,
      fetchScroll: false
    }

    this.onScroll = this.onScroll.bind(this)
  }
  _renderList (items) {
    return items.map((item, index) => this.props.renderItem(item, index))
  }
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll, false)
    if (this.props.items && Object.values(this.props.items).length) {
      this._fetchMoreData(true)
    }
  }
  componentWillReceiveProps (props) {
    if (props.items && Object.values(props.items).length) {
      this._fetchMoreData(true)
    }
  }
  componentWillUnMount () {
    window.removeEventListener('scroll', this.onScroll, false)
    clearTimeout(this.fetchTimeoutHandle)
  }
  onScroll () {
    if (
      (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) &&
      this.state.hasMore
    ) {
      this._fetchMoreData()
    }
  }
  _fetchMoreData (init = false) {
    if (this.state.fetchScroll) return
    this.setState({fetchScroll: true})
    let self = this
    this.fetchTimeoutHandle = setTimeout(() => {
      let {items, hasMore} = self.props.fetchData(this.state.items, init)
      this.setState({fetchScroll: false, items: items, hasMore: hasMore})
    }, 300)
  }
  render () {
    return this._renderList(this.state.items)
  }
}
InfiniteScrollList.propTypes = {
  renderItem: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired
}
export default InfiniteScrollList
