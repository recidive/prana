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

    item.save(function(err) {
      if (err) {
        throw err;
      }

      assert.ok(item);

      SomeType.load(1, function(err, item) {
        if (err) {
          throw err;
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

    item.save(function(err) {
      if (err) {
        throw err;
      }

      assert.ok(item);

      SomeType.list({}, function(err, items) {
        if (err) {
          throw err;
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

    item.save(function(err) {
      if (err) {
        throw err;
      }

      assert.ok(item);

      SomeType.load(3, function(err, item) {
        if (err) {
          throw err;
        }
        assert.ok(item);
        assert.ok(item instanceof SomeType);
        assert.ok(item instanceof Prana.Model);

        item.delete(function(err, deletedItem) {
          if (err) {
            throw err;
          }
          assert.ok(deletedItem);

          SomeType.load(3, function(err, absentItem) {
            if (err) {
              throw err;
            }
            assert.ok(!absentItem);
            done();
          });
        });
      });
    });
  });

});
