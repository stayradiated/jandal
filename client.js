!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Jandal=e():"undefined"!=typeof global?global.Jandal=e():"undefined"!=typeof self&&(self.Jandal=e())}(function(){return function e(t,n,s){function i(o,a){if(!n[o]){if(!t[o]){var c="function"==typeof require&&require;if(!a&&c)return c(o,!0);if(r)return r(o,!0);throw new Error("Cannot find module '"+o+"'")}var h=n[o]={exports:{}};t[o][0].call(h.exports,function(e){var n=t[o][1][e];return i(n?n:e)},h,h.exports,e,t,n,s)}return n[o].exports}for(var r="function"==typeof require&&require,o=0;o<s.length;o++)i(s[o]);return i}({1:[function(e,t){"use strict";t.exports=e("./source/socket")},{"./source/socket":9}],2:[function(e,t){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function s(e){return"function"==typeof e}function i(e){return"number"==typeof e}function r(e){return"object"==typeof e&&null!==e}function o(e){return void 0===e}t.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(e){if(!i(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},n.prototype.emit=function(e){var t,n,i,a,c,h;if(this._events||(this._events={}),"error"===e&&(!this._events.error||r(this._events.error)&&!this._events.error.length))throw t=arguments[1],t instanceof Error?t:TypeError('Uncaught, unspecified "error" event.');if(n=this._events[e],o(n))return!1;if(s(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:for(i=arguments.length,a=new Array(i-1),c=1;i>c;c++)a[c-1]=arguments[c];n.apply(this,a)}else if(r(n)){for(i=arguments.length,a=new Array(i-1),c=1;i>c;c++)a[c-1]=arguments[c];for(h=n.slice(),i=h.length,c=0;i>c;c++)h[c].apply(this,a)}return!0},n.prototype.addListener=function(e,t){var i;if(!s(t))throw TypeError("listener must be a function");if(this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,s(t.listener)?t.listener:t),this._events[e]?r(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,r(this._events[e])&&!this._events[e].warned){var i;i=o(this._maxListeners)?n.defaultMaxListeners:this._maxListeners,i&&i>0&&this._events[e].length>i&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),console.trace())}return this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(e,t){function n(){this.removeListener(e,n),i||(i=!0,t.apply(this,arguments))}if(!s(t))throw TypeError("listener must be a function");var i=!1;return n.listener=t,this.on(e,n),this},n.prototype.removeListener=function(e,t){var n,i,o,a;if(!s(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(n=this._events[e],o=n.length,i=-1,n===t||s(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(r(n)){for(a=o;a-->0;)if(n[a]===t||n[a].listener&&n[a].listener===t){i=a;break}if(0>i)return this;1===n.length?(n.length=0,delete this._events[e]):n.splice(i,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},n.prototype.removeAllListeners=function(e){var t,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],s(n))this.removeListener(e,n);else for(;n.length;)this.removeListener(e,n[n.length-1]);return delete this._events[e],this},n.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?s(this._events[e])?[this._events[e]]:this._events[e].slice():[]},n.listenerCount=function(e,t){var n;return n=e._events&&e._events[t]?s(e._events[t])?1:e._events[t].length:0}},{}],3:[function(e,t){"use strict";var n,s,i=function(e){var t=r(e);return t.to=o(e),t},r=function(e){return function(t,n,i,r){s.broadcast(e.id,t,n,i,r)}},o=function(e){return function(t){return t=n.get(t),{emit:function(n,s,i,r){t.broadcast(e.id,n,s,i,r)}}}},a=function(e){return n=e,s=n.get("all"),t.exports};t.exports={bind:i,init:a}},{}],4:[function(e,t){"use strict";var n="fn_",s=function(e){this.collection={},this.index=0,this.namespace=e};s.prototype.register=function(e){var t=this,s=this.index++;return this.collection[s]=e,this.namespace.once(n+s,function(e,n,i){t.exec(s,e,n,i)}),s},s.prototype.exec=function(e,t,n,s){this.collection.hasOwnProperty(e)&&(this.collection[e](t,n,s),delete this.collection[e])},s.prototype.getFn=function(e){var t=this;return function(s,i,r){t.namespace.emit(n+e,s,i,r)}},s.prototype.release=function(){delete this.collection,delete this.index,delete this.namespace},t.exports=s},{}],5:[function(e,t){"use strict";var n=0,s={stream:{identify:function(e){return e.id},write:function(e,t){e.write(t)},onread:function(e,t){e.on("data",t)},onclose:function(e,t){e.on("close",t)},onerror:function(e,t){e.on("error",t)},onopen:function(e,t){setTimeout(t,0)},release:function(e){e.removeListener("data"),e.removeListener("close"),e.removeListener("error")}},websocket:{identify:function(e){return e.hasOwnProperty("id")?e.id:(e.id=++n,e.id)},write:function(e,t){e.send(t)},onread:function(e,t){e.onmessage=function(e){t(e.data)}},onclose:function(e,t){e.onclose=t},onerror:function(e,t){e.onerror=t},onopen:function(e,t){e.onopen=t},release:function(e){e.onmessage=void 0,e.onclose=void 0,e.onopen=void 0,e.onerror=void 0}}},i=function(e){var t="object"==typeof e?e:s[e];if(!t)throw new Error('Jandal handler "'+e+'"could not be found');return t};t.exports=i},{}],6:[function(e,t){"use strict";var n={callback:/\.fn\((\d+)\)$/,message:/^([^\(]+)\((.*)\)/,event:/^[^\(]+$/},s=function(e){this.callbacks=e};s.prototype.parse=function(e){if("string"!=typeof e)return!1;var t,s=e.match(n.callback);if(null!==s&&(t=s[1],e=e.slice(0,s.index)),s=n.message.exec(e),null===s)return!1;var i=s[2];if(s=n.event.exec(s[1]),null===s)return!1;var r=s[0];try{i=JSON.parse("["+i+"]")}catch(o){return!1}return void 0!==t&&i.push(this.callbacks.getFn(t)),{event:r,arg1:i[0],arg2:i[1],arg3:i[2]}},s.prototype.serialize=function(e,t,n,s){var i,r;i=void 0===t&&void 0===n&&void 0===s?[]:void 0===n&&void 0===s?[t]:void 0===s?[t,n]:[t,n,s];for(var o=0,a=i.length;a>o;o++){var c=i[o];if("function"==typeof c){if(o!==a-1)throw new Error("Callback must be the last argument");r=this.callbacks.register(c),i.splice(o,1)}}i=JSON.stringify(i);var h=e;return h+="("+i.slice(1,-1)+")",void 0!==r&&(h+=".fn("+r+")"),h},s.prototype.release=function(){delete this.callbacks},t.exports=s},{}],7:[function(e,t){"use strict";var n=e("./broadcast"),s=e("events").EventEmitter,i=e("./util").inherits,r=function o(e,t){o.super_.call(this),this.name=e,this.item=t,this._broadcast=n.bind(this.item)};i(r,s),r.prototype._emit=s.prototype.emit,r.parse=function(e){var t,n;return e=e.split("."),2===e.length?(t=e[0],n=e[1]):n=e[0],{namespace:t,event:n}},r.prototype.emit=function(e,t,n,s){e=this.name+"."+e,this.item.emit(e,t,n,s)},r.prototype.broadcast=function(e,t,n,s){e=this.name+"."+e,this._broadcast(e,t,n,s)},r.prototype._release=function(){delete this.name,delete this.item,delete this._broadcast},t.exports=r},{"./broadcast":3,"./util":10,events:2}],8:[function(e,t){"use strict";var n=e("./namespace"),s=function(e){this.id=e,this.sockets=[],this._namespaces={}};s.rooms={},s.get=function(e){var t=s.rooms[e];return t||(t=s.rooms[e]=new s(e)),t},s.flush=function(){for(var e in s.rooms)s.get(e).empty(),delete s.rooms[e]},s.prototype._join=function(e){return this.sockets.indexOf(e)<0&&this.sockets.push(e),this},s.prototype._leave=function(e){var t=this.sockets.indexOf(e);return t>=0&&this.sockets.splice(t,1),this},s.prototype.in=function(e){return s.get(e)},s.prototype.length=function(){return this.sockets.length},s.prototype.emit=function(e,t,n,s){for(var i=0,r=this.sockets.length;r>i;i++)this.sockets[i].emit(e,t,n,s);return this},s.prototype.broadcast=function(e,t,n,s,i){for(var r=0,o=this.sockets.length;o>r;r++){var a=this.sockets[r];a.id!==e&&a.emit(t,n,s,i)}return this},s.prototype.namespace=function(e){var t=this._namespaces[e];return t=t?t:this._namespaces[e]=new n(e,this)},s.prototype.contains=function(e){for(var t=0,n=this.sockets.length;n>t;t++)if(this.sockets[t]===e)return!0;return!1},s.prototype.empty=function(){for(var e=this.sockets.length-1;e>=0;e--)this._leave(this.sockets[e])},s.prototype.release=function(){this.empty(),delete this.id,delete this.sockets,delete this._namespaces},t.exports=s},{"./namespace":7}],9:[function(e,t){"use strict";var n=e("events").EventEmitter,s=e("./namespace"),i=e("./callbacks"),r=e("./room"),o=e("./util").inherits,a=e("./broadcast").init(r),c=e("./handle"),h=e("./message"),u=function l(e,t){l.super_.call(this),this.rooms=[],this.broadcast=a.bind(this),this._namespaces={},this._callbacks=new i(this.namespace("socket")),this._message=new h(this._callbacks),this.join("all"),e&&this.connect(e,t)};o(u,n),u.prototype._emit=n.prototype.emit,u.all=r.get("all"),u.in=r.get,u.prototype._process=function(e){var t=this._message.parse(e),n=s.parse(t.event),i=t.arg1,r=t.arg2,o=t.arg3,a=n.event,c=n.namespace,h=this._namespaces[c];c&&h&&h._emit(a,i,r,o),this._emit(t.event,i,r,o)},u.prototype._handleWith=function(e){this._handle=c(e)},u.prototype.connect=function(e,t){var n=this;t&&this._handleWith(t),this.socket=e,this.id=this._handle.identify(e),this._handle.onread(this.socket,function(e){n._process(e)}),this._handle.onopen(this.socket,function(e){n._emit("socket.open",e)}),this._handle.onerror(this.socket,function(e){n._emit("socket.error",e)}),this._handle.onclose(this.socket,function(e,t){n.release(),n._emit("socket.close",e,t)})},u.prototype.namespace=function(e){var t=this._namespaces[e];return t=t?t:this._namespaces[e]=new s(e,this)},u.prototype.emit=function(e,t,n,s){if("newListener"===e||"removeListener"===e)return this._emit(e,t,n,s);var i=this._message.serialize(e,t,n,s);this._handle.write(this.socket,i)},u.prototype.join=function(e){var t=this.rooms.indexOf(e);0>t&&(this.rooms.push(e),e=r.get(e),e._join(this))},u.prototype.leave=function(e){var t=this.rooms.indexOf(e);t>-1&&(this.rooms.splice(t,1),e=r.get(e),e._leave(this))},u.prototype.room=r.get,u.prototype.release=function(){this._handle.release(this.socket);for(var e=this.rooms.length,t=e-1;t>=0;t--)this.leave(this.rooms[t]);for(var n in this._namespaces)this._namespaces[n]._release();this._callbacks.release(),this._message.release(),delete this._namespaces,delete this._callbacks,delete this._message,delete this.socket,delete this.broadcast,delete this.rooms,delete this.id,delete this._handle},t.exports=u},{"./broadcast":3,"./callbacks":4,"./handle":5,"./message":6,"./namespace":7,"./room":8,"./util":10,events:2}],10:[function(e,t){"use strict";var n={};n.inherits=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})},t.exports=n},{}]},{},[1])(1)});