Jandal
======

Event handler for [SockJS](https://github.com/sockjs/sockjs-node).

## Important

Jandal will allow you to emit a maximum of three arguments. This is purely to
improve performance in most browsers and in nodejs.

There is the
[multi-args branch](https://github.com/stayradiated/jandal/multi-args)
branch - but it is not kept up to date. If you need to use more than three
args, open an issue and we can sort something out.

## Usage

### Server

```javascript
var http, Jandal, sockjs, server, conn;

http   = require('http');
Jandal = require('jandal');
sockjs = require('sockjs');

// standard sockjs stuff
server = http.createServer();
conn = sockjs.createServer();
conn.installHandlers(server, { prefix: '/socket' });

// Handle new connections
conn.on('connection', function (socket) {

    // wrap a socket in a jandal
    jandal = new Jandal(socket, 'stream');

    // bind jandal events
    jandal.on('echo', function (text, fn) {
        fn('server: ' + text);
    });

});

// Start server
server.listen(8080);
```

## Client

```javascript
var conn, socket;

// use browserify
// or load the libraries as seperate scripts
require('sockjs');
require('jandal/client');

conn = new SockJS('http://localhost:8080/socket');
socket = new Jandal(conn, 'websocket');

// Wait for socket to connect
socket.on('socket.open', function () {

    // Send a message to the server with a callback
    socket.emit('echo', 'hello', function (reply) {
        console.log(reply); //=> "server: hello"
    });

});
```

# Documentation

## Protocol

Jandal uses a simple protocol for encoding messages. It's based on the
javascript syntax for objects and functions. Arguments are encoded using
JSON.stringify.

There are four parts to a message:

- namespace
- event
- args
- callback

The namespace and callback are both optional.

**Example messages:**

```javascript
// event + single arg
fetch("info")

// event + multiple args
fetch("info",{"count":40})

// event + arg + callback
fetch("info").fn(10)

// namespace + event + arg
user.load("numbers",[10,20,30])

// namespace + event + arg + callback
task.create({"name":"this is a new task"}).fn(1)
```

## Jandal: Class

The `Jandal` class has a couple of static properties useful for managing
connected sockets.

### Jandal.all

This is a `Room` instance that holds all the connected sockets. See the `Room`
docs for more info.

**Example:**

```javascript
// Emitting
Jandal.all.emit('hello', 1, 2,3);

// Broadcasting
Jandal.all.broadcast('socket-id', 'hello', 1, 2, 3);
```

### Jandal.in(room)

Easily access any sockets in any room. See the `Room` docs for more info.

**Parameters:**

- room (string) : the name of the room

**Example:**

```javascript
Jandal.in('my-room').emit('hello');
```

## Jandal: Instance

Every Jandal instance extends the NodeJS EventEmitter so you can also use
methods like: `once`, `removeAllListeners` and `setMaxListeners`. See the
[EventEmitter docs](http://nodejs.org/api/events.html) for more information.

### jandal.rooms

An array that holds all the rooms the socket is currently joined to.

### jandal.connect(socket, handle)

**Parameters:**

- socket (object) : an object that represents a socket
- handle (string|object) : a handle name or an object to use as a handle

**Example:**

```javascript
var jandal, conn;

jandal = new Jandal();
conn = new SockJS(config.url);

jandal.connect(conn, 'websocket');
```

**Example with custom handles:**

```javascript
var jandal, handle, socket;

jandal = new Jandal();

socket = new EventEmitter();

handle = {
    write: function (socket, message) {
        socket.emit('message', message);
    },
    onread: (socket, fn) {
        socket.on('message', fn);
    },
    ...
};

jandal.connect(socket, handle);
```


### jandal.emit(event, arg1, arg2, arg3)

This is very similar to the NodeJS EventEmitter, but you are limited to three
arguments.

**Parameters:**

- event (string) : the event to emit
- arg1 (dynamic)
- arg2 (dynamic)
- arg3 (dynamic)

Arguments can be strings, numbers, booleans, dates, objects, arrays, etc...
Basically anything that `JSON.stringify` can handle.

**Callbacks:**

You can also send one function for use as a callback.

- It must always be passed as the last argument.
- Callbacks will only be run once.
- They can take 0 to 3 arguments.

**Example:**

```javascript
var jandal;
jandal = new Jandal();

// lots of different data types
jandal.emit('my-event', 'arg 1', ['arg 2'], {arg: 3})

// passing functions as callbacks
jandal.emit('my-callback', 'some data', function (response) {
    console.log('running the callback with', response);
});
```


### jandal.on(event, listener)

Works very similar to the EventEmitter.

However, watch out for namespaces. Listening for `namespace.event` will not
work. You need to get the namespace?

**Parameters:**

- event (string) : event to listen for
- listener (function) : function to run when the event is emitted

**Example:**

```javascript
jandal.on('my-event', function (arg1, arg2, arg3) {
    console.log('"my-event" has been emitted with', arguments);
});

// listening for a namespace + event
jandal.on('task.create', listener);

// this is the same as
jandal.namespace('task').on('create', listener);
```

### jandal.namespace(name)

Return a new Namespace instance. If the namespace already exists, it will
use that instead of creating a new one. See the `Namespace` docs for more info.

**Parameters:**

- name (string) : namespace name

**Example:**

```javascript
var jandal, ns;

jandal = new Jandal();
ns = jandal.namespace('app');

// sends "app.hello()"
ns.emit('hello');

// listens for "app.goodbye"
ns.on('goodbye', function () {
    console.log('bye');
});
```

### jandal.join(room)

Put the socket in a room.

**Parameters:**

- room (string) : name of the room

**Example:**

```javascript
jandal.join('my-room');
```

### jandal.leave(room)

Remove the socket from a room.

**Parameters:**

- room (string) : name of the room

**Example:**

```javascript
jandal.leave('my-room');
```

### jandal.room(room)

Returns a room. Same as `Jandal.in`.

**Parameters:**

- room (string) : name of the room

**Example:**

```javascript
// add the socket to the room
jandal.join('my-room');

// get the room
var room = jandal.room('my-room');

// emit to all the sockets in the room
room.emit('hello');
```

### jandal.release()

Remove the socket from all the rooms it is currently in.

**Example:**

```javascript
jandal.release();
```


### Callbacks

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

### Rooms

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

And then either copy/paste the `client.js` file into your project, or
include it via `require('jandal/client');`.

## Changelog

### 0.0.15

- When broadcasting from a socket, check `socket.id !== sender` instead of
  `socket !== sender`. This requires all sockets to have an 'id' attribute.
- Use the `socket` namespace instead of `Jandal` for handling callbacks.
- Make `serialize` and `parse` private methods of a Jandal instance.
- Make `namespaces` and `callbacks` private properties of a Jandal instance.
