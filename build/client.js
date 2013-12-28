(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
(function () {

  'use strict';

  var attach, broadcast, broadcastTo, Room, allSockets;


  /*
   * Attach
   */

  attach = function (obj, self, name) {
    name = name || 'broadcast';
    self = self || obj;
    self[name] = broadcast(obj);
    self[name].to = broadcastTo(obj);
  };

  /*
   * Broadcast
   *
   * - event (string)
   * - args... (mixed)
   */

  broadcast = function (self) {
    return function (event) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(self);
      allSockets.broadcast.apply(allSockets, args);
    };
  };


  /*
   * Broadcast.to
   *
   * - room (string)
   */

  broadcastTo = function (self) {
    return function (room) {
      room = Room.get(room);
      return {
        emit: function (event) {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(self);
          room.broadcast.apply(room, args);
        }
      };
    };
  };


  /*
   * (Private) Init
   * Loads the room dependency
   * Can only be run once.
   *
   * - room (Room) : room class
   */

  attach.init = function (_room) {
    Room = _room;
    allSockets = Room.get('all');
  };


  module.exports = attach;

}());

},{}],3:[function(require,module,exports){
(function () {

  'use strict';

  var Callbacks;

  /*
   * Callbacks Constructor
   */

  Callbacks = function () {
    this.collection = {};
    this.index = 0;
  };


  /*
   * Register
   *
   * - fn (function) : the callback
   * > callback id (int)
   */

  Callbacks.prototype.register = function (fn) {
    this.collection[this.index] = fn;
    return this.index++;
  };


  /*
   * Exec
   * Deletes the callback afterwards so it can only be executed once.
   *
   * - id (int) : callback id
   * - args (array) : arguments
   */

  Callbacks.prototype.exec = function (id, args) {
    this.collection[id].apply(this, args);
    delete this.collection[id];
  };


  module.exports = Callbacks;

}());

},{}],4:[function(require,module,exports){
(function () {

  'use strict';

  var jandalHandles;

  /*
   * Can you handle the jandal?
   */

  jandalHandles = {

    node: {
      write: function (socket, message) {
        socket.write(message);
      },
      read: function (socket, fn) {
        socket.on('data', fn);
      },
      close: function (socket, fn) {
        socket.on('close', fn);
      }
    },

    sockjs: {
      write: function (socket, message) {
        socket.send(message);
      },
      read: function (socket, fn) {
        socket.onmessage = function (e) {
          fn(e.data);
        };
      },
      close: function (socket, fn) {
        socket.onclose = fn;
      }
    }

  };

  module.exports = jandalHandles;

}());

},{}],5:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};(function (root) {

  'use strict';

  var previousJandal, Socket, handles, Jandal;


  /*
   * Setup
   */

  previousJandal = root.Jandal;


  /*
   * Dependencies
   */

  Socket = require('./socket');
  handles = require('./handles');


  /*
   * Jandal
   */

  Jandal = Socket;


  /*
   * (Static) Handle
   * Choose how to attach to the socket
   *
   * - name (string) : a key from handles (currently 'node' or 'sockjs')
   */

  Jandal.handle = function (name) {
    var handle = handles[name];
    if (! handle) {
      throw new Error('Jandal handler "' + name + '"could not be found');
    }
    Jandal._handle = handle;
  };


  /*
   * (Static) noConflict
   *
   * > Jandal
   */

  Jandal.noConflict = function () {
    root.Jandal = previousJandal;
    return Jandal;
  };


  /*
   * Exporting Jandal through module.exports or window.Jandal
   */

  if (typeof global.process !== 'undefined') {
    module.exports = Jandal;
  } else {
    root.Jandal = Jandal;
  }

}(this));

},{"./handles":4,"./socket":8}],6:[function(require,module,exports){
(function () {

  'use strict';

  var Namespace, broadcastFrom, EventEmitter, inherits; 


  /*
   * Dependencies
   */

  broadcastFrom = require('./broadcast');
  EventEmitter = require('events').EventEmitter;
  inherits = require('./util').inherits;


  /*
   * Namespace Constructor
   *
   * - name (string)
   * - item (socket) : a single socket
   * - item (room) : a collection of sockets
   */

  Namespace = function (name, item) {
    Namespace.super_.call(this);

    this.name = name;
    this.item = item;

    broadcastFrom(this.item, this, '_broadcast');
    delete this.broadcast.to;
  };


  /*
   * Inherit from EventEmitter
   */

  inherits(Namespace, EventEmitter);
  Namespace.prototype._emit = EventEmitter.prototype.emit;


  /*
   * Emit
   *
   * - event (string)
   * - args... (mixed) : any other data you want to send
   */

  Namespace.prototype.emit = function (event) {
    arguments[0] = this.name + '.' + event;
    this.item.emit.apply(this.item, arguments);
  };


  Namespace.prototype.broadcast = function (event) {
    arguments[0] = this.name + '.' + event;
    this._broadcast.apply(this, arguments);
  };

  module.exports = Namespace;

}());

},{"./broadcast":2,"./util":9,"events":1}],7:[function(require,module,exports){
(function () {

  'use strict';

  var Room, Namespace;


  /*
   * Dependencies
   */

  Namespace = require('./namespace');


  /*
   * Room Constructor
   */

  Room = function (id) {
    this.id = id;
    this.sockets = [];
    this.namespaces = {};
  };


  /*
   * (Static) Rooms
   * Holds all the rooms in existance
   */

  Room.rooms = {};


  /*
   * (Static) Get
   * Get or create a room
   *
   * - id (string)
   * > room
   */

  Room.get = function (id) {
    var room;
    room = Room.rooms[id];
    if (! room) {
      room = Room.rooms[id] = new Room(id);
    }
    return room;
  };


  /*
   * (Static) Remove
   * Remove an entire room
   *
   * - id (string)
   */

  Room.remove = function (id) {
    delete Room.rooms[id];
  };


  /*
   * (Static) Flush
   * Remove all the rooms
   */

  Room.flush = function () {
    var id;
    for (id in Room.rooms) {
      Room.remove(id);
    }
  };


  /*
   * Join
   * Add a socket to the room
   *
   * - socket (socket)
   */

  Room.prototype.join = function (socket) {
    if (! (socket in this.sockets)) {
      this.sockets.push(socket);
    }
  };


  /*
   * Leave
   * Remove a socket from the room
   *
   * - socket (socket)
   */

  Room.prototype.leave = function (socket) {
    var index;
    index = this.sockets.indexOf(socket);
    if (index > -1) {
      this.sockets.splice(index, 1);
    }
  };


  /*
   * Length
   * The number of sockets in the room
   *
   * > int
   */

  Room.prototype.length = function () {
    return this.sockets.length;
  };


  /*
   * Emit
   * Emit an event to everyone in the room
   *
   * - event (string)
   * - args... (mixed)
   */

  Room.prototype.emit = function () {
    var i, len, socket;
    len = this.sockets.length;
    for (i = 0; i < len; i++) {
      socket = this.sockets[i];
      socket.emit.apply(socket, arguments);
    }
  };


  /*
   * Broadcast
   * Emit events to everyone but the sender
   *
   * - sender (socket)
   * - event (string)
   * - args... (mixed)
   */

  Room.prototype.broadcast = function (sender) {
    var i, len, socket, args;
    len = this.sockets.length;
    args = Array.prototype.slice.call(arguments, 1);
    for (i = 0; i < len; i++) {
      socket = this.sockets[i];
      if (socket !== sender) {
        socket.emit.apply(socket, args);
      }
    }
  };


  /*
   * Namespace
   * Get (and maybe create) a namespace for this room
   *
   * - name (string) : name of the namespace
   * > namespace
   */

  Room.prototype.namespace = function (name) {
    var namespace;
    namespace = this.namespaces[name];
    if (! namespace) {
      namespace = this.namespaces[name] = new Namespace(name, this);
    }
    return namespace;
  };


  /*
   * In
   * Get another room of sockets
   * So you can do `Jandal.sockets.in('room').emit('hi');`
   *
   * - id (int) : id of the room
   * > room
   */

  Room.prototype.in = function (id) {
    return Room.get(id);
  };


  /*
   * Contains
   * Checks if a socket is already in a room
   *
   * - socket (socket)
   * > boolean
   */

  Room.prototype.contains = function (socket) {
    var i, len;
    len = this.sockets.length;
    for (i = 0; i < len; i++) {
      if (this.sockets[i] === socket) {
        return true;
      }
    }
    return false;
  };


  /*
   * Destroy
   * Remove the room
   */

  Room.prototype.destroy = function () {
    Room.remove(this.id);
  };


  module.exports = Room;

}());

},{"./namespace":6}],8:[function(require,module,exports){
(function () {

  'use strict';

  var Socket, Namespace, Callbacks, Room, broadcastFrom,
      EventEmitter, inherits,
      EVENT_ARGS, NS_EVENT, CALLBACK;

  /*
   * Dependencies
   */

  EventEmitter = require('events').EventEmitter;
  Namespace = require('./namespace');
  Callbacks = require('./callbacks');
  Room = require('./room');
  inherits = require('./util').inherits;

  broadcastFrom = require('./broadcast');
  broadcastFrom.init(Room);


  /*
   * Constants
   */

  EVENT_ARGS = /^([^\(]+)\((.*)\)$/;
  NS_EVENT = /^([\w-]+\.)?([^\(]+)$/;
  CALLBACK = /__fn__(\d+)/;


  /*
   * Socket Constructor
   */

  Socket = function (socket) {
    Socket.super_.call(this);

    this.socket = socket;
    this.namespaces = {};
    this.rooms = [];
    this.callbacks = new Callbacks();
    this.join('all');

    broadcastFrom(this);

    var self = this;
    Socket._handle.read(this.socket, function (message) {
      self._process(message);
    });
    Socket._handle.close(this.socket, function () {
      self.release();
    });
  };


  /*
   * Inherit from EventEmitter
   */

  inherits(Socket, EventEmitter);
  Socket.prototype._emit = EventEmitter.prototype.emit;


  /*
   * (Static) All
   */

  Socket.all = Room.get('all');


  /*
   * (Static) In
   */

  Socket.in = Room.prototype.in;


  /*
   * (Private) Process
   * Processes messages received on the socket
   *
   * - data (string)
   */

  Socket.prototype._process = function (data) {
    var message, namespace, callback;

    message = this.parse(data);

    callback = message.event.match(CALLBACK);
    if (callback) {
      return this.callbacks.exec(callback[1], message.args);
    }

    message.args.unshift(message.event);
    namespace = this.namespaces[message.namespace];

    if (message.namespace && namespace) {
      namespace._emit.apply(namespace, message.args);
    } else {
      this._emit.apply(this, message.args);
    }
  };


  /*
   * (Private) Callback
   *
   * - id (int) : the callback id
   * > function
   */

  Socket.prototype._callback = function (id) {
    var self = this;
    return function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('__fn__' + id);
      self.emit.apply(self, args);
    };
  };


  /*
   * Namespace
   * If the namespace already exists it will be used instead
   *
   * - name (string)
   * > namespace
   */

  Socket.prototype.namespace = function (name) {
    var namespace;
    namespace = this.namespaces[name];
    if (! namespace) {
      namespace = this.namespaces[name] = new Namespace(name, this);
    }
    return namespace;
  };


  /*
   * Serialize
   *
   * - message (object)
   * > string
   */

  Socket.prototype.serialize = function (message) {
    var string, args, len, i, arg;

    args = message.args;
    len = args.length;

    for (i = 0; i < len; i++) {
      arg = args[i];
      if (typeof arg === 'function') {
        args[i] = '__fn__' + this.callbacks.register(arg);
      }
    }

    string = message.event + '(';
    args = JSON.stringify(args);
    string += args.slice(1, -1) + ')';

    return string;
  };


  /*
   * Parse
   *
   * - message (string)
   * > object
   */

  Socket.prototype.parse = function (message) {
    var namespace, event, args, len, i, arg, match;

    match = message.match(EVENT_ARGS);

    if (! match) {
      throw new Error('Could not parse', message);
    }

    args  = match[2];
    match = match[1].match(NS_EVENT);
    event = match[2];

    namespace = match[1];
    namespace = namespace ? namespace.slice(0, -1) : false;

    args = JSON.parse('[' + args + ']');
    len = args.length;

    // Replace callback ids with functions
    for (i = 0; i < len; i++) {
      arg = args[i];
      if (typeof arg === 'string') {
        match = arg.match(CALLBACK);
        if (match) {
          args[i] = this._callback(match[1]);
        }
      }
    }

    return {
      namespace: namespace,
      event: event,
      args: args
    };

  };


  /*
   * Send a message through the socket
   *
   * - event (string)
   * - args... (mixed) : any data you want to send
   */

  Socket.prototype.emit = function (event) {

    // EventEmitter events are proxied
    if (event === 'newListener' || event === 'removeListener') {
      return this._emit.apply(this, arguments);
    }

    Socket._handle.write(this.socket, this.serialize({
      event: event,
      args: Array.prototype.slice.call(arguments, 1)
    }));
  };

  


  /*
   * Join
   *
   * - room (string)
   */

  Socket.prototype.join = function (room) {
    var index = this.rooms.indexOf(room);
    if (index < 0) {
      this.rooms.push(room);
      room = Room.get(room);
      room.join(this);
    }
  };


  /*
   * Leave
   *
   * - room (string)
   */

  Socket.prototype.leave = function (room) {
    var index = this.rooms.indexOf(room);
    if (index > -1) {
      this.rooms.splice(index, 1);
      room = Room.get(room);
      room.leave(this);
    }
  };


  /*
   * Release
   */

  Socket.prototype.release = function () {
    var i, len;
    len = this.rooms.length;
    for (i = len - 1; i >= 0; i--) {
      this.leave(this.rooms[i]);
    }
  };


  module.exports = Socket;

}());

},{"./broadcast":2,"./callbacks":3,"./namespace":6,"./room":7,"./util":9,"events":1}],9:[function(require,module,exports){
(function () {

  'use strict';

  var util;

  util = {};

  /*
   * util.inherits
   */

  util.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };

  module.exports = util;

}());

},{}]},{},[5])