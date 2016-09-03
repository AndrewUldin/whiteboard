'use strict';

module.exports = class WelcomeScreen extends React.Component {
    constructor(props, container) {
        super(props);
        this.props = props;
        this.props.currentRegion = false;
        this.props.toggled = false;
        this.container = container;
        this.render();
    }

    render() {
        var self = this;
        ReactDOM.render(
            <div className="welcome">
                HERE WE GO
            </div>,
            this.container
        );
    }

    destroy() {
        ReactDOM.unmountComponentAtNode(this.container);
    }

}