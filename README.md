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

### jandal.rooms

An array that holds all the rooms the socket is currently joined to.

### jandal.connect

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


### jandal.emit

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


### jandal.on

Works very similar to the EventEmitter.

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

### jandal.namespace

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

### jandal.join

Put the socket in a room.

**Parameters:**

- room (string) : name of the room

**Example:**

```javascript
jandal.join('my-room');
```

### jandal.leave

Remove the socket from a room.

**Parameters:**

- room (string) : name of the room

**Example:**

```javascript
jandal.leave('my-room');
```

### jandal.room

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

### jandal.release

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

### room.length

Returns the number of connected sockets in a room.

**Parameters:**

*No parameters*

**Example:**

```javascript
Jandal.in('my-room').length();
```

### room.contains

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

### room.emit

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

### room.broadcast

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

### room.namespace

Get a namespace for a room.

**Parameters:**

- name (string) : the name of the namespace

**Example:**

```javascript
Jandal.in('my-room').namespace('tasks').emit('create', 'something');
```

### room.destroy

Destroy all sockets in a room

```javascript
Jandal.in('my-room').destroy()
```

# Handle

Handles are used as an interface between Jandal and a socket.

There are two handles bundled by default: `stream` and `websocket`.

## Default Handles

### Stream

Works with SockJS-Node

**Source Code:**

```javascript
stream: {
    identify: function (socket) {
        return socket.id;
    },
    write: function (socket, message) {
        socket.write(message);
    },
    onread: function (socket, fn) {
        socket.on('data', fn);
    },
    onclose: function (socket, fn) {
        socket.on('close', fn);
    },
    onerror: function(socket, fn) {
        socket.on('error', fn);
    },
    onopen: function(socket, fn) {
        setTimeout(fn, 0);
    },
    release: function (socket) {
        socket.removeAllListeners('data');
        socket.removeAllListeners('close');
        socket.removeAllListeners('error');
    }
}
```

### WebSocket

Works with the WebSocket API (and also SockJS-Client).

**Source Code:**

```javascript
websocketsId = 0;

...

websocket: {
    identify: function (socket) {
        if (socket.hasOwnProperty('id')) return socket.id;
        socket.id = ++websocketsId;
        return socket.id;
    },
    write: function (socket, message) {
        socket.send(message);
    },
    onread: function (socket, fn) {
        socket.onmessage = function (e) { fn(e.data); };
    },
    onclose: function (socket, fn) {
        socket.onclose = fn;
    },
    onerror: function(socket, fn) {
        socket.onerror = fn;
    },
    onopen: function(socket, fn) {
        socket.onopen = fn;
    },
    release: function (socket) {
        delete socket.onmessage;
        delete socket.onclose;
        delete socket.onerror;
        delete socket.onopen;
    }
}
```

## Methods

### identify

Return something that identifies this socket, like an ID.

**Parameters:**

- socket (Socket) : the socket to identify

**Example:**

```javascript
var handler = {
    identify: function (socket) {

        // if your sockets already have an id
        return socket.id;

        // maybe assign an id?
        // HINT: better to use
        return socket.id || socket.id = ++someNumber;

        // if you don't care about anything
        return socket;

    }
};
```

### write

Write a message to the socket. Will be called whenever a message needs to be
sent.

**Parameters:**

- socket (socket) : the socket to send the message with
- message (string) : the message to send

**Example:**

```javascript
var handler = {
    write: function (socket, message) {
        socket.write(message);
    }
};
```

### onread

Listen for messages. Will be called once per each socket. Expects the `fn`
callback to be passed a message whenever one is sent.

**Parameters:**

- socket (socket) : the socket to listen to
- fn (function) : the callback to run

**Callback Parameters:**

- message (string) : the message that has been sent to the socket

**Example:**

```javascript
var handler = {
    onread: function (socket, fn) {
        socket.on('read', fn);
    }
};
```

### onerror(socket, fn)

Listen for errors on the socket. Will be called only once per each socket.
Expects `fn` to be called whenever the socket has an error. Accepts one
argument that will be be passed through to the `socket.error` event.

**Parameters:**

- socket (socket) : the socket to listen to
- fn (function) : the callback to run

**Callback Parameters:**

- err (dynamic) : an error message

**Example:**

```javascript
var handler = {
    onerror: function (socket, fn) {
        socket.on('error', function (err) {
            fn(err);
        });
    }
};
```

### onopen(socket, fn)

Listen for the socket connection to be opened. Will be called once per each
socket. Expects the `fn` callback to called once when the socket has connected.
If the socket is already open, the you can run the callback immediately. Will
be passed through to the `socket.open` event.

**Parameters:**

- socket (socket) : the socket to listen to
- fn (function) : the callback to run

**Callback Parameters:**

- event (dymanic) : an optional argument to pass through to `socket.open`

**Example:**

```javascript
var handler = {
    onopen: function (socket, fn) {
        socket.on('open', fn);
    }
};
```

### onclose(socket, fn)

Listen for the socket to be closed. Will be called once per each socket.
Expects the `fn` callback to be called only once, and only when the socket has
been closed. Arguments will be passed through to the `socket.close` event.

**Parameters:**

- socket (socket) : the socket to listen to
- fn (function) : the callback to run

**Callback Parameters:**

- status (number) : error code
- message (string) : error message

**Example:**

```javascript
var handler = {
    onclose: function (socket, fn) {
        socket.on('close', fn);
    }
};
```

### release(socket)

Disconnect the raw socket from the jandal instance.

**Parameters:**

- socket (socket) : the socket to listen to

**Example:**

```javascript
var handler = {
    release: function (socket) {
        socket.off('data');
        socket.off('open');
        socket.off('close');
        socket.off('error');
    }
};
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

# License

The MIT License (MIT)

Copyright (c) 2014 George Czabania

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

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
- Remove `Jandal.handle()`. Instead pass the handler to the `Jandal`
  constructor. e.g: `new Jandal(socket, 'stream');`.
- Replace `room.destroy()` with `room.empty()`. No longer destroys room, just
  removes all the connected sockets.
- Remove `Room.remove()`.
- Add MIT License
- Switch from `var = a, b, c;` to `var a = 1; \n var b = 2; var c = 3;`

## 0.0.14

- Rebuild client.js

## 0.0.13

- The `onclose` handler now accepts two arguments that will be passed through
  to the `socket.close` event.

## 0.0.12

- Move `client.js` to the root directory. You should now use
  `require('jandal/client')`.
- Allow users to supply a custom socket handler.

## 0.0.11

- Add socket events: `socket.open`, `socket.close`, `socket.error`.
- Fix an off by error with `Socket.prototype.serialize`, where callbacks could
  not be the last argument.

## 0.0.10

- Use `.fn(20)` instead of `__fn__20` for callbacks.
- Make sure that `Socket.prototype.parse` will only accept strings.

## 0.0.9

- Protect `Socket.prototype.parse` against crashing on invalid messages.

## 0.0.8

- Add `Socket.prototype.room` to access rooms from a jandal instance.
- Limit event arguments to a maximum of three.

## 0.0.7

- Clean up code.
- Add examples to readme.

## 0.0.6

- Use browserify to compile for browsers.
- Use uglify to minify `client.js`.

## 0.0.5

- Set `main` to `source/jandal.js`.

## 0.0.4

- Add namespaces to broadcasting
- Redo the room api

## 0.0.3

- Split code into multiple files.
- Add support for sorting sockets into rooms

## 0.0.2

- Use handles to interface betwen jandals and sockets.
- Fix bug with parsing messages.
- Add `Jandal.noConflict` for browsers.

## 0.0.1

- Start project
- Write `jandal.js` and tests
- Can serialize and parse messages
- Add namespaces
- Can emit messages and listen for them
- Add callback functions
