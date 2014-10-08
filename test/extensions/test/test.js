/**
 * Test extension prototype.
 */
var test = module.exports = {
  // The test() hook.
  // The test() hook can be used to alter/add tests.
  test: function(tests, callback) {
    var newTests = {};

    // Add new test object.
    newTests['newTest'] = {
      title: 'A new test',
      description: 'An added from an alter.'
    };

    // Pass newTests to callback to get our items processed and properly
    // added to the tests container.
    callback(null, newTests);
  },

  // The collect() hook.
  // The collect() hook can be used to alter/add items of all types.
  collect: function(type, items, callback) {

    // Add a property to all types. You can use type to act only on certain
    // items of a certain type.
    for (var itemKey in items) {
      items[itemKey].someProperty = 'someValue';
    }

    // Alter only existing test object of the test type.
    if (type == 'test') {
      items['test'].anotherProperty = 'Some value.';
    }

    callback();
  }
};
