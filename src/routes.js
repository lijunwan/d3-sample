import React from 'react';
import {Route} from 'react-router-dom';
import Network from './components/Network';
import Shape from './components/Shape';
import App from './App';

export default () => {
    return (
        <div>
             <Route path="/network" component={ Network }/>
             <Route path="/shape" component={ Shape }/>
        </div>
    );
}