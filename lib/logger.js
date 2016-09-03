var config = require('../config');
var loggin = require('loggin').getLogger(require('../package').name);
var _ = require('lodash');

module.exports = loggin.conf(_.assign(config.loggin, {
    handlers: {
        console: {
            Class: 'loggin/core/handlers/stream-handler',
            layout: 'spec',
            kwargs: { stream: process.stdout }
        }
    },

    layouts: {
        spec: {
            Class: 'loggin/core/layouts/colored',
            record: 'regular',
            kwargs: {
                template: '%(date)s %(level)s %(message)s\n',
                dateFormat: '%H:%M:%S'
            }
        }
    }
}));