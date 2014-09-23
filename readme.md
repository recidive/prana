# Prana

Prana is a microframework for building modular and extensible [node.js](http://nodejs.org) applications.

It provides an extensions system that helps bringing organization, code reusability and extensibility to your project.

Extensions can implement hooks for adding their bits of functionality. Hooks can also be used for adding and modifying all kind of application metadata, such as settings, database schema and other application related metadata that can be extended.

Prana also collects metadata from JSON files, so you can easily distribute your extensions with the metadata they need to run.

## Installation

    $ npm install prana

## Getting started

A very simple Prana application will look something like this:


```js
var Prana = require('prana');

var app = new Prana();

app.init(function(extensions) {
  // Do some application specific stuff.
});
```

For complete examples check the [examples folder](https://github.com/recidive/prana/tree/master/examples).

## Extensions

Extensions allow you to build reusable components that can be easily shared through applications or application instances.

You can add extensions programmatically like this:

```js
// The prototype of our programmatically created extension.
var myExtensionPrototype = {

  // The collect hook allow you to alter items of all types when they get
  // collected.
  collect: function(type, items, callback) {
    // Add a property to all types. You can use type to act only on items of a
    // specific type.
    for (var itemKey in items) {
      items[itemKey].property = 'value';
    }
    callback();
  }

};

// Add an extension programmatically.
app.extension('my-extension', {
  title: 'My Extension',
  description: 'This is just an example extension.',
  prototype: myExtensionPrototype
});
```

But it's usually more useful having Prana scan a folder for extensions:

```js
// Scan 'extensions' folder for extensions and add them.
app.loadExtensions(__dirname + '/extensions', function(error, extensions) {
  // Do something with the just loaded extensions.
  console.log('Loaded %d extensions.', Object.keys(extensions).length);
});
```

This will recursively scans a folder named 'extensions' looking for two kind of files: one named `{extension-name}.extension.json` that contains extension information. And `{extension-name}.js` that contains the extension prototype.

For example, you can have a folder called `example` inside the `extensions` folder of your application with `example.extension.json` and `example.js` files in it with the following content:

### example.extension.json

```json
{
  "title": "Example Extension",
  "description": "This is just an example extension."
}
```

### example.js

```js
var example = module.exports = {

  collect: function(type, items, callback) {
    // Add a property to all types. You can use type to act only on items of a
    // specific type.
    for (var itemKey in items) {
      items[itemKey].property = 'value';
    }
    callback();
  }

};
```

## Adding you own hooks

To add your hooks you can just use the `invoke()` method and your hook will be called on all extensions:

```js
var example = module.exports = {

  collect: function(type, items, callback) {
    // Invoke itemsDecoratorHook() on all extensions.
    // This is where we "create" our hook.
    this.invoke('itemsDecoratorHook', items, callback);
  },

  itemsDecoratorHook: function(items, callback) {
    // Add a property to all types. You can use type to act only on items of a
    // specific type.
    for (var itemKey in items) {
      items[itemKey].property = 'value';
    }
    callback();
  }

};
```

## Collector hooks

Collector hooks provides a clever way for collecting metadata from hooks and JSON files for using in your application. You can implement collector hooks by using the `collect()` and `pick()` methods:

```js
// Collect all items of type 'my-type'.
app.collect('my-type', function(error, items) {
  console.log(items);
});

// Pick a single item of type 'my-type' with key 'my-item-key'.
app.pick('my-type', 'my-item-key', function(error, item) {
  console.log(item);
});
```

## Coding style

We try to conform to [Felix's Node.js Style Guide](https://github.com/felixge/node-style-guide)
for all of our JavaScript code. For coding documentation we use [JSDoc](http://usejsdoc.org/)
style.
