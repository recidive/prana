/**
 * Example extension prototype.
 */
var example = module.exports = {
  // The example() hook.
  // The example() hook can be used to alter/add examples.
  example: function(examples, callback) {
    var newExamples = {};

    // Add new example object.
    newExamples['newExample'] = {
      title: 'A new example',
      description: 'A new example item added from a type hook.'
    };

    // Pass newExamples to callback to get our items processed and properly
    // added to the examples container.
    callback(null, newExamples);
  },

  // The collect() hook.
  // The collect() hook can be used to alter/add items of all types.
  collect: function(type, items, callback) {

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
