# Prana

Prana is a microframework for building modular applications.

Prana provides a declarative way of building all kind of application structures. You can use Prana to declare and manipulate everything from application settings to navigation structures.

Prana has an extensions system and a data collector that helps with bringing organization, code reusability and extensibility to your project.

## Installation

    $ npm install prana

## Examples

For examples check the [examples folder](https://github.com/recidive/prana/tree/master/examples).

## Extensions

Things start to get more interesting when we add some extensions to the loop.

You can add extensions programmatically like this:

```js
// The prototype of our programmatically created extension.
var myExtensionPrototype = {

  // The list hook allow you to alter every item on the system they get listed.
  list: function(type, items, callback) {
    // Add a property to all types. You can use type to act only on certain
    // items of a certain type.
    for (var itemKey in items) {
      items[itemKey].property = 'value';
    }
    callback();
  }

};

// Add an extension programmatically.
application.extension('my-extension', {
  title: 'My Extension',
  description: 'This is just an example extension.',
  prototype: myExtensionPrototype
});
```

You can also scan a directory for extensions:

```js
// Scan a folder for extensions and add them.
application.loadExtensions(__dirname + '/extensions', function(err, extensions) {
  // Do something with the just loaded extensions.
  console.log('Loaded %d extensions.', Object.keys(extensions).length);
});
```

This will look for two kind of files one named EXTENSIONNAME.extension.json that contains extension information. And EXTENSIONNAME.js that contains the extension protoype.

For example, you can have a folder called 'example' in the 'extensions' dir with example.extension.json and example.js files with the following content:

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

  // The list hook allow you to alter every item on the system they get listed.
  list: function(type, items, callback) {
    // Add a property to all types. You can use type to act only on items of a
    // specific type.
    for (var itemKey in items) {
      items[itemKey].property = 'value';
    }
    callback();
  }

};
```

## Coding style

We try to conform to [Felix's Node.js Style Guide](https://github.com/felixge/node-style-guide)
for all of our JavaScript code. For coding documentation we use [JSDoc](http://usejsdoc.org/)
style.
