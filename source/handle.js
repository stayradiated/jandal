'use strict';

var handles, handle, websocketsId;
websocketsId = 0;

/*
 * Can you handle the jandal?
 */

handles = {

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
    }
  },

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
    }
  }

};

/*
 * Handle
 *
 * Return a handle
 *
 * - name (string|object) : the name of the handler, or a custom handler
 * > handle
 */

handle = function (name) {
  var handle;
  if (typeof name === 'object') {
    handle = name;
  } else {
    handle = handles[name];
    if (! handle) {
      throw new Error('Jandal handler "' + name + '"could not be found');
    }
  }
  return handle;
};


module.exports = handle;
