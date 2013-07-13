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
var MemoryStorage = require('./memory');

/**
 * Extension constructor.
 *
 * @constructor
 * @param {String} name Extension name.
 * @param {Object} prototype Extension prototype object with members to add.
 * @param {Object} settings Extension settings.
 */
var Extension = module.exports = function(application, name, prototype, settings) {
  this.application = application;
  this.name = name;
  this.settings = settings;

  // Merge in extension prototype.
  utils.extend(this, prototype);
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
 * Create an extension instance.
 *
 * @param {String} name Extension name.
 * @param {Object} prototype Extension prototype object with its members.
 * @return {Extension} Extension instance with extension object prototype merged
 *   to it.
 */
Extension.create = function(name, prototype, settings) {
  return new Extension(name, prototype, settings);
};

/**
 * Scan the file system for extensions.
 *
 * @param {String} dir Path to extensions container directory.
 * @param {Function} callback Function to run when data is returned.
 */
Extension.scan = function(dir, callback) {
  var foundExtensions = {};
  utils.scan(dir, '.extension.json', function(err, files) {
    async.each(files, function(file, next) {
      fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
          return next(err);
        }

        // Build extension info.
        var extensionInfo = JSON.parse(data);
        extensionInfo.path = path.dirname(file);
        extensionInfo.name = extensionInfo.name || path.basename(file, '.extension.json');

        // Build extension prototype.
        var prototypeFile = extensionInfo.path + '/' + extensionInfo.name + '.js';
        fs.exists(prototypeFile, function(exists) {
          var extensionPrototype = exists ? require(prototypeFile) : {};

          foundExtensions[extensionInfo.name] = {
            info: extensionInfo,
            prototype: extensionPrototype
          };

          next();
        });

      });
    }, function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, foundExtensions);
    });
  });
};
