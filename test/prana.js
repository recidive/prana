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

  it('should scan a folder for extensions', function(done) {
    var prana = new Prana();

    // Scan a folder for extensions.
    prana.loadExtensions(__dirname + '/extensions', function(error, extensions) {
      if (error) {
        throw error;
      }

      assert.ok(Object.keys(extensions).length > 0);

      prana.init(function(extensions) {

        assert.ok(Object.keys(extensions).length > 0);

        // Retrieve all items of "test" type.
        prana.collect('test', function(error, tests) {

          assert.ok(Object.keys(tests).length > 0);
          assert.ok('test' in tests);
          assert.ok('newTest' in tests);

          done();
        });
      });
    });

  });


});
