import React, { Component } from 'react';
import RoutesApp from './routes';

class App extends Component {
  render() {
    console.log('---', this);
    return (
      <div>
        <li><a href="/network">网络图-聚焦</a></li>
        <li><a href="/shape">绘制方形节点</a></li>
        <RoutesApp />
      </div>
    );
  }
}

export default App;
