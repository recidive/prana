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
 * Merge properties from an object into another.
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
  fs.readdir(dir, function(err, files) {
    var returnFiles = [];
    async.each(files, function(file, next) {
      var filePath = dir + '/' + file;
      fs.stat(filePath, function(err, stat) {
        if (err) {
          return next(err);
        }
        if (stat.isDirectory()) {
          utils.scan(filePath, suffix, function(err, results) {
            if (err) {
              return next(err);
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
    }, function(err) {
      callback(err, returnFiles);
    });
  });
};