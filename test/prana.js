var assert = require("assert");
var Prana = require('../prana');

describe('Prana', function() {

  it('should create a model for a type', function(done) {
    var prana = new Prana();

    var SomeType = prana.type('someType', {
      title: 'Some Type',
      description: 'Some type for testing purposes.'
    });

    var someItem = new SomeType({
      key: 1,
      value: 'Some value'
    });
    assert.ok(someItem instanceof Prana.Model);

    var SomeTypeAgain = prana.type('someType');
    assert.equal(SomeTypeAgain, SomeType);

    var Type = prana.type('type');

    Type.load('someType', function(err, item) {
      if (err) {
        throw err;
      }
      assert.ok(item);
      done();
    });
  });

  it('should store an extension', function(done) {
    var prana = new Prana();

    var someExtension = prana.extension('some-extension', {
      title: 'Some Extension',
      description: 'This is just an extension for testing purposes.',
      prototype: {}
    });
    assert.ok(someExtension instanceof Prana.Extension);

    var someExtensionAgain = prana.extension('some-extension');
    assert.equal(someExtensionAgain, someExtension, 'Both extensions are the same.');

    var Extension = prana.type('extension');

    Extension.load('some-extension', function(err, item) {
      if (err) {
        throw err;
      }
      assert.ok(item);
      assert.ok(item instanceof Prana.Extension);
      done();
    });
  });

});
