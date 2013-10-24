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

  // Collected data storage.
  this.collected = {};
};

/**
 * List stored items.
 *
 * @param {Type} type Type object.
 * @param {Object} query Optional query object.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryStorage.prototype.list = function(type, query, callback) {
  var self = this;

  // Collect data for this type if not collected yet. Don't collect extensions.
  if (!this.collected[type.name] && type.name !== 'extension') {
    // Initialize storage container for this type if needed.
    this.data[type.name] = this.data[type.name] || {};

    // Collect data, cache it and run this list() again to query the cache.
    return this.application.collect(type, this.data[type.name], function(error) {
      if (error) {
        callback(error);
      }

      self.collected[type.name] = true;

      // Call the function itself to get a value taking into account the
      // collected values.
      self.list(type, query, callback);
    });
  }

  // Allow filtering by key.
  if (typeof query === 'object' && query[type.settings.keyProperty] !== undefined) {
    var key = query[type.settings.keyProperty];
    var result = {};
    result[key] = this.data[type.name][key];
    return callback(null, result);
  }

  // Otherwise list all items of this type.
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
