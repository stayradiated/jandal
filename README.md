# Jandal

An event handler for socket interfaces. It was built for use with
[SockJS](https://github.com/sockjs/sockjs-node), but can be used with any
socket interface, such as node streams.

It has a similar feature set to [Socket.io](http://socket.io), including rooms
and broadcasting.

## Important

Jandal has a maximum of three arguments per event. This restriction vastly
improves performance in most browsers and in nodejs.

This may sound harsh, but you probably don't need to use more than three args
anyway. You can always store extra args in an array or object.

There is also the deprecated
[multi-args branch](https://github.com/stayradiated/jandal/multi-args)
- but it is not kept up to date.

# Example Usage

## Server

Add it to your project with `npm install --save jandal`.

```javascript
var http, Jandal, sockjs, server, conn;

http   = require('http');
Jandal = require('jandal');
sockjs = require('sockjs');

// standard sockjs stuff
server = http.createServer();
conn = sockjs.createServer();
conn.installHandlers(server, { prefix: '/socket' });
server.listen(8080);

// Listen for new connections
conn.on('connection', function (socket) {
    var jandal;

    // wrap the socket in a Jandal
    jandal = new Jandal(socket, 'stream');

    // listening for the 'log' event
    jandal.on('log', function (text) {
        console.log('log: ' + text);
    });

    // listening for an event with a callback
    jandal.on('echo', function (text, callback) {
        callback(text);
    });

    // send an event to the client
    jandal.emit('weclome', {
        id: socket.id,
        time: Date.now()
    });

});
```

## Client

Grab a copy of `/client.js` from this repo, or use CommonJS compiler and
require `jandal/client`.

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

    // listen for events
    socket.on('welcome', function (info) {
        console.log(info);
    });

    // send a message to the server
    socket.emit('log', 'the time is' + Date.now());

    // Send a message to the server with a callback
    socket.emit('echo', 'hello', function (reply) {
        assert(reply === 'hello');
    });

});
```

## Rooms

```javascript

conn.on('connection', function (socket) {
    var jandal;

    // wrap the socket
    jandal = new Jandal(socket, 'stream');

    // add it to a room
    jandal.join('my_room');

    // emit to all other sockets in a room
    jandal.broadcast.to('my_room').emit('a new socket has joined', jandal.id);

    // remove it from a room
    jandal.leave('my_room');

});
```

# Jandal Class

## Static Properties

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

## Instance Properties

Every Jandal instance extends the NodeJS EventEmitter so you can also use
methods like: `once`, `removeAllListeners` and `setMaxListeners`. See the
[EventEmitter docs](http://nodejs.org/api/events.html) for more information.

### rooms

An array that holds all the rooms the socket is currently joined to.

### connect(socket, handle)

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


### emit(event, arg1, arg2, arg3)

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


### on(event, listener)

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

### namespace(name)

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

### join(room)

Put the socket in a room.

**Parameters:**

- room (string) : name of the room

**Example:**

```javascript
jandal.join('my-room');
```

### leave(room)

Remove the socket from a room.

**Parameters:**

- room (string) : name of the room

**Example:**

```javascript
jandal.leave('my-room');
```

### room(room)

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

### release()

Remove the socket from all the rooms it is currently in.

**Example:**

```javascript
jandal.release();
```

# Room Class

## Instance Methods

Rooms are just a collection of sockets. You can add or remove sockets from
them, and emit events to all sockets in that room, or broadcast events from a
socket to all other sockets.

Every socket is added to the 'all' room, which can be acessed through
`Jandal.all`.

### length()

Returns the number of connected sockets in a room.

**Example:**

```javascript
Jandal.in('my-room').length();
```

### contains(jandal)

Check if a socket is in a room. Returns `true` or `false`.

**Parameters**

- jandal (Jandal) : an instance of a Jandal

**Example:**

```javascript
var a, b;

a = new Jandal();
a.join('my-room');

b = new Jandal();

Jandal.in('my-room').contains(a); // true
Jandal.in('my-room').contains(b); // false
```

### emit(event, arg1, arg2, arg3)

Exactly the same as `jandal.emit` but will be sent to all connected sockets.

**Parameters:**

- event (string) : name of the event
- arg1 (dynamic)
- arg2 (dynamic)
- arg3 (dynamic)

**Example:**

```javascript
Jandal.in('my-room').emit('hello', 1, 2, 3);
```

### broadcast(sender, event, arg1, arg2, arg3)

Just like emit, but will not send to the 'sender' socket.

**Parameters:**

- sender (dynamic)
- event (string)
- arg1 (dynamic)
- arg2 (dynamic)
- arg3 (dynamic)

**Example:**

```javascript
Jandal.in('my-room').broadcast('some-id', 'bye', 1, 2, 3);
```

### namespace(name)

Get a namespace for a room.

**Parameters:**

- name (string) : the name of the namespace

**Example:**

```javascript
Jandal.in('my-room').namespace('tasks').emit('create', 'something');
```

### destroy()

Destroy all sockets in a room

```javascript
Jandal.in('my-room').destroy()
```

# Protocol

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

**Callbacks:**

Each message can have a single callback. The callback must be the last
arguments, and can only be called once.

Callbacks are just like regular events, so you can also have a callback
on a callback.

```javascript
// send a message with a callback
app.login('username', 'password').fn(32)

// response running the callback with args
socket.fn_23({login: success})

// callback with a callback
socket.fn_24({login: fail}).fn(25)
```

# Browsers

The same code can be run in the browser by using Browserify.

This also allows you to use the library to communicate between servers, as it
acts as the client and the server.

To compile for the browser:

    npm run-script build

And then either copy/paste the `client.js` file into your project, or
include it via `require('jandal/client');`.

# Changelog

## 0.0.15

- When broadcasting from a socket, check `socket.id !== sender` instead of
  `socket !== sender`. This requires all sockets to have an 'id' attribute.
- Use the `socket` namespace instead of `Jandal` for handling callbacks.
- Make `serialize` and `parse` private methods of a Jandal instance.
- Make `namespaces` and `callbacks` private properties of a Jandal instance.
- Fix bug where Jandal would crash if a callback is called more than once
- Make `Room.prototype.join` and `Room.prototype.leave` private.
- Fix bug where a socket could be added to the same room twice
