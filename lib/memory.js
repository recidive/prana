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
var MemoryStorage = module.exports = function(settings) {
  this.settings = settings;

  // Data storage container.
  this.data = settings.data || {};
};

/**
 * List stored items.
 *
 * @param {Object} query Optional query object.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryStorage.prototype.list = function(query, callback) {
  // Allow filtering by key.
  if (typeof query === 'object' && query[this.settings.keyProperty] !== undefined) {
    var key = query[this.settings.keyProperty];
    var result = {};
    result[key] = this.data[key];
    return callback(null, result);
  }

  // Otherwise list all items.
  callback(null, this.data);
};

/**
 * Load a stored item.
 *
 * @todo Move this to a abstract class Storage. Using list and returning first
 *   item found.
 * @param {String} key Item key to search for.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryStorage.prototype.load = function(key, callback) {
  var keyProperty = this.settings.keyProperty;
  var query = {};
  query[keyProperty] = key;

  // We use the list method here so other storage engines can extend the Memory
  // Storage implement the list and benefit from this.
  var result = this.list(query, function(err, items) {
    callback(null, items[key]);
  });
};

/**
 * Save a item.
 *
 * @param {Object} item Object representing the item.
 * @param {Function} callback Function to run when data is saved.
 */
MemoryStorage.prototype.save = function(item, callback) {
  var keyProperty = this.settings.keyProperty;
  this.data[item[keyProperty]] = item;
  callback(null, item);
};

/**
 * Delete a item.
 *
 * @param {String} key Item key to search for.
 * @param {Function} callback Function to run when data is deleted.
 */
MemoryStorage.prototype.delete = function(key, callback) {
  var item = this.data[key];
  delete this.data[key];
  callback(null, item);
};
