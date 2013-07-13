// Please install Express (npm install express) before running this example.

var Prana = require('../prana');
var express = require('express');

var application = new Prana();

// Create a route type. This may look a little verbose, but once you do that,
// Adding routes will be very easy. And you add the possibility for extensions
// to add their routes or to alter existing ones via routes() and list() hooks.
var Route = application.type(new Prana.Type('route', {
  title: 'Route',
  description: 'Routes are paths that links to callbacks.',
  keyProperty: 'path'
}));

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
  //
  for (var path in routes) {
    server.all(path, routes[path].callback);
  }

  // Initialize the web server.
  server.listen(3000);
});
