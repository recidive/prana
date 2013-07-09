/*
 * Prana memory storage.
 */

/*
 * Module dependencies.
 */
var utils = require('./utils');

/**
 * Memory Storage constructor.
 *
 * @constructor
 * @param {Object} settings Storage settings, not being used.
 */
var MemoryStorage = module.exports = function(settings) {
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
  callback(null, this.data[key]);
};

/**
 * Save a item.
 *
 * @param {Object} item Object representing the item.
 * @param {Function} callback Function to run when data is saved.
 */
MemoryStorage.prototype.save = function(item, callback) {
  this.data[item.key] = item;
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
