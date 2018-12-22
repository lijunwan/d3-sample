import React, { Component } from 'react';
import './index.css';
import {Route} from 'react-router-dom';
import {observer} from 'mobx-react';
import Test from './Test';
import Test2 from './Test2';
@observer
export default class ScrollBox extends Component {
  render() {
    return (
      <div>
        <Route path="/scrollTest/test" component = {Test} />
        <Route path="/scrollTest/test2" component = {Test2}/>
      </div>
    );
  }
}