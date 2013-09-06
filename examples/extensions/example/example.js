/**
 * Example extension prototype.
 */
var example = module.exports = {

  // The type() hook.
  // The type() hook can be used to alter or add types.
  type: function(types, callback) {
    var newTypes = {};

    // Show we can alter the type created by the JSON file on this same module.
    types.example.propertyAddedFromSameModule = 'Some value';

    // Add a new type.
    newTypes['anotherExampleType'] = {
      title: 'Another example type',
      description: 'Another example type created by an extension'
    };

    callback(null, newTypes);
  },

  // The example() hook.
  // The example() hook can be used to alter/add examples. This is automatically
  // created for the example type created by the example.type.json.
  example: function(examples, callback) {
    var newExamples = {};

    // Add new example object.
    newExamples['newExample'] = {
      title: 'A new example',
      description: 'An added from an alter.'
    };

    // Pass newExamples to callback to get our items processed and properly
    // added to the examples container.
    callback(null, newExamples);
  },

  // The list() hook.
  // The list() hook can be used to alter/add items of all types.
  list: function(type, items, callback) {

    // Add a property to all types. You can use type to act only on certain
    // items of a certain type.
    for (var itemKey in items) {
      items[itemKey].anExampleProperty = 'someValue';
    }

    // Alter only existing example object of the example type.
    if (type.name == 'example') {
      items['example'].someProperty = 'Some value.';
    }

    callback();
  }
};
