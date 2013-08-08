var Prana = require('../prana');

var application = new Prana();

// The prototype of our programmatically created extension.
var myProgrammaticExtensionPrototype = {

  // The type() hook.
  type: function(types, callback) {
    var newTypes = {};

    // Add a type to this object and pass it as argument to the callback to have
    // medata processed and a type created properly.
    newTypes['myProgrammaticExtensionType'] = {
      title: 'My Programmatic Extension Type',
      description: 'A type created by a programmatically added extension.'
    };

    callback(newTypes);
  }

};

// Add an extension programmatically.
application.extension('my-programmatic-extension', {
  title: 'My Programmatic Extension',
  description: 'This is just an example extension.',
  prototype: myProgrammaticExtensionPrototype
});

// List all extensions to see the extension we created above. The 'extension'
// type is a core type.
var Extension = application.type('extension');
Extension.list({}, function(err, items) {
  console.log('A list of extensions');
  console.log(items);
});

// List all types to see the type created by our programmatic added extension.
// Just like the 'extension' type, the 'type' type is a core type.
var Type = application.type('type');
Type.list({}, function(err, items) {
  console.log('A list of types');
  console.log(items);
});

// Scan a folder for extensions.
Prana.Extension.scan(__dirname + '/extensions', function(err, extensions) {
  console.log('Found extensions');
  console.log(extensions);

  // Add all found extensions.
  for (var extensionName in extensions) {
    var settings = extensions[extensionName];
    application.extension(extensionName, settings);
  }

  // List all extensions again. The 'extension' type is a core type.
  Extension.list({}, function(err, items) {
    console.log('A list of extensions');
    console.log(items);
  });

  // List all types again to see the type created by our external extension.
  Type.list({}, function(err, items) {
    console.log('A list of types');
    console.log(items);
  });

  // Get type 'myProgrammaticExtensionType' created by the extension.
  var MyProgrammaticExtensionType = application.type('myProgrammaticExtensionType');
  var MyProgrammaticExtensionTypeItem = new MyProgrammaticExtensionType({
    key: 'test',
    title: 'Test'
  });
  MyProgrammaticExtensionTypeItem.save();
  MyProgrammaticExtensionType.list({}, function(err, items) {
    console.log('A list of MyProgrammaticExtensionType items');
    console.log(items);
  });
});
