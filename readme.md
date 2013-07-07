# Prana

Prana is a micro framework for building extensible applications with strong code reusability features.

Prana has some breakthrough concepts that makes building complex applications very easy. You can use Prana for building not only web applications but also other kind of applications, such as command line applications, sockets, etc.

The Prana core is formed of types, events and extensions. You can define your own types, describing business objects of your application:

    var application = new Prana();
    application.type(new Prana.Type('myType', {
      title: 'My Type',
      description: 'This is one of my application types.'
    });

You can then start adding objects of that type, in an active records fashion:

    var MyType = application.type('myType');
    var myTypeInstance = new MyType({
      key: 1,
      someOtherProperty: 'The value of another property MyType has.'
    });
    myTypeInstance.save();

There's also the application.new() shortcut you can use to create new objects:

    var myTypeInstance = application.new('myType', {
      key: 1,
      someOtherProperty: 'The value of another property MyType has.'
    });
    myTypeInstance.save();

In a similar way you save the item you can also get a list of items and also load a specific item from the storage:

    var MyType = application.get('myType');
    MyType.list(function(err, items) {
      // Do something with items.
    });
    MyType.load(1, function(err, item) {
      // Do something with item.
    });

For more examples check the examples folder.
