// This have ugly paths, but in your application they'll be acessible through
// Prana.Type and Prana.Model.
var Type = require('../../../lib/type');
var Model = require('../../../lib/model');

/**
 * Example extension prototype.
 */
var example = module.exports = {
  // Alter/add types.
  type: function(types, callback) {
    // Add a new type.
    types['anotherExampleType'] = new Model.compile(this.application, Type('anotherExampleType', {
      title: 'Another example type',
      description: 'Another example type created by an extension'
    }));
    callback();
  },

  // Alter/add examples.
  example: function(examples) {
    // Add new example object.
    examples['newExample'] = {
      title: 'A new example',
      description: 'An added from an alter.'
    };

    // Alter an existing example object.
    examples['example'].someProperty = 'Some value.';
  },

  // Alter/add items of all types.
  list: function(type, items, callback) {
    // Add a property to all types. You can use type to act only on certain
    // items of a certain type.
    for (var itemKey in items) {
      items[itemKey].anExampleProperty = 'someValue';
    }

    callback();
  }
};
