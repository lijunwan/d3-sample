import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import Router from './modules/Router';
import Route from './modules/Route';
import  {clientCreateStore} from './stores';
import {Provider} from 'mobx-react';
import { Modal } from 'antd';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { createBrowserHistory } from 'history';
// import ScrollToTop from './components/common/ScrollToTop';
// const getConfirmation = (message, callback)=>{
//   Modal.confirm({
//     title: '消息确认',
//     content: message,
//     onOk(){
//       callback(true);
//     },
//   })
 
// }
const allStore = clientCreateStore();
const routingStore = new RouterStore();
const history = syncHistoryWithStore(createBrowserHistory(), routingStore);
allStore.routing = routingStore;
// allStore.routing.loction = window.location;
ReactDOM.render(
  <Provider {...allStore}>
    <Router history={history}>
      <Route path="/" component={App}></Route>
    </Router>
  </Provider>
  , document.getElementById('root'));
registerServiceWorker();
