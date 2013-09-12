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

    callback(null, newTypes);
  }

};

// Add an extension programmatically.
application.extension('my-programmatic-extension', {
  title: 'My Programmatic Extension',
  description: 'This is just an example extension.',
  prototype: myProgrammaticExtensionPrototype
});

// Scan a folder for extensions.
application.loadExtensions(__dirname + '/extensions', function(err, extensions) {
  if (err) {
    throw err;
  }

  console.log('Loaded %d extensions.', Object.keys(extensions).length);
  console.log('Found extensions');
  console.log(extensions);

  // When using extensions it's better to call init() to make sure all
  // extensions and types are loaded.
  application.init(function(extensions, types) {
    // List all extensions to see the extension we created programatically
    // above and the one created we have scanned. The 'extension' type is a
    // core type.
    var Extension = application.type('extension');
    Extension.list({}, function(err, items) {
      console.log('A list of extensions');
      console.log(items);

      // List all types to see the type created by our programmatic added and
      // by the scanned extensions. Just like the 'extension' type, the 'type'
      // type is a core type.
      var Type = application.type('type');
      Type.list({}, function(err, items) {
        console.log('A list of types');
        console.log(items);
      });

      // Get 'example' type model created by the example.type.json file.
      var Example = application.type('example');
      var ExampleItem = new Example({
        key: 'test',
        title: 'Test'
      });
      ExampleItem.save(function(err, item) {
        // List Example items.
        Example.list({}, function(err, items) {
          console.log('A list of Example items');
          console.log(items);
        });
      });

      // Get 'myProgrammaticExtensionType' type created by the extension.
      var MyProgrammaticExtensionType = application.type('myProgrammaticExtensionType');
      var myProgrammaticExtensionTypeItem = new MyProgrammaticExtensionType({
        key: 'test',
        title: 'Test'
      });
      myProgrammaticExtensionTypeItem.save(function(err, item) {
        // list MyProgrammaticExtensionType items.
        MyProgrammaticExtensionType.list({}, function(err, items) {
          console.log('A list of MyProgrammaticExtensionType items');
          console.log(items);
        });
      });
    });
  });
});
