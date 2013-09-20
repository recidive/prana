/*
 * Prana Application.
 *
 * The Prana application class.
 */

/*
 * Module dependencies.
 */
var util = require('util');
var fs = require('fs');
var path = require('path');
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var utils = require('./lib/utils');

/**
 * Prana constructor.
 *
 * @constructor
 * @inherits EventEmitter
 * @param {Object} settings Application settings.
 */
var Prana = module.exports = function(settings) {
  EventEmitter.call(this);

  this.settings = {
    extensionFileSuffix: '.extension.json',
    commonDependencies: [],
    extensions: null
  };

  if (settings) {
    utils.extend(this.settings, settings);
  }

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
    process: function(name, settings) {
      var controller = settings.controller || Prana.Type;
      var typeObject = new controller(name, settings);
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
    process: function(name, settings) {
      var controller = settings.controller || Prana.Extension;
      return new controller(self, name, settings);
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
 * Make sure all extensions and types are loaded.
 *
 * @param {Function} callback Callback to run after prana was initialized.
 */
Prana.prototype.init = function(callback) {
  var self = this;
  async.mapSeries(['extension', 'type'], function(typeName, next) {
    var TypeModel = self.type(typeName);
    // Just calling this will set this.extension and this.type vars since those
    // vars were passed to storage settings.
    TypeModel.list({}, next);
  },
  function(err, results) {
    // Run init hook on all modules.
    self.invoke('init', self, function() {
      callback.apply(self, results);
    })
  });
};

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
 * @param {Object} settings Extension settings.
 * @return {Extension} Extension instance.
 */
Prana.prototype.extension = function(name, settings) {
  // If there's no settings we want to get a extension.
  if (!settings) {
    // Return this as earlier as possible.
    return this.extensions[name];
  }
  else {
    // Run the process function from the 'extension' type.
    return this.extensions[name] = this.types['extension'].type.process(name, settings);
  }
};

/**
 * Scan the file system for extensions.
 *
 * @param {String} dir Path to extensions container directory.
 * @param {Function} callback Function to run when data is returned.
 */
Prana.prototype.loadExtensions = function(dir, callback) {
  var self = this;
  var foundExtensions = {};

  // Scan directory for JSON files matching settings.extensionFileSuffix.
  Prana.Extension.scan(dir, this.settings.extensionFileSuffix, function(file, data, next) {
    // Build extension info.
    var extensionInfo = JSON.parse(data);
    extensionInfo.path = path.dirname(file);
    extensionInfo.name = extensionInfo.name || path.basename(file, self.settings.extensionFileSuffix);

    // Set dependency chain merging dependencies and common dependencies if any.
    // Clone settings.commonDependencies array to avoid affecting other
    // applications.
    extensionInfo.dependencyChain = self.settings.commonDependencies.concat([]);
    if (extensionInfo.dependencies) {
      extensionInfo.dependencies.forEach(function(dependency) {
        if (extensionInfo.dependencyChain.indexOf(dependency) === -1) {
          extensionInfo.dependencyChain.push(dependency);
        }
      });
    }

    // In the case we are enabling a module that's in setting.commonDependencies
    // we need to remove the extension from it's own list of dependencies.
    var index = extensionInfo.dependencyChain.indexOf(extensionInfo.name);
    if (index !== -1) {
      extensionInfo.dependencyChain.splice(index, 1);
    }

    // Add to found extensions.
    foundExtensions[extensionInfo.name] = extensionInfo;

    next();
  }, function(err) {
    if (err) {
      return callback(err);
    }

    // If settings.extensions is not set, enabled all extensions found.
    var enabled = self.settings.extensions ? Object.keys(self.settings.extensions) : Object.keys(foundExtensions);
    var chains = {};
    var enabledExtensions = {};
    async.each(enabled, function(extensionName, next) {
      if (!foundExtensions[extensionName]) {
        return next(new Error('Extension not found ' + extensionName + '.'));
      }

      var extensionInfo = foundExtensions[extensionName];

      // Check if there are missing dependecies.
      var missingDependencies = extensionInfo.dependencyChain.filter(function(dependency) {
        return !foundExtensions[dependency];
      });

      // Fail if there are missing dependencies.
      if (missingDependencies.length > 0) {
        return next(new Error('Missing dependecies for ' + extensionName + ' extension: ' + missingDependencies.join(', ') + '.'));
      }

      // Build extension prototype.
      var prototypeFile = extensionInfo.path + '/' + extensionInfo.name + '.js';
      fs.exists(prototypeFile, function(exists) {
        // Allow extensions without a prototype. E.g. for feature extensions
        // that just have JSON files with some resources.
        extensionInfo.prototype = exists ? require(prototypeFile) : {};
        foundExtensions[extensionInfo.name] = extensionInfo;

        // Add extension dependencies and initialization function to the
        // dependency chains.
        chains[extensionInfo.name] = extensionInfo.dependencyChain.concat([function(next) {
          // Get module settings from application settings and add module info
          // to that.
          settings = self.settings.extensions ? self.settings.extensions[extensionInfo.name] : {};
          settings.info = extensionInfo;

          // Initialize and add the module instance to the application.
          enabledExtensions[extensionInfo.name] = self.extension(extensionInfo.name, extensionInfo, settings);

          next();
        }]);
        next();
      });
    }, function (err) {
      if (err) {
        return callback(err);
      }

      // Execute all initialization functions declared above taking into
      // account module dependencies.
      async.auto(chains, function(err) {
        callback(err, enabledExtensions);
      });
    });
  });
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

/**
 * Collect data from JSON files and type specific hooks and add them to the data
 * container object.
 *
 * @param {Type} type Type object to collect data for.
 * @param {Object} data Data container object.
 * @param {Function} callback Callback to run after all data have been
 *   collected.
 */
Prana.prototype.collect = function(type, data, callback) {
  // The extension type don't allow collecting.
  if (type.name == 'extension') {
    return callback();
  }

  var result = {};
  var self = this;

  // Loop over all extensions to collect their items.
  async.each(Object.keys(this.extensions), function(extensionName, next) {
    var extension = self.extensions[extensionName];

    if (extension.settings.path) {
      // Scan for JSON files for this type.
      Prana.Extension.scanItems(extension.settings.path, type.name, function(err, foundItems) {
        if (err) {
          return next(err);
        }

        if (foundItems) {
          // If items was found add them to the result.
          utils.extend(result, foundItems);
        }

        next();
      });
    }
    else {
      next();
    }
  }, function(err) {
    // Process all items from JSON files.
    Prana.Type.processAll(type, result, data);

    // Invoke type hooks on all modules.
    self.invoke(type.name, data, function(err, hookData) {
      if (err) {
        return callback(err);
      }

      if (hookData) {
        // Each hook implemention can return many items.
        hookData.forEach(function(items) {
          // Process each set of items.
          Prana.Type.processAll(type, items, data);
        });
      }

      callback(err);
    });

  });
};
