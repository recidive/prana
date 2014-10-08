var Prana = require('../prana');

var application = new Prana();

// The prototype of our programmatically created extension.
var myProgrammaticExtensionPrototype = {

};

// Add an extension programmatically.
application.extension('my-programmatic-extension', {
  title: 'My Programmatic Extension',
  description: 'This is just an example extension.',
  prototype: myProgrammaticExtensionPrototype
});

// Scan a folder for extensions.
application.loadExtensions(__dirname + '/extensions', function(error, extensions) {
  if (error) {
    throw error;
  }

  console.log('Loaded %d extensions.', Object.keys(extensions).length);
  console.log('Found extensions');
  console.log(extensions);

  // When using extensions it's better to call init() to make sure all
  // extensions and types are loaded.
  application.init(function(extensions) {
    console.log('All extensions');
    console.log(extensions);

    console.log('Initialized!');

    // Retrieve all items of "example" type.
    application.collect('example', function(error, examples) {
      console.log(examples);
    });
  });

});
