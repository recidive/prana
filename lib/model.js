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

  if (type.settings.defaultValues) {
    if (typeof type.settings.defaultValues == 'function') {
      type.settings.defaultValues.call(this, values);
    } else {
      utils.extend(this, type.settings.defaultValues);
    }
  }

  if (values) {
    utils.extend(this, values);
  }

  // Add methods from type settings.
  if (type.settings.methods) {
    for (var method in type.settings.methods) {
      Model.defineHiddenProperty(this, method, type.settings.methods[method]);
    }
  }
};

/**
 * Save this item.
 *
 * @param {Function} callback Function to run when data is saved.
 */
Model.prototype.save = function(callback) {
  Model.do(this.application, this.type, 'save', this, callback);
};

/**
 * Delete this item.
 *
 * @param {Function} callback Function to run when data is deleted.
 */
Model.prototype.delete = function(callback) {
  Model.do(this.application, this.type, 'delete', this[this.type.settings.keyProperty], callback);
};

/**
 * Execute type operations.
 *
 * @param {Application} application Application instance.
 * @param {Type} type The type object.
 * @param {String} operation Operation being performed, in this case also the
 *   event being emitted.
 * @param {Mixed} parameter A single parameter to pass to the operation
 *   callback.
 * @param {Function} callback Function to run when the operation completes.
 */
Model.do = function(application, type, operation, parameter, callback) {
  // Run all pre operation hooks.
  Model.emitAndCall(application, type, 'pre' + utils.capitalizeFirstLetter(operation), parameter, function(error, data) {
    if (error) {
      return callback(error);
    }
    // Run operation on the storage.
    type.storage[operation](type, data, function(error, data) {
      if (error) {
        return callback(error);
      }
      // Run all operation hooks.
      Model.emitAndCall(application, type, operation, data, function(error, data) {
        if (error) {
          return callback(error);
        }
        // Run all post operation hooks.
        Model.emitAndCall(application, type, 'post' + utils.capitalizeFirstLetter(operation), data, callback);
      });
    });
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
 * Helper function that emit the event for the requested operation and call a
 * callback passing the data returned.
 *
 * @param {Application} application Application instance.
 * @param {Type} type The type object.
 * @param {String} operation Operation being performed, in this case also the
 *   event being emitted.
 * @param {Object} data Data object, usually a object representing single or
 *   multiple items.
 * @param {Function} callback Function to run when the operation completes.
*/
Model.emitAndCall = function(application, type, operation, data, callback) {
  // Invoke operation hook on all extensions.
  application.invoke(operation, type, data, function(error, result) {
    if (error) {
      if (callback) {
        return callback(error);
      }
      else {
        throw error;
      }
    }

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
    Model.do(application, type, 'list', query, callback);
  };

  MockModel.load = function(key, callback) {
    Model.do(application, type, 'load', key, callback);
  };

  MockModel.save = function(item, callback) {
    if (!(item instanceof this)) {
      // If item isn't an instance of its type model, make it one.
      var item = new this(item);
    }
    Model.do(application, type, 'save', item, callback);
  };

  MockModel.delete = function(key, callback) {
    Model.do(application, type, 'delete', key, callback);
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

  // Add static methods from type settings.
  if (type.settings.statics) {
    utils.extend(MockModel, type.settings.statics);
  }

  return MockModel;
};
