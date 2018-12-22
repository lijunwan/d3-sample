import React, { Component } from 'react';
import './index.css';
import { Link, Route} from 'react-router-dom';
import {observer} from 'mobx-react';
@observer
export default class Test extends Component {
  render() {
    return (
      <div>
        <div className="route-top">内容1</div>
        <div className="route-top">内容1</div>
      </div>
    );
  }
}