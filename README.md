Jandal
======

Event handler for [SockJS](https://github.com/sockjs/sockjs-node).

## How it's going to work

The idea is that we have a standard [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) handling the events, and that we serialize the information as text in the following way:

    <namespace>.<event>(<args>)

I think this keeps messages short, simple and easy to read. Compare it something that uses JSON objects:

    {"<namespace>":{"event":"<event>","args":[<args>]}}


## Callbacks

This allows you to send a function across the websocket, and have the other
side execute it when they want to.

    /* CLIENT */

    jandal.emit('getPrice', 'apples', function (price) {
        console.log('apples cost', price);
    });

    /* SERVER */

    var products = {
        apples: 2.50
    };

    jandal.on('getPrice', function (product, callback) {
        var price = prices[product];
        callback(price);
    });

Note: You can also send functions from the server and have the client execute
them.

This works by giving each callback an id, and sending that in it's place.

    // sending a function to the server

    getPrice('apples', '__fn__20')

    // running the callback with arguments

    __fn__20(2.5)

The default template for callbacks is `__fn__<id>`. This will be able to be
changed if it clashes with your event names or arguments.


## Browsers

The same code can be run in the browser by using Browserify.

This also allows you to use the library to communicate between servers, as it
acts as the client and the server.
