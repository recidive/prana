var assert = require("assert");
var Prana = require('../prana');

describe('Extension', function() {
  var prana = new Prana();

  var extensionPrototype = {
    // The type() hook.
    type: function(types, callback) {
      var newTypes = {};

      newTypes['testProgrammaticExtensionType'] = {
        title: 'Test Programmatic Extension Type',
        description: 'A type created by a programmatically added extension.'
      };

      callback(null, newTypes);
    }

  };

  var testProgramaticExtension = prana.extension('test-programatic-extension', {
    title: 'Test Programatic Extension',
    description: 'This is just an extension for testing purposes.',
    prototype: extensionPrototype
  });

  prana.init(function(extensions, types) {
    it('should create an usable type', function(done) {
      var TestProgrammaticExtensionType = prana.type('testProgrammaticExtensionType');
      var testProgrammaticExtensionType = new TestProgrammaticExtensionType({key: 1, val: 2});
      assert.ok(testProgrammaticExtensionType instanceof Prana.Model);
      done();
    });
  });

});
