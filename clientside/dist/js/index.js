'use strict';

import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

import App from './modules/App'
import WhiteBoard from './modules/WhiteBoard'

// https://github.com/reactjs/react-router
render((
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <Route path="/whiteboard" component={WhiteBoard} />
        </Route>
    </Router>
), document.getElementById('app'))