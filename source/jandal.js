(function (root) {

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
