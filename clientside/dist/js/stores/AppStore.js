'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var AppConstants = require('../constants/AppConstants');
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _params = {};

/**
 * Create a value
 * @param  {string} value The content of the PARAM
 */
function create(key, value) {
    _params[key] = value;
}

/**
 * Update a value.
 * @param  {string} key
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update(key, updates) {
    _params[key] = assign({}, _params[key], updates);
}

/**
 * Update all of the PARAM items with the same object.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.
 */
function updateAll(updates) {
    for (var key in _params) {
        update(key, updates);
    }
}

/**
 * Delete a PARAM item.
 * @param  {string} key
 */
function destroy(key) {
    delete _params[key];
}

var AppStore = assign({}, EventEmitter.prototype, {

    /**
     * Get the entire collection of PARAMs.
     * @return {object}
     */
    getAll: function() {
        return _params;
    },

    getOne: function(key) {
        return _params[key] || false;
    },

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    /**
     * @param {function} callback
     */
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    /**
     * @param {function} callback
     */
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

// Register callback to handle all updates
AppDispatcher.register(function(action) {
    var value;

    switch (action.actionType) {
        case AppConstants.PARAM_CREATE:
            value = action.value.trim();
            if (value !== '') {
                create(action.key, value);
                AppStore.emitChange();
            }
            break;

        case AppConstants.PARAM_UPDATE_VALUE:
            value = action.value.trim();
            if (value !== '') {
                update(action.key, { value: value });
                AppStore.emitChange();
            }
            break;

        case AppConstants.PARAM_DESTROY:
            destroy(action.key);
            AppStore.emitChange();
            break;

        default:
            // no op
    }
});

module.exports = AppStore;
