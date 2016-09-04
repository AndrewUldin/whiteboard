'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher');
var AppConstants = require('../constants/AppConstants');

var ParamActions = {

    /**
     * @param  {string} value
     */
    create: function(key, value) {
        AppDispatcher.dispatch({
            actionType: AppConstants.PARAM_CREATE,
            key: key,
            value: value
        });
    },

    /**
     * @param  {string} key The ID of the ToDo item
     * @param  {string} value
     */
    updateText: function(key, value) {
        AppDispatcher.dispatch({
            actionType: AppConstants.PARAM_UPDATE_VALUE,
            key: key,
            value: value
        });
    },

    /**
     * @param  {string} key
     */
    destroy: function(key) {
        AppDispatcher.dispatch({
            actionType: AppConstants.PARAM_DESTROY,
            key: key
        });
    }

};

module.exports = ParamActions;
