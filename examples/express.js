// Please install Express (npm install express) before running this example.

var Prana = require('../prana');
var express = require('express');

var application = new Prana();

// Create a route type. This may look a little verbose, but once you do that,
// Adding routes will be very easy. And you add the possibility for extensions
// to add their routes or to alter existing ones via routes() and list() hooks.
var Route = application.type('route', {
  title: 'Route',
  description: 'Routes are paths that links to callbacks.',
  keyProperty: 'path',
  process: function(name, item) {
    item.path = name;
    return item;
  }
});

// The prototype of our route altering extension.
var routeAlteringExtensionPrototype = {

  // The route() hook.
  route: function(routes, callback) {
    var newRoutes = {};

    // Add a route.
    newRoutes['/test'] = {
      callback: function(request, response) {
        response.send('Testing!');
      }
    };

    // Alter the root (/) route.
    routes['/'].callback = function(request, response) {
      response.send('Hello Altered World!');
    };

    callback(null, newRoutes);
  }

};

// Add an extension programmatically.
application.extension('route-altering-extension', {
  title: 'Route Altering Extension',
  description: 'This is just an example extension that add/alter routes.',
  prototype: routeAlteringExtensionPrototype
});

// Create the root route programmatically.
var route = new Route({
  path: '/',
  callback: function(request, response) {
    response.send('Hello World!');
  }
});

// Save a route.
route.save();

// Express server.
var server = express();

// Retrieve and add all routes.
Route.list({}, function(err, routes) {
  console.log(routes);
  // Add all routes.
  for (var path in routes) {
    server.all(path, routes[path].callback);
  }

  // Initialize the web server.
  server.listen(3000);
});
