// Please install Express (npm install express) before running this example.

var Prana = require('../prana');
var express = require('express');

var application = new Prana();

// The prototype of our route creating extension.
var routeCreatingExtensionPrototype = {

  // The route() hook.
  route: function(routes, callback) {
    var newRoutes = {};

    // Add a route.
    newRoutes['/test'] = {
      callback: function(request, response) {
        response.send('Testing!');
      }
    };

    // Add another route.
    newRoutes['/test-altering'] = {
      callback: function(request, response) {
        response.send('Testing!');
      }
    };

    callback(null, newRoutes);
  }

};

// Add 'route-creating-extension' extension programmatically.
application.extension('route-creating-extension', {
  title: 'Route Creating Extension',
  description: 'This is just an example extension that add routes.',
  prototype: routeCreatingExtensionPrototype
});

// The prototype of our route altering extension.
var routeAlteringExtensionPrototype = {

  // The route() hook.
  route: function(routes, callback) {
    var newRoutes = {};

    // Alter the root (/test-altering) route.
    routes['/test-altering'].callback = function(request, response) {
      response.send('Testing altering a route!');
    };

    callback(null, newRoutes);
  }

};

// Add 'route-altering-extension' extension programmatically.
application.extension('route-altering-extension', {
  title: 'Route Altering Extension',
  description: 'This is just an example extension that add/alter routes.',
  prototype: routeAlteringExtensionPrototype,
  // Depends on route-creating-extension, so we make sue its routes are
  // available for altering.
  dependencies: ['route-creating-extension']
});

application.init(function(extensions) {
  // Express server.
  var server = express();

  // Retrieve and add all routes.
  application.collect('route', function(error, routes) {
    // Add all routes.
    for (var path in routes) {
      server.all(path, routes[path].callback);
    }

    // Initialize the web server.
    server.listen(3000, function() {
      console.log('Server initialized with the following routes:');
      Object.keys(routes).map(function(route) {
        console.log(route);
      });
    });
  });
});
