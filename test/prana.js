var assert = require("assert");
var Prana = require('../prana');

describe('Prana', function() {

  it('should add an extension', function(done) {
    var prana = new Prana();

    var someExtension = prana.extension('some-extension', {
      title: 'Some Extension',
      description: 'This is just an extension for testing purposes.',
      prototype: {}
    });
    assert.ok(someExtension instanceof Prana.Extension);

    var someExtensionAgain = prana.extension('some-extension');
    assert.equal(someExtensionAgain, someExtension, 'Both extensions are the same.');
    done();
  });

});
