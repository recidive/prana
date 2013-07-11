var Prana = require('../prana');

var application = new Prana();

// The prototype of our programmatic created extension.
var myProgrammaticExtensionPrototype = {

  // Add a type.
  type: function(types, callback) {
    types['myProgrammaticExtensionType'] = Prana.Model.compile(application, new Prana.Type('myProgrammaticExtensionType', {
      title: 'My Programmatic Extension Type',
      description: 'A type created by a programmatically added extension.'
    }));
    callback();
  }

};

// Add an extension programmatically.
application.extension(new Prana.Extension(application, 'my-programmatic-extension', myProgrammaticExtensionPrototype, {
  title: 'My Programmatic Extension',
  description: 'This is just an example extension.'
}));

// List all extensions to see the extension we created above. The 'extension' type is a core type.
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
    var extension = extensions[extensionName];
    application.extension(new Prana.Extension(application, extensionName, extension.prototype, extension.info));
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
