import React, { Component } from 'react';
import './index.css';
import { Link, Route, withRouter} from 'react-router-dom';
import {observer} from 'mobx-react';
import Test from './Test';
import Test2 from './Test2';
import ScrollContent from './ScrollContent';
@observer
export default class ScrollTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      boxHeight: 0,
    }
  }
  componentDidMount() {
    this.setState({
      boxHeight: window.innerHeight
    });
  }
  render() {
    if (this.state.boxHeight) {
      return (
        <div>
          <div className="route-top">父组件</div>
          <div>
            <Link to="/scrollTest/test">test</Link> 
            <Link to="/scrollTest/test2">test2</Link> 
          </div>
          <ScrollContent loction={this.props.location}/>
        </div>
      );
    }
    return null;
  }
}