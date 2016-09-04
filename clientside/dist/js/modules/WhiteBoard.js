'use strict';
import React from 'react'
import AppStore from '../stores/AppStore';
import AppActions from '../actions/AppActions';
import Canvas from './canvas';

function getAppState() {
    return {
        params: AppStore.getAll()
    };
}

export default React.createClass({

    getInitialState: function() {
        return getAppState();
    },

    componentDidMount: function() {
        if (!this.state.params.key)
            this.redirectHandle();

        AppStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        AppStore.removeChangeListener(this._onChange);
    },

    _onChange: function() {
        this.setState(getAppState());
    },

    contextTypes: {
        router: React.PropTypes.object
    },

    render() {
        return (
            <div className="whiteboard">
                <div className="control-panel">
                    <div className="control-panel__current-room">You current room is <strong>{this.state.params.key}</strong>. <a href='/' onClick={this.redirectHandle}>Quit.</a></div>
                    <div className="control-panel__buttons">
                        <input type="button" value="Clear board" className="action-button control-panel__clear" onClick={this.clearHandler} />
                    </div>
                </div>
                <Canvas room={this.state.params.key} ref="canvas"/>
            </div>
        )
    },

    redirectHandle: function(e) {
        AppActions.destroy('key');
        this.context.router.push('/');
        return false;
    },

    clearHandler: function() {
        this.refs['canvas'].clearBoard();
    }

})