var assert = require("assert");
var Prana = require('../prana');

describe('Extension', function() {
  var prana = new Prana();

  var extensionPrototype = {
    init: function(application, callback) {
      callback();
    }
  };

  var testProgramaticExtension = prana.extension('test-programatic-extension', {
    title: 'Test Programatic Extension',
    description: 'This is just an extension for testing purposes.',
    prototype: extensionPrototype
  });

  it('should initialize prana', function(done) {
    prana.init(function(extensions, types) {
      done();
    });
  });

});
