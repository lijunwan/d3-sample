import React, { Component } from 'react';
import './index.css';
import {observer} from 'mobx-react';
@observer
export default class Test2 extends Component {
  render() {
    return (
      <div>
        <div className="route-top">内容2</div>
        <div className="route-top">内容2</div>
      </div>
    );
  }
}