/*
 * Prana Extension.
 */

/*
 * Module dependencies.
 */
var util = require('util');
var path = require('path');
var fs = require('fs');
var async = require('async');
var utils = require('./utils');

/**
 * Extension constructor.
 *
 * @constructor
 * @param {String} name Extension name.
 * @param {Object} prototype Extension prototype object with members to add.
 * @param {Object} settings Extension settings.
 */
var Extension = module.exports = function(application, name, settings) {
  this.application = application;
  this.name = name;
  this.settings = settings;

  // Merge in extension prototype.
  utils.extend(this, settings.prototype);
};

/**
 * Invoke a hook.
 *
 * @param {String} hook Name of the hook to run.
 * @param {...Mixed} arg Variable number of arguments to pass the hook
 *   implementation.
 * @param {Function} callback Callback to run after hook has been invoked.
 */
Extension.prototype.invoke = function() {
  var args = Array.prototype.slice.call(arguments);
  var hook = args.shift();

  if (this[hook] && typeof this[hook] === 'function') {
    this[hook].apply(this, args);
  }
  else {
    var callback = args.pop();
    callback();
  }
};

/**
 * Scan the file system for extensions.
 *
 * @param {String} dir Path to extensions container directory.
 * @param {String} [suffix] Suffix for filtering files.
 * @param {Function} callback Function to run when data is returned.
 */
Extension.scanExtensions = function(dir, suffix, callback) {
  // If callback is omitted, suffix is actually the callback.
  if (!callback) {
    callback = suffix;
    suffix = '.extension.json';
  }

  var foundExtensions = {};
  Extension.scan(dir, suffix, function(file, data, next) {
    // Build extension info.
    var extensionInfo = JSON.parse(data);
    extensionInfo.path = path.dirname(file);
    extensionInfo.name = extensionInfo.name || path.basename(file, suffix);

    // Build extension prototype.
    var prototypeFile = extensionInfo.path + '/' + extensionInfo.name + '.js';
    fs.exists(prototypeFile, function(exists) {
      var extensionPrototype = exists ? require(prototypeFile) : {};

      extensionInfo.prototype = extensionPrototype;
      foundExtensions[extensionInfo.name] = extensionInfo;

      next();
    });
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, foundExtensions);
  });
};

/**
 * Scan the file system for extensions.
 *
 * @param {String} dir Path to directory to scan for items.
 * @param {String} type Type name.
 * @param {Function} callback Function to run when data is returned.
 */
Extension.scanItems = function(dir, type, callback) {
  var suffix = '.' + type + '.json'
  var foundItems = {};
  Extension.scan(dir, suffix, function(file, data, next) {
    var itemInfo = JSON.parse(data);

    // @todo: get key property name from type object.
    var key = itemInfo.name || itemInfo.key || path.basename(file, suffix);

    foundItems[key] = itemInfo;

    next();
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null, foundItems);
  });
};

/**
 * Scan the file system for files with a given suffix.
 *
 * @param {String} dir Path to directory to scan for items.
 * @param {String} suffix File suffix.
 * @param {Function} iterator Function to run on each found file.
 * @param {Function} callback Function to run when finished.
 */
Extension.scan = function(dir, suffix, iterator, callback) {
  utils.scan(dir, suffix, function(err, files) {
    if (err) {
      return callback(err);
    }

    async.each(files, function(file, next) {
      fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
          return next(err);
        }

        iterator(file, data, function() {
          next();
        });
      });
    }, function(err) {
      if (err) {
        return callback(err);
      }

      callback();
    });
  });
};
