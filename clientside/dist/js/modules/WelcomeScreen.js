'use strict';
import React from 'react'
import AppStore from '../stores/AppStore';
import AppActions from '../actions/AppActions';

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
            <div className="welcome">
                <div className="welcome__title">SuperWhiteBoard</div>
                <div className="welcome__form welcome-form">
                    <div className="welcome-form__title">Do you have access key?</div>
                    <div className="welcome-form__inputs">
                        <input className="welcome-form__input-key" type="text" placeholder="123672" value={this.props.key} onChange={this.handleChange} onKeyUp={this.handleKeyUp} />
                        <input className="welcome-form__input-enter action-button" type="submit" value="Enter" onClick={this.handleEnter} />
                    </div>
                </div>
            </div>
        )
    },

    handleEnter() {
        this.context.router.push('/whiteboard');
    },

    handleChange: function(event) {
        AppActions.create('key', event.target.value);
    },

    handleKeyUp: function(event) {
        if (event.keyCode == 13) {
            AppActions.create('key', event.target.value);
            this.handleEnter();
        }
    }
})