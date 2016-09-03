'use strict';
var _ = require('lodash');

// first of all get default config (variables not depend with env)
var defaults = require('./defaults');

// then detect env and require cfg for that env
var env = process.env.NODE_ENV || 'development';
var cfg = require('./'+env);

// end assign two cfgs
module.exports = _.assign(defaults, cfg);