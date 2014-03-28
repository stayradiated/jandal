'use strict';

var websocketsId = 0;

/*
 * Can you handle the jandal?
 */

var handles = {

  stream: {
    identify: function streamIdentify (socket) {
      return socket.id;
    },
    write: function streamWrite (socket, message) {
      socket.write(message);
    },
    onread: function streamOnRead (socket, fn) {
      socket.on('data', fn);
    },
    onclose: function streamOnClose (socket, fn) {
      socket.on('close', fn);
    },
    onerror: function streamOnError (socket, fn) {
      socket.on('error', fn);
    },
    onopen: function streamOnOpen (socket, fn) {
      setTimeout(fn, 0);
    },
    release: function streamRelease (socket) {
      socket.removeAllListeners('data');
      socket.removeAllListeners('close');
      socket.removeAllListeners('error');
    }
  },

  websocket: {
    identify: function websocketWrite (socket) {
      if (socket.hasOwnProperty('id')) return socket.id;
      socket.id = ++websocketsId;
      return socket.id;
    },
    write: function websocketWrite (socket, message) {
      socket.send(message);
    },
    onread: function websocketOnRead (socket, fn) {
      socket.onmessage = function websocketOnReadOnMessage (e) {
        fn(e.data);
      };
    },
    onclose: function websocketOnClose (socket, fn) {
      socket.onclose = fn;
    },
    onerror: function websocketOnError (socket, fn) {
      socket.onerror = fn;
    },
    onopen: function websocketOnOpen (socket, fn) {
      socket.onopen = fn;
    },
    release: function websocketRelease (socket) {
      socket.onmessage = undefined;
      socket.onclose = undefined;
      socket.onopen = undefined;
      socket.onerror = undefined;
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

var handle = function handle (name) {
  var handler = typeof name === 'object' ? name : handles[name];
  if (! handler) {
    throw new Error('Jandal handler "' + name + '"could not be found');
  }
  return handler;
};


module.exports = handle;
