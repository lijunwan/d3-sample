import React, { Component } from 'react';
import RoutesApp from './routes';

class App extends Component {
  render() {
    return (
      <div>
        <li><a href="/baseNetwork">网络图-收起展开</a></li>
        <li><a href="/shape">网络图-聚焦</a></li>
        <li><a href="/linkNetwork">网络图-链条图</a></li>
        <li><a href="/cluster">树型结构图</a></li>
        <RoutesApp />
      </div>
    );
  }
}

export default App;
