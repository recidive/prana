var assert = require("assert");
var Prana = require('../prana');

describe('Model', function() {

  var prana = new Prana();

  var SomeType = prana.type('someType', {
    title: 'Some Type',
    description: 'Some type for testing purposes.'
  });

  it('should save and load an item', function(done) {
    var item = new SomeType({
      key: 1,
      value: 'Some value'
    });

    item.save(function(error) {
      if (error) {
        throw error;
      }

      assert.ok(item);

      SomeType.load(1, function(error, item) {
        if (error) {
          throw error;
        }
        assert.ok(item);
        assert.ok(item instanceof SomeType);
        assert.ok(item instanceof Prana.Model);
        done();
      });
    });
  });

  it('should save and list items', function(done) {
    var item = new SomeType({
      key: 2,
      value: 'Some value'
    });

    item.save(function(error) {
      if (error) {
        throw error;
      }

      assert.ok(item);

      SomeType.list({}, function(error, items) {
        if (error) {
          throw error;
        }
        assert.ok(items);
        assert.ok(Object.keys(items).length > 0);
        done();
      });
    });
  });

  it('should save, load and delete an item', function(done) {
    var item = new SomeType({
      key: 3,
      value: 'Some value'
    });

    item.save(function(error) {
      if (error) {
        throw error;
      }

      assert.ok(item);

      SomeType.load(3, function(error, item) {
        if (error) {
          throw error;
        }
        assert.ok(item);
        assert.ok(item instanceof SomeType);
        assert.ok(item instanceof Prana.Model);

        item.delete(function(error, deletedItem) {
          if (error) {
            throw error;
          }
          assert.ok(deletedItem);

          SomeType.load(3, function(error, absentItem) {
            if (error) {
              throw error;
            }
            assert.ok(!absentItem);
            done();
          });
        });
      });
    });
  });

});
