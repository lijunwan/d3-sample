import React, { Component } from 'react';
import './index.css';
import { Link, Route, withRouter} from 'react-router-dom';
import {observer} from 'mobx-react';
import Test from './Test';
import Test2 from './Test2';
import ScrollBox from './ScrollBox';
@observer
export default class ScrollContent extends Component {
  componentDidMount() {
    console.log('=====');
  }
  render() {
    console.log('=====ScrollContent');
    return (
      <ScrollBox location={this.props.location}/>
    );
  }
}