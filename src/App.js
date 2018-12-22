import React, { Component } from 'react';
import Routes from './routes';
import Route from './modules/Route';
import { NavLink, Switch} from 'react-router-dom';
import './App.css';
import {observer} from 'mobx-react';
import NetworkWrap from './components/NetworkWrap';
import Shape from './components/Shape';
import LinkNetwork from './components/LinkNetwork';
import Cluster from './components/Cluster';
import ScrollTest from './components/routeDemo/ScrollTest';
import RectNetwork from './components/RectNetwork';
import SupplyNetwork from './components/SupplyNetwork';
@observer
class App extends Component {
  handle(match, loaction) {
    return match;
  }
  componentDidMount() {
    console.log('App DidMount');
  }
  render() {
    return (
      <div>
        <li><NavLink isActive={this.handle} activeStyle={{color: '#cc00cc'}} to="/baseNetwork">网络图-收起展开</NavLink></li>
        <li><NavLink isActive={this.handle} to="/supplyNetwork">网络图-供应链</NavLink></li>
        <li><NavLink isActive={this.handle} activeClassName='linkAct' to="/shape">网络图-聚焦</NavLink></li>
        <li><NavLink isActive={this.handle} activeClassName='linkAct' to="/linkNetwork">网络图-链条图</NavLink></li>
        <li><NavLink isActive={this.handle} activeClassName='linkAct' to="/rectNetwork">网络图矩形节点</NavLink></li>
        <li><NavLink isActive={this.handle} activeClassName='linkAct' to="/cluster/">树型结构图</NavLink></li>
        <li><NavLink isActive={this.handle} activeClassName='linkAct' to="/scrollTest">滚动条恢复</NavLink></li>
        <Route path="/baseNetwork" component={ NetworkWrap } />
        <Route path="/supplyNetwork" component={ SupplyNetwork } />
        <Route path="/shape" component = {Shape} />
        <Route path="/linkNetwork" component={ LinkNetwork } />
        <Route path="/cluster" component={ Cluster } />
        <Route path="/scrollTest" component={ ScrollTest } />
        <Route path="/rectNetwork" component={ RectNetwork } />
      </div>
    );
  }
}

export default App;
