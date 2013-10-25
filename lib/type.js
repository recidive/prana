/*
 * Prana Type.
 *
 * A type object holds type definition metadata and is a wrapper around a
 * storage mechanism with event emitter capabilities. The type object handles
 * all events for a given type.
 *
 * Types exist only because we wanted an event controller that could extend
 * EventEmitter, and to do so at prototype level (i.e. using util.inherits()),
 * we needed an interface to connect it to the Model object, that's our actual
 * controller.
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
var Type = module.exports = function(application, name, settings) {
  EventEmitter.call(this);

  // Store name and application.
  this.name = name;
  this.application = application;

  // Default settings.
  this.settings = {
    path: name,
    storage: 'memory',
    keyProperty: 'name'
  };
  utils.extend(this.settings, settings);

  // Create a reference to the storage for easy access to it.
  this.storage = this.application.storage(this.settings.storage);

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
  return this.settings.process ? this.settings.process(key, values) : this.application.new(this.name, values);
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
    // Hooks can badly return null or undefined items.
    if (data[itemName]) {
      var processedItem = type.process(itemName, data[itemName]);
      // Default key property value to the item name.
      processedItem[type.settings.keyProperty] = processedItem[type.settings.keyProperty] || itemName;

      // Add the processed item to result.
      result[itemName] = processedItem;

      if (processedData) {
        // If processed data object was passed, add the item to it to avoid
        // having to loop the result to do this.
        processedData[itemName] = processedItem;
      }
    }
  }

  return result;
};
