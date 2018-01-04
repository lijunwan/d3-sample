import React from 'react';
import {Route} from 'react-router-dom';
import Network from './components/Network';
import Shape from './components/Shape';
import LinkNetwork from './components/LinkNetwork';
import Cluster from './components/Cluster';
import App from './App';

export default () => {
    return (
        <div>
             <Route path="/baseNetwork" component={ Network }/>
             <Route path="/shape" component={ Shape }/>
             <Route path="/linkNetwork" component={ LinkNetwork }/>
             <Route path="/cluster" component={ Cluster }/>
        </div>
    );
}