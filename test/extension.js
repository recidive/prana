var assert = require("assert");
var Prana = require('../prana');

describe('Extension', function() {
  var prana = new Prana();

  var extensionPrototype = {
    init: function(application, callback) {
      callback();
    },

    myInfo: function(data, callback) {
      callback(null, {
        'a-item': {
          aProperty: 'a value'
        }
      });
    },

    collect: function(type, data, callback) {
      if (type == 'myInfo') {
        data['a-item'].anotherProperty = 'another value';
      }
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

  it('should collect items from a hook', function(done) {
    prana.collect('myInfo', done);
  });

  it('should pick a item from a hook', function(done) {
    prana.pick('myInfo', 'a-item', done);
  });

  it('should alter items using the collect() hook', function(done) {
    prana.collect('myInfo', function(error, data) {
      if (error) {
        return done(error);
      }
      assert.equal('another value', data['a-item'].anotherProperty);
      done();
    });
  });

});
