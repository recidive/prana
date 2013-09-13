/*
 * Prana Type.
 *
 * A type object holds type definition metadata and is a wrapper around a
 * storage mechanism with event emitter capabilities. The type object handles
 * all events for a given type.
 */

/*
 * Module dependencies.
 */
var util = require('util');
var utils = require('./utils');
var MemoryStorage = require('./memory');
var EventEmitter = require('events').EventEmitter;

/**
 * Type constructor.
 *
 * @constructor
 * @inherits EventEmitter
 * @param {String} name The name of the type to create.
 * @param {Object} settings Type settings.
 */
var Type = module.exports = function(name, settings) {
  EventEmitter.call(this);

  this.name = name;

  // Default settings.
  this.settings = {
    path: name,
    storage: MemoryStorage,
    keyProperty: 'key'
  };
  utils.extend(this.settings, settings);

  // Pass keyProperty to storage settings.
  var storageSettings = {
    keyProperty: this.settings.keyProperty
  };
  if (this.settings.storageSettings) {
    utils.extend(storageSettings, this.settings.storageSettings);
  }

  // Data storage instance.
  this.storage = new this.settings.storage(storageSettings);

  // Add event listeners provided in settings.
  if (this.settings.listeners) {
    for (var event in this.settings.listeners) {
      this.on(event, this.settings.listeners[event]);
    }
  }
};

// Inherits EventEmitter.
util.inherits(Type, EventEmitter);

/**
 * Process a type item and return the processed data.
 *
 * @param {String} key Item object identifier.
 * @param {Object} values Item values object.
 * @return {Object} processed item values.
 */
Type.prototype.process = function(key, values) {
  return this.settings.process ? this.settings.process(key, values) : values;
};

/**
 * Process all types items and return the processed data.
 *
 * @param {Type} type Type to use to process data.
 * @param {Object} data Items to process.
 * @param {Object} [processedData] Processed items for avoiding another loop
 *   later to add items where we need them.
 * @return {Object} processed item values.
 */
Type.processAll = function(type, data, processedData) {
  var result = {};

  for (var itemName in data) {
    // Hooks can badly return null items.
    if (data[itemName]) {
      var processedItem = type.process(itemName, data[itemName]);
      result[itemName] = processedItem;
      if (processedData) {
        processedData[itemName] = processedItem;
      }
    }
  }

  return result;
};
