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
 * Scan the file system for items.
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

    // convert type names from hyphens to camelCase
    if (type === 'type') key = utils.hyphensToCamelCase(key);
    
    foundItems[key] = itemInfo;

    next();
  }, function(error) {
    if (error) {
      return callback(error);
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
  utils.scan(dir, suffix, function(error, files) {
    if (error) {
      return callback(error);
    }

    async.each(files, function(file, next) {
      fs.readFile(file, 'utf-8', function (error, data) {
        if (error) {
          return next(error);
        }

        iterator(file, data, function() {
          next();
        });
      });
    }, function(error) {
      if (error) {
        return callback(error);
      }

      callback();
    });
  });
};
