/*
 * Prana Utilities.
 */

/*
 * Module dependencies.
 */
var fs = require('fs');
var async = require('async');

/**
 * Utility functions.
 */
var utils = module.exports = {};

/**
 * Merge properties from an object into another maintaining properties
 * descriptor.
 *
 * @param {Object} to Base object to add properties to.
 * @param {Object} from Object to get properties to merge.
 */
utils.extend = function(to, from) {
  var props = Object.getOwnPropertyNames(from);
  props.forEach(function(name) {
    var destination = Object.getOwnPropertyDescriptor(from, name);
    Object.defineProperty(to, name, destination);
  });
};

/**
 * Scan a given directory looking for files that ends with the given suffix.
 *
 * @param {String} dir Path to the directory to scan.
 * @param {String} suffix Suffix used to filter e.g. by file extension.
 * @param {Function} callback Function to run when it finishes scanning.
 */
utils.scan = function(dir, suffix, callback) {
  fs.readdir(dir, function(error, files) {
    var returnFiles = [];
    async.each(files, function(file, next) {
      var filePath = dir + '/' + file;
      fs.stat(filePath, function(error, stat) {
        if (error) {
          return next(error);
        }
        if (stat.isDirectory()) {
          utils.scan(filePath, suffix, function(error, results) {
            if (error) {
              return next(error);
            }
            returnFiles = returnFiles.concat(results);
            next();
          })
        }
        else if (stat.isFile()) {
          if (file.indexOf(suffix, file.length - suffix.length) !== -1) {
            returnFiles.push(filePath);
          }
          next();
        }
      });
    }, function(error) {
      callback(error, returnFiles);
    });
  });
};

/**
 * Capitalize the first letter of a string.
 *
 * @param {String} string Text to capitalize the first letter.
 */
utils.capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * convert string from hyphens to camelCase
 *
 * @param {String} string Text to convert hyphens to camelCase.
 */
utils.hyphensToCamelCase = function (string) {
  var words = string.split('-');
  if (words.length > 1) {
    var rename = words[0];
    for (var i = 1; i < words.length; i++) {
      rename = rename.concat(utils.capitalizeFirstLetter(words[i]));
    };
    string = rename;
  }
  return string;
}