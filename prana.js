/*
 * Prana Application.
 *
 * The Prana application class.
 */

/*
 * Module dependencies.
 */
var util = require('util');
var async = require('async');
var EventEmitter = require('events').EventEmitter;

/**
 * Prana constructor.
 *
 * @constructor
 * @inherits EventEmitter
 * @param {Object} settings Application settings.
 */
var Prana = module.exports = function(settings) {
  EventEmitter.call(this);

  this.settings = settings;

  // Types container.
  this.types = {};

  // Extensions container.
  this.extensions = {};

  // Add 'type' core type.
  this.type(new Prana.Type('type', {
    title: 'Type',
    description: 'Types are the smallest thing on the system.',
    storage: Prana.MemoryStorage,
    storageSettings: {
      // Set data as reference to this.types.
      data: this.types
    },
    key: 'name'
  }));

  // Add 'extension' core type.
  this.type(new Prana.Type('extension', {
    title: 'Extension',
    description: 'Extensions can extend every type on the system, as well as react on events.',
    storage: Prana.MemoryStorage,
    storageSettings: {
      // Set data as reference to this.extensions.
      data: this.extensions
    },
    key: 'name'
  }));
};

util.inherits(Prana, EventEmitter);

// Add components to Prana namespace.
Prana.utils = require('./lib/utils');
Prana.MemoryStorage = require('./lib/memory');
Prana.Type = require('./lib/type');
Prana.Model = require('./lib/model');
Prana.Extension = require('./lib/extension');

/**
 * Create new type specific objects.
 *
 * @param {String} type A type name string.
 * @param {Object} values Initial object values.
 * @return {Model} Actually an instance of a subclass of Model, the type
 *   specific model class instance.
 */
Prana.prototype.new = function(type, values) {
  var TypeModel = this.type(type);
  return new TypeModel(values);
};

/**
 * Set or get a type.
 *
 * @param {Type|String} type A type name string or Type object to add or set.
 * @return {Type} Type instance.
 */
Prana.prototype.type = function(type) {
  // If type is a string, we want to get a type.
  if (typeof type === 'string') {
    return this.types[type];
  }

  // Otherwise set and return it.
  return this.types[type.name] = Prana.Model.compile(this, type);
};

/**
 * Set or get an extension.
 *
 * @param {Extension|String} extension An extension name string or Extension
 *   object to add or set.
 * @return {Extension} Extension instance.
 */
Prana.prototype.extension = function(extension) {
  // If extension is a string, we want to get an extension.
  if (typeof extension === 'string') {
    return this.extensions[extension];
  }

  // Otherwise set it.
  return this.extensions[extension.name] = extension;
};

/**
 * Invoke a hook in all extensions that implement it.
 *
 * @param {String} hook Name of the hook to run.
 * @param {...Mixed} arg Variable number of arguments to pass the hook
 *   implementation.
 * @param {Function} callback Callback to run after all implementations have
 *   been invoked.
 */
Prana.prototype.invoke = function() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  var self = this;

  async.each(Object.keys(this.extensions), function(extensionName, next) {
    var extension = self.extensions[extensionName];

    // Make a copy of arguments to avoid appending all next callbacks to the
    // mains arguments object.
    var argsCopy = args.slice();
    argsCopy.push(next);

    // Invoke extension hook.
    extension.invoke.apply(extension, argsCopy);
  }, callback);
};
