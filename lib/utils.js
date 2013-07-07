/*
 * Prana Utilities.
 */

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
