/*
 * Prana Memory Storage.
 */

/*
 * Module dependencies.
 */
var utils = require('./utils');

/**
 * Memory Storage constructor.
 *
 * @constructor
 * @param {Object} settings Storage settings.
 */
var MemoryStorage = module.exports = function(application, settings) {
  this.application = application;
  this.settings = settings || {};

  // Data storage container.
  this.data = this.settings.data || {};
};

/**
 * List stored items.
 *
 * @param {Type} type Type object.
 * @param {Object} query Optional query object.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryStorage.prototype.list = function(type, query, callback) {
  if (!this.data[type.name]) {
    return callback(null, {});
  }

  // Allow filtering by key.
  if (typeof query === 'object' && query[type.settings.keyProperty] !== undefined) {
    var key = query[type.settings.keyProperty];
    var result = {};
    result[key] = this.data[type.name][key];
    return callback(null, result);
  }

  // Otherwise list all items.
  callback(null, this.data[type.name]);
};

/**
 * Load a stored item.
 *
 * @todo Move this to a abstract class Storage.
 *
 * @param {Type} type Type object.
 * @param {String} key Item key to search for.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryStorage.prototype.load = function(type, key, callback) {
  var query = {};
  query[type.settings.keyProperty] = key;

  // We use the list method here so other storage engines can extend the Memory
  // Storage implement the list and benefit from this.
  var result = this.list(type, query, function(err, items) {
    callback(null, items[key]);
  });
};

/**
 * Save a item.
 *
 * @param {Type} type Type object.
 * @param {Object} item Object representing the item.
 * @param {Function} callback Function to run when data is saved.
 */
MemoryStorage.prototype.save = function(type, item, callback) {
  // Initialize container for this type.
  this.data[type.name] = this.data[type.name] || {};
  this.data[type.name][item[type.settings.keyProperty]] = item;
  callback(null, item);
};

/**
 * Delete a item.
 *
 * @param {Type} type Type object.
 * @param {String} key Item key to search for.
 * @param {Function} callback Function to run when data is deleted.
 */
MemoryStorage.prototype.delete = function(type, key, callback) {
  var item = this.data[type.name][key];
  delete this.data[type.name][key];
  callback(null, item);
};
