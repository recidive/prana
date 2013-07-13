// This have ugly paths, but in your application they'll be acessible through
// Prana.Type and Prana.Model.
var Type = require('../../../lib/type');
var Model = require('../../../lib/model');

/**
 * Example extension prototype.
 */
var example = module.exports = {

  // The type() hook.
  // The type() hook can be used to alter or add types.
  type: function(types, callback) {
    // Add a new type.
    types['anotherExampleType'] = new Model.compile(this.application, Type('anotherExampleType', {
      title: 'Another example type',
      description: 'Another example type created by an extension'
    }));
    callback();
  },

  // The example() hook.
  // The example() hook can be used to alter/add examples. This is automatically
  // created for the example type created by the example.type.json.
  example: function(examples) {
    // Add new example object.
    examples['newExample'] = {
      title: 'A new example',
      description: 'An added from an alter.'
    };

    // Alter an existing example object.
    examples['example'].someProperty = 'Some value.';
  },

  // The list() hook.
  // The list() hook can be used to alter/add items of all types.
  list: function(type, items, callback) {

    // Add a property to all types. You can use type to act only on certain
    // items of a certain type.
    for (var itemKey in items) {
      items[itemKey].anExampleProperty = 'someValue';
    }

    callback();
  }
};
