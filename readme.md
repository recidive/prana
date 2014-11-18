# ![Prana](http://pranajs.com/images/logo.png)

Prana is a microframework for building modular and extensible [node.js](http://nodejs.org) applications.

It provides an extensions system and metadata registry that help bringing organization, code reusability and extensibility to your project.

Extensions implement hooks for adding their bits of functionality and all kinds of application metadata, such as settings, database schema and other data elements that can be extended.

Beside hooks, Prana also collects data elements from JSON files, so you can easily distribute your extensions with everything they need in order to run.

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

Extensions allow you to build reusable components that can be easily shared through applications and application instances and also be extended by other extensions.

You can add extensions programmatically like this:

```js
// The prototype of our programmatically created extension.
var myExtensionPrototype = {

  // The myType() hook allow adding data elements for the 'myType' type and also
  // altering the items created by other extensions.
  myType: function(items, callback) {
    var myTypeItems = {};
    myTypeItems['some-item'] = {
      title: 'Some item'
    };
    callback(null, myTypeItems);
  },

  // The collect() hook allow you altering items of all types when they get
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

  // The collect() hook.
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

## Metadata registry

For getting metadata from the application registry you can use the `collect()` and `pick()` methods. Data elements will then be collected from hooks and JSON files.

```js
// Collect all items of type 'myType'.
app.collect('myType', function(error, items) {
  console.log(items);
});

// Pick a single item of type 'myType' with key 'some-item'.
app.pick('myType', 'some-item', function(error, item) {
  console.log(item);
});
```

This is also how you add your own types. I.e. calling `collect('myType', ...)` or `pick('myType', ...)` will automatically create the `myType()` hook for you.

## Coding style

We try to conform to [Felix's Node.js Style Guide](https://github.com/felixge/node-style-guide) for all of our JavaScript code. For coding documentation we use [JSDoc](http://usejsdoc.org/) style.
