'use strict';
import React from 'react'
import WelcomeScreen from './WelcomeScreen'

export default React.createClass({
  render() {
    return (
      <div className="scene">
        {this.props.children || <WelcomeScreen/>}
      </div>
    )
  }
})