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

  var self = this;

  // Add 'type' core type.
  this.type('type', {
    title: 'Type',
    description: 'Types are the smallest thing on the system.',
    storageSettings: {
      // Set data as reference to this.types.
      data: this.types
    },
    process: function(name, item) {
      var controller = item.controller || Prana.Type;
      var typeObject = new controller(name, item);
      return Prana.Model.compile(self, typeObject);
    },
    key: 'name'
  });

  // Add 'extension' core type.
  this.type('extension', {
    title: 'Extension',
    description: 'Extensions can extend every type on the system, as well as react on events.',
    storageSettings: {
      // Set data as reference to this.extensions.
      data: this.extensions
    },
    process: function(name, item) {
      var controller = item.controller || Prana.Extension;
      return new controller(self, name, item);
    },
    key: 'name'
  });
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
 * @param {String} name A string to be used to identify the type.
 * @param {Object} settings The settings for for the type to be created.
 * @return {Model} A Model subclass created exclusivelly for this type.
 */
Prana.prototype.type = function(name, settings) {
  // If there's no settings we want to get a type.
  if (!settings) {
    // Return this as earlier as possible.
    return this.types[name];
  }
  else {
    if (name === 'type') {
      // We are creating the 'type' type, use process from settings.
      return this.types[name] = settings.process(name, settings);
    }
    else {
      // Run the process function from the 'type' type that's actually a model
      // class instead of a type specific model instance.
      return this.types[name] = this.types['type'].type.process(name, settings);
    }
  }
};

/**
 * Set or get an extension.
 *
 * @param {String} extension A string to be used to identify the extension.
 * @param {Object} prototype An object with hooks and other methods used to
 *   compose extension instance.
 * @param {Object} settings Extension settings.
 * @return {Extension} Extension instance.
 */
Prana.prototype.extension = function(name, prototype, settings) {
  // If there's no settings we want to get a extension.
  if (!prototype) {
    // Return this as earlier as possible.
    return this.extensions[name];
  }
  else {
    // Run the process function from the 'extension' type.
    return this.extensions[name] = this.types['extension'].type.process(name, prototype, settings);
  }
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

  async.map(Object.keys(this.extensions), function(extensionName, next) {
    var extension = self.extensions[extensionName];

    // Make a copy of arguments to avoid appending all next callbacks to the
    // main arguments object.
    var argsCopy = args.slice();
    argsCopy.push(next);

    // Invoke extension hook.
    extension.invoke.apply(extension, argsCopy);
  }, callback);
};
