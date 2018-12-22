import React, { Component, PropTypes} from 'react';
import {observer, inject} from 'mobx-react';
import Network from './Network';
@inject('networkStore')
@observer
export default class NetworkWrap extends Component {
  componentDidMount(){
    // this.props.networkStore.getNetwork();
  }
  render() {
    return <Network />
  }
}