var Prana = require('../prana');

// Very simple usage of Prana: just make a basic CRUD interface with memory
// based storage.
var application = new Prana();

// Global event handler.
application.on('load', function(type, item) {
  // Do something with the loaded item.
  console.log('Global load event fired. Item type: ' + type.name + '.');
  console.log(item);
});

// Global event handler.
application.on('save', function(type, item) {
  // Do something with the just saved item.
  console.log('Global save event fired. Item type: ' + type.name + '.');
  console.log(item);
});

var cacheType = new Prana.Type('cache', {
  title: 'Cache',
  description: 'A very simple key/value cache storage mechanism.',
})

// Type specific event handler.
cacheType.on('save', function(item) {
  // Do something with the just saved item.
  console.log('Cache type specific save event fired.');
  console.log(item);
});

// Type specific event handler.
cacheType.on('list', function(item) {
  // Do something with the just saved item.
  console.log('Cache type specific list event fired.');
  console.log(item);
});

// Create a very simple 'in memory' cache storage type.
var Cache = application.type(cacheType);

// Create a new cache item.
var cache = new Cache({
  key: 'some-cache',
  value: 'some-cache-value'
});

// Save item to memory.
cache.save();

// Retrieve a list of cached data.
Cache.list({}, function(err, items) {
  console.log('A list of items');
  console.log(items);
});
