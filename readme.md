# Prana

Prana is a micro framework for building extensible applications with strong code reusability features.

Prana has some breakthrough concepts that makes building complex applications very easy. You can use Prana for building not only web applications but also other kind of applications, such as command line applications, sockets, etc.

## Installation

    $ npm install prana

## Basic usage

The Prana core is formed of types, events and extensions. You can define your own types, describing business objects of your application:

```js
var Prana = require('prana');

var application = new Prana();
application.type(new Prana.Type('myType', {
  title: 'My Type',
  description: 'This is one of my application types.'
});
```

You can then start adding objects of that type, in an active records fashion:

```js
var MyType = application.type('myType');
var myTypeInstance = new MyType({
  key: 1,
  someOtherProperty: 'The value of another property MyType has.'
});
myTypeInstance.save();
```

There's also the application.new() shortcut you can use to create new objects:

```js
var myTypeInstance = application.new('myType', {
  key: 1,
  someOtherProperty: 'The value of another property MyType has.'
});
myTypeInstance.save();
```

In a similar way you save the item you can also get a list of items and also load a specific item from the storage:

```js
var MyType = application.get('myType');
MyType.list(function(err, items) {
  // Do something with items.
});
MyType.load(1, function(err, item) {
  // Do something with item.
});
```

For more examples check the examples folder.

## Events

Both Prana instances (applications) and types are Event Emitters, this means you can add listeners to react on events emitted by these objects.

There are list, load, save, delete events on both application and type scope.

```js
// Global event listener.
application.on('save', function(type, item) {
  console.log('Global save event fired. Item type: ' + type.name + '.');
});

// Define our type.
var someType = new Prana.Type('someType', {
  title: 'Some Type',
  description: 'Some example type.'
});

// Type specific event listener.
someType.on('save', function(item) {
  console.log('Some Type specific save event fired.');
});
```

You can then get the constructor of our type. Once save() method is called on a item all 'save' events are fired.

```js
var SomeType = application.type(someType);

// Create a new Some Type item.
var someTypeItem = new Cache({
  key: 'some-key',
  value: 'some-value'
});

// Save item to memory. Fire events.
someTypeItem.save();
```

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
application.extension(new Prana.Extension(application, 'my-extension', myExtensionPrototype, {
  title: 'My Extension',
  description: 'This is just an example extension.'
}));
```

You can also scan a directory for extensions:

```js
// Scan a folder for extensions.
Prana.Extension.scan(__dirname + '/extensions', function(err, extensions) {
  // Add all found extensions.
  for (var extensionName in extensions) {
    var extension = extensions[extensionName];
    application.extension(new Prana.Extension(application, extensionName, extension.prototype, extension.info));
  }
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

For more examples check the examples folder.
