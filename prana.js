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

  // Extensions container.
  this.extensions = {};

  // Cache container.
  this.cache = {};
};

util.inherits(Prana, EventEmitter);

// Add components to Prana namespace.
Prana.utils = require('./lib/utils');
Prana.Extension = require('./lib/extension');

/**
 * Call init hook on all extensions.
 *
 * @param {Function} callback Callback to run after prana was initialized.
 */
Prana.prototype.init = function(callback) {
  // Run init hook on all extensions.
  // @todo: maybe it's not needed to pass this here.
  var self = this;
  this.invoke('init', this, function() {
    callback.call(self, self.extensions);
  });
};

/**
 * Set or get an extension.
 *
 * @param {String} name A string used to identify the extension.
 * @param {Object} settings Extension settings.
 * @return {Extension} Extension instance.
 */
Prana.prototype.extension = function(name, settings) {
  if (!settings) {
    return this.extensions[name];
  }

  var controller = settings.controller || Prana.Extension;
  return this.extensions[name] = new controller(this, name, settings);
};

/**
 * Scan the file system for extensions.
 *
 * @param {String|Array} dir Path to extensions container directory this can be
 *   also an array of paths.
 * @param {Function} callback Function to run when data is returned.
 */
Prana.prototype.loadExtensions = function(dir, callback) {
  var self = this;
  var foundExtensions = {};

  // If dir is a string convert ir to an array.
  var dirs = (typeof dir === 'string') ? [dir] : dir;

  // We loop dirs in series since order is important.
  async.eachSeries(dirs, function(dir, next) {

    // Scan directory for JSON files matching settings.extensionFileSuffix.
    Prana.Extension.scan(dir, self.settings.extensionFileSuffix, function(file, data, next) {

      // Parse data and build extension settings.
      try {
        var settings = JSON.parse(data);
        settings.path = path.dirname(file);
        settings.name = settings.name || path.basename(file, self.settings.extensionFileSuffix);
      } catch (error) {
        return next(error);
      }

      // Set dependency chain merging dependencies and common dependencies if
      // any. Clone settings.commonDependencies array to avoid concatenating
      // it accross extensions.
      settings.dependencyChain = self.settings.commonDependencies.concat([]);
      if (settings.dependencies) {
        settings.dependencies.forEach(function(dependency) {
          if (settings.dependencyChain.indexOf(dependency) === -1) {
            settings.dependencyChain.push(dependency);
          }
        });
      }

      // In the case we are enabling a module that's in setting.commonDependencies
      // we need to remove the extension from it's own list of dependencies.
      var index = settings.dependencyChain.indexOf(settings.name);
      if (index !== -1) {
        settings.dependencyChain.splice(index, 1);
      }

      // Add to found extensions.
      foundExtensions[settings.name] = settings;
      next();
    }, next);
  },
  function (error) {
    if (error) {
      return callback(error);
    }

    // If settings.extensions is not set, enabled all extensions found.
    var enabled = self.settings.extensions ? Object.keys(self.settings.extensions) : Object.keys(foundExtensions);
    var chains = {};
    var enabledExtensions = {};
    async.each(enabled, function(extensionName, next) {
      if (!foundExtensions[extensionName]) {
        return next(new Error('Extension not found ' + extensionName + '.'));
      }

      var settings = foundExtensions[extensionName];

      // Check if there are missing dependecies.
      var missingDependencies = settings.dependencyChain.filter(function(dependency) {
        return !foundExtensions[dependency];
      });

      // Fail if there are missing dependencies.
      if (missingDependencies.length > 0) {
        return next(new Error('Missing dependecies for ' + extensionName + ' extension: ' + missingDependencies.join(', ') + '.'));
      }

      // Build extension prototype.
      var prototypeFile = settings.path + '/' + settings.name + '.js';
      fs.exists(prototypeFile, function(exists) {
        // Allow extensions without a prototype. E.g. for feature extensions
        // that just have JSON files with some resources.
        settings.prototype = exists ? require(prototypeFile) : {};

        // Add extension dependencies and initialization function to the
        // dependency chains, without changing settings.dependencyChain.
        chains[settings.name] = settings.dependencyChain.concat([function(next) {
          // Get module settings from application settings and add module info
          // to that.
          var instanceSettings = self.settings.extensions ? self.settings.extensions[settings.name] : {};
          utils.extend(settings, instanceSettings);

          // Initialize and add the module instance to the application.
          enabledExtensions[settings.name] = self.extension(settings.name, settings);

          next();
        }]);
        next();
      });
    },
    function (error) {
      if (error) {
        return callback(error);
      }

      // Execute all initialization functions declared above taking into
      // account module dependencies.
      async.auto(chains, function(error) {
        callback(error, enabledExtensions);
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
  var hook = args.shift();
  var callback = args.pop();
  var self = this;
  var chains = {};

  async.each(Object.keys(this.extensions), function(extensionName, next) {
    var extension = self.extensions[extensionName];
    var settings = extension.settings;
    var extensionInvoke = function(next) {
      // Make a copy of arguments to avoid appending all next callbacks to the
      // main args object.
      var argsCopy = args.slice();

      // Invoke extension hook implementation.
      if (extension[hook] && typeof extension[hook] === 'function') {
        argsCopy.push(next);
        // Invoke hook implemetation and return.
        return extension[hook].apply(extension, argsCopy);
      }

      next();
    };

    if (settings.dependencyChain) {
      // Clone extension dependency chain and add invocation function to the
      // dependency chains, without changing settings.dependencyChain.
      chains[extensionName] = settings.dependencyChain.concat([extensionInvoke]);
    }
    else {
      // Extension doesn't have any dependencies.
      chains[extensionName] = extensionInvoke;
    }

    next();
  },
  function (error) {
    if (error) {
      return callback(error);
    }

    // Execute all hooks taking into account module dependencies.
    async.auto(chains, callback);
  });
};

/**
 * Get a single item from hooks and/or JSON file.
 *
 * @param {String} type Type of item to pick.
 * @param {String} key Key of item to pick.
 * @param {Function} callback Callback to run when item is retrieved.
 */
Prana.prototype.pick = function(type, key, callback) {
  this.collect(type, function(error, items) {
    if (error) {
      return callback(error);
    }
    callback(null, items[key]);
  });
};

/**
 * Collect data from JSON files and type specific hooks and add them to the data
 * container object.
 *
 * @param {String} type Type of data to collect items for.
 * @param {Function} callback Callback to run after all data have been
 *   collected.
 */
Prana.prototype.collect = function(type, callback) {
  // If there are cached items for this type return them.
  if (this.cache[type]) {
    return callback(null, this.cache[type]);
  }

  var result = {};
  var self = this;

  // Loop over all extensions to collect their items.
  async.each(Object.keys(this.extensions), function(extensionName, next) {
    var extension = self.extensions[extensionName];

    if (extension.settings.path) {
      // Scan for JSON files for this type.
      Prana.Extension.scanItems(extension.settings.path, type, function(error, foundItems) {
        if (error) {
          return next(error);
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
  },
  function(error) {
    // Invoke type hooks on all extensions. We don't use invoke() here since we
    // want data from previous hook invocation to be passed to the next hook
    // implementation. This way items created by previous hook implementations
    // can be modifyed by the dependent exntensions.

    // Create a chain to call hooks in the order of dependency.
    var chains = {};
    async.each(Object.keys(self.extensions), function(extensionName, next) {
      var extension = self.extensions[extensionName];

      // The callback that will receive and process.
      var extensionInvoke = function(next) {
        if (!extension[type] || typeof extension[type] !== 'function') {
          return next();
        }

        // Invoke type hook implemetation.
        extension[type](result, function(error, newItems) {
          if (error) {
            return next(error);
          }

          utils.extend(result, newItems || {});

          next();
        });
      };

      if (extension.settings.dependencyChain) {
        // Clone extension dependency chain and add invocation function to the
        // dependency chains, without changing settings.dependencyChain.
        chains[extensionName] = extension.settings.dependencyChain.concat([extensionInvoke]);
      }
      else {
        // Extension doesn't have any dependencies.
        chains[extensionName] = extensionInvoke;
      }

      next();
    },
    function (error) {
      if (error) {
        return callback(error);
      }

      // Execute all hooks taking into account module dependencies.
      async.auto(chains, function () {
        self.invoke('collect', type, result, function() {
          self.cache[type] = result;
          callback(null, result);
        });
      });

    });
  });
};

/**
 * Delete all items from the cache.
 *
 * @param {String} type Type of data to delete cache (optional).
 */
Prana.prototype.clear = function(type) {
  if (!type) {
    this.cache = {};
    return;
  }

  if (type && this.cache[type]) {
    delete this.cache[type];
  }
};
