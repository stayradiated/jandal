(function () {

  'use strict';

  var Socket, handles;

  /*
   * Dependencies
   */

  Socket = require('./socket');
  handles = require('./handles');


  /*
   * (Static) Handle
   * Choose how to attach to the socket
   *
   * - name (string) : a key from handles (currently 'node' or 'sockjs')
   */

  Socket.handle = function (name) {
    var handle = handles[name];
    if (! handle) {
      throw new Error('Jandal handler "' + name + '"could not be found');
    }
    Socket._handle = handle;
  };

  module.exports = Socket;

}());
