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

  // Data storage instance.
  this.storage = new this.settings.storage(this.settings.storageSettings || {});
};

// Inherits EventEmitter.
util.inherits(Type, EventEmitter);
