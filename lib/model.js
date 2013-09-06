/*
 * Prana Model.
 *
 * A model object holds type instance data and data changing methods and is a
 * wrapper around the type instance.
 */

/*
 * Module dependencies.
 */
var util = require('util');
var utils = require('./utils');

/**
 * Model constructor.
 *
 * @constructor
 * @inherits EventEmitter
 * @param {Prana} application Prana application instance.
 * @param {Type} type The type object.
 * @param {Object} values Initial object values.
 */
var Model = module.exports = function(application, type, values) {
  // Store type and storage as hidden properties.
  Model.defineHiddenProperty(this, 'application', application);
  Model.defineHiddenProperty(this, 'type', type);
  Model.defineHiddenProperty(this, 'storage', type.storage);

  if (values) {
    utils.extend(this, values);
  }
};

/**
 * Save this item.
 *
 * @param {Function} callback Function to run when data is saved.
 */
Model.prototype.save = function(callback) {
  this.storage.save(this, function(error, item) {
    Model.emitAndCall(item.application, item.type, 'save', error, item, callback);
  });
};

/**
 * Delete this item.
 *
 * @param {Function} callback Function to run when data is deleted.
 */
Model.prototype.delete = function(callback) {
  this.storage.delete(this[this.type.settings.keyProperty], function(error, item) {
    Model.emitAndCall(item.application, item.type, 'delete', error, item, callback);
  });
};

/**
 * Define hidden property so this doesn't appear in loops.
 *
 * @param {Object} object Object to add the property to.
 * @param {String} property Property name.
 * @param {Mixed} value Property value.
 */
Model.defineHiddenProperty = function(object, property, value) {
  Object.defineProperty(object, property, {
    writable: true,
    enumerable: false,
    configurable: true,
    value: value
  });
};

/**
 * Helper function that checks for a error, and call callback with the error if
 * it exists, otherwise emit the event for the requested operation and call
 * callback passing the data returned.
 *
 * @param {Prana} application Prana application instance.
 * @param {Type} type The type object.
 * @param {String} operation Operation being performed, in this case also the
 *   event being emitted.
 * @param {Error} error Some error object, usually null.
 * @param {Object} data Data object, usually a object representing single or
 *   multiple items.
 * @param {Function} callback Function to run when the event is emitted.
*/
Model.emitAndCall = function(application, type, operation, error, data, callback) {
  if (error) {
    if (callback) {
      return callback(error);
    }
    else {
      throw error;
    }
  }

  // Invoke operation hook on all extensions.
  application.invoke(operation, type, data, function(err, result) {
    // Emit application wide event.
    application.emit(operation, type, data);

    // Emit type specific event.
    type.emit(operation, data);

    if (callback) {
      callback(null, data);
    }
  })
};

/**
 * Compile and return a new model class for a type.
 *
 * @param {Prana} application Prana application instance.
 * @param {Type} type The type object.
 * @return {Function} Actually a subclass of Model, a new class object for a type.
 */
Model.compile = function(application, type) {

  // We create a new class to return it.
  var MockModel = function(values) {
    // Create and return an instance if function is called without the 'new'
    // keyword.
    if (!(this instanceof MockModel)) {
      return new MockModel(values);
    }

    Model.call(this, application, type, values);
  };

  // Extends Model class.
  util.inherits(MockModel, Model);

  // Add a static variables for application and type.
  MockModel.application = application;
  MockModel.type = type;

  // Model static methods.
  MockModel.list = function(query, callback) {
    type.storage.list(query, function(error, items) {
      application.collect(type, items, function(err) {
        Model.emitAndCall(application, type, 'list', error, items, callback);
      });
    });
  };

  MockModel.load = function(key, callback) {
    type.storage.load(key, function(error, item) {
      Model.emitAndCall(application, type, 'load', error, item, callback);
    });
  };

  MockModel.save = function(item, callback) {
    type.storage.save(item, function(error, item) {
      Model.emitAndCall(application, type, 'save', error, item, callback);
    });
  };

  MockModel.delete = function(key, callback) {
    type.storage.delete(key, function(error, item) {
      Model.emitAndCall(application, type, 'delete', error, item, callback);
    });
  };

  // Relay event related calls to type object that's the actual EventEmitter.
  MockModel.on = function(event, callback) {
    type.on(event, callback);
  };

  MockModel.once = function(event, callback) {
    type.once(event, callback);
  };

  MockModel.emit = function() {
    var args = Array.prototype.slice.call(arguments);
    type.once.apply(type, args);
  };

  return MockModel;
};
