Jandal
======

Event handler for [SockJS](https://github.com/sockjs/sockjs-node).

## Important

Jandal will allow you to emit a maximum of three arguments. This is purely to improve performance in most browsers and in nodejs.

If you need more than three arguments, you can use the [multi-args branch](https://github.com/stayradiated/jandal/multi-args).

## How it works

The idea is that we have a standard [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) handling the events, and that we serialize the information as text in the following way:

    <namespace>.<event>(<args>)

I think this keeps messages short, simple and easy to read. Compare it something that uses JSON objects:

    {"<namespace>":{"event":"<event>","args":[<args>]}}

## Server Example

    var http, Jandal, sockjs, server, conn;

    http   = require('http');
    Jandal = require('jandal');
    sockjs = require('sockjs');

    Jandal.handle('node');

    // standard sockjs stuff
    server = http.createServer();
    conn = sockjs.createServer();
    conn.installHandlers(server, {
        prefix: '/socket'
    };

    // create new sockets
    conn.on('connection', function (socket) {
        jandal = new Jandal(socket);
        jandal.on('message', function (text, fn) {
            fn('server: ' + text);
        });
    });

    // Start server
    server.listen(8080);

## Client Example

    var conn, socket;

    // require sockjs
    // require jandal/build/client

    Jandal.handle('sockjs');

    conn = new SockJS('http://localhost:8080/socket');
    socket = new Jandal(conn);

    socket.emit('message', 'hello', function (reply) {
        console.log(reply);
    });


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

    getPrice('apples').fn(20)

    // running the callback with arguments

    Jandal.fn_20(2.5)

## Rooms

Rooms are just a collection of sockets. You can add or remove sockets from
them, and emit events to all sockets in that room, or broadcast events from a
socket to all other sockets.

Every socket is added to the 'all' room, which can be acessed through
`Jandal.all`.

Adding a socket to a room.

    sock = new Jandal(socket);
    sock.join('my_room');

Removing a socket from a room

    sock.leave('my_room');

Emitting to all sockets

    Jandal.all.emit('message');

Emitting to all sockets in a room

    Jandal.all.in('my_room').emit('message');

    // Alternative
    sock.in('my_room').emit('message');

Broadcasting to all the other sockets

    sock.broadcast('hi everyone');

Broadcasting to other sockets in a room

    sock.broadcast.to('my_room').emit('a new socket has joined');

## Browsers

The same code can be run in the browser by using Browserify.

This also allows you to use the library to communicate between servers, as it
acts as the client and the server.

To compile for the browser:

    npm run-script build

And then either copy/paste the `build/client.js` file into your project, or
include it via `require('jandal/build/client');`.
