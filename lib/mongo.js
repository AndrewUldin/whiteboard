'use strict';

var config = require('../config');
var Promise = require('bluebird');
var MongoDB = Promise.promisifyAll(require('mongodb'));
var MongoClient = Promise.promisifyAll(MongoDB.MongoClient);
var log = require('./logger');
var db = undefined;

function getDB() {
    return db = db || MongoClient.connectAsync(process.env.MONGODB_URI || config.mongodb.host);
}

function getCollection(name) {
    return getDB().then(function (db) {
        return db.collectionAsync(name);
    })
}

exports.read = function (collectionName, query, order) {
    return getCollection(collectionName)
        .then(function (collection) {
            return collection.findAsync({ $query: query, $orderby: order}).then(function (cursor) {
                return cursor.toArrayAsync();
            });
        });
};

exports.upsert = function (collectionName, query, val) {
    return getCollection(collectionName)
        .then(function (collection) {
            return collection.updateAsync(query, val, { upsert: true })
        });
};

exports.put = function (collectionName, val) {
    val.timestamp = new Date().toISOString();
    return getCollection(collectionName)
        .then(function (collection) {
            return collection.insertAsync(val)
        });
};

exports.remove = function (collectionName, query) {
    return getCollection(collectionName)
        .then(function (collection) {
            return collection.removeAsync(query)
        });
};