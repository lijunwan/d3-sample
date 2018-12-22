import React from 'react';
import Route from './modules/Route';
import NetworkWrap from './components/NetworkWrap';
import Shape from './components/Shape';
import LinkNetwork from './components/LinkNetwork';
import Cluster from './components/Cluster';
import App from './App';
import ScrollTest from './components/routeDemo/ScrollTest';
import RectNetwork from './components/RectNetwork';
import SupplyNetwork from './components/SupplyNetwork';

export default () => {
    return (
        <div>
            <Route path="/baseNetwork" component={ NetworkWrap }/>
            <Route path="/supplyNetwork" component={ SupplyNetwork }/>
            <Route path="/shape" component = {Shape}/>
            <Route path="/linkNetwork" component={ LinkNetwork }/>
            <Route path="/cluster" component={ Cluster }/>
            <Route path="/scrollTest" component={ ScrollTest }/>
            <Route path="/rectNetwork" component={ RectNetwork }/>
            <Route path="/rectNetwork" component={ RectNetwork }/>
        </div>
    );
}