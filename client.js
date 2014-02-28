!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Jandal=e():"undefined"!=typeof global?global.Jandal=e():"undefined"!=typeof self&&(self.Jandal=e())}(function(){return function e(t,n,s){function i(o,a){if(!n[o]){if(!t[o]){var c="function"==typeof require&&require;if(!a&&c)return c(o,!0);if(r)return r(o,!0);throw new Error("Cannot find module '"+o+"'")}var h=n[o]={exports:{}};t[o][0].call(h.exports,function(e){var n=t[o][1][e];return i(n?n:e)},h,h.exports,e,t,n,s)}return n[o].exports}for(var r="function"==typeof require&&require,o=0;o<s.length;o++)i(s[o]);return i}({1:[function(e,t){"use strict";t.exports=e("./source/socket")},{"./source/socket":8}],2:[function(e,t){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function s(e){return"function"==typeof e}function i(e){return"number"==typeof e}function r(e){return"object"==typeof e&&null!==e}function o(e){return void 0===e}t.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(e){if(!i(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},n.prototype.emit=function(e){var t,n,i,a,c,h;if(this._events||(this._events={}),"error"===e&&(!this._events.error||r(this._events.error)&&!this._events.error.length))throw t=arguments[1],t instanceof Error?t:TypeError('Uncaught, unspecified "error" event.');if(n=this._events[e],o(n))return!1;if(s(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:for(i=arguments.length,a=new Array(i-1),c=1;i>c;c++)a[c-1]=arguments[c];n.apply(this,a)}else if(r(n)){for(i=arguments.length,a=new Array(i-1),c=1;i>c;c++)a[c-1]=arguments[c];for(h=n.slice(),i=h.length,c=0;i>c;c++)h[c].apply(this,a)}return!0},n.prototype.addListener=function(e,t){var i;if(!s(t))throw TypeError("listener must be a function");if(this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,s(t.listener)?t.listener:t),this._events[e]?r(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,r(this._events[e])&&!this._events[e].warned){var i;i=o(this._maxListeners)?n.defaultMaxListeners:this._maxListeners,i&&i>0&&this._events[e].length>i&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),console.trace())}return this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(e,t){function n(){this.removeListener(e,n),i||(i=!0,t.apply(this,arguments))}if(!s(t))throw TypeError("listener must be a function");var i=!1;return n.listener=t,this.on(e,n),this},n.prototype.removeListener=function(e,t){var n,i,o,a;if(!s(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(n=this._events[e],o=n.length,i=-1,n===t||s(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(r(n)){for(a=o;a-->0;)if(n[a]===t||n[a].listener&&n[a].listener===t){i=a;break}if(0>i)return this;1===n.length?(n.length=0,delete this._events[e]):n.splice(i,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},n.prototype.removeAllListeners=function(e){var t,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],s(n))this.removeListener(e,n);else for(;n.length;)this.removeListener(e,n[n.length-1]);return delete this._events[e],this},n.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?s(this._events[e])?[this._events[e]]:this._events[e].slice():[]},n.listenerCount=function(e,t){var n;return n=e._events&&e._events[t]?s(e._events[t])?1:e._events[t].length:0}},{}],3:[function(e,t){"use strict";var n,s,i,r,o,a;n=function(e,t,n){n=n||"broadcast",t=t||e,t[n]=i(e),t[n].to=r(e)},i=function(e){return function(t,n,s,i){a.broadcast(e.id,t,n,s,i)}},r=function(e){return function(t){return t=o.get(t),{emit:function(n,s,i,r){t.broadcast(e.id,n,s,i,r)}}}},s=function(e){return o=e,a=o.get("all"),t.exports},t.exports={attach:n,init:s}},{}],4:[function(e,t){"use strict";var n;n=function(e){this.collection={},this.index=0,this.namespace=e},n.prototype.register=function(e){var t,n;return t=this,n=this.index++,this.collection[n]=e,this.namespace.once("fn_"+n,function(e,s,i){t.exec(n,e,s,i)}),n},n.prototype.exec=function(e,t,n,s){this.collection.hasOwnProperty(e)&&(this.collection[e](t,n,s),delete this.collection[e])},t.exports=n},{}],5:[function(e,t){"use strict";var n,s,i;i=0,n={stream:{identify:function(e){return e.id},write:function(e,t){e.write(t)},onread:function(e,t){e.on("data",t)},onclose:function(e,t){e.on("close",t)},onerror:function(e,t){e.on("error",t)},onopen:function(e,t){setTimeout(t,0)}},websocket:{identify:function(e){return e.hasOwnProperty("id")?e.id:(e.id=++i,e.id)},write:function(e,t){e.send(t)},onread:function(e,t){e.onmessage=function(e){t(e.data)}},onclose:function(e,t){e.onclose=t},onerror:function(e,t){e.onerror=t},onopen:function(e,t){e.onopen=t}}},s=function(e){var t;if("object"==typeof e)t=e;else if(t=n[e],!t)throw new Error('Jandal handler "'+e+'"could not be found');return t},t.exports=s},{}],6:[function(e,t){"use strict";var n,s,i,r;s=e("./broadcast"),i=e("events").EventEmitter,r=e("./util").inherits,n=function(e,t){n.super_.call(this),this.name=e,this.item=t,s.attach(this.item,this,"_broadcast")},r(n,i),n.prototype._emit=i.prototype.emit,n.prototype.emit=function(e,t,n,s){e=this.name+"."+e,this.item.emit(e,t,n,s)},n.prototype.broadcast=function(e,t,n,s){e=this.name+"."+e,this._broadcast(e,t,n,s)},t.exports=n},{"./broadcast":3,"./util":9,events:2}],7:[function(e,t){"use strict";var n,s;s=e("./namespace"),n=function(e){this.id=e,this.sockets=[],this._namespaces={}},n.rooms={},n.get=function(e){var t=n.rooms[e];return t||(t=n.rooms[e]=new n(e)),t},n.remove=function(e){delete n.rooms[e]},n.flush=function(){for(var e in n.rooms)n.get(e).destroy()},n.prototype.in=function(e){return n.get(e)},n.prototype.join=function(e){return e in this.sockets||this.sockets.push(e),this},n.prototype.leave=function(e){var t=this.sockets.indexOf(e);return t>-1&&this.sockets.splice(t,1),this},n.prototype.length=function(){return this.sockets.length},n.prototype.emit=function(e,t,n,s){var i,r;for(r=this.sockets.length,i=0;r>i;i++)this.sockets[i].emit(e,t,n,s);return this},n.prototype.broadcast=function(e,t,n,s,i){var r,o,a;for(o=this.sockets.length,r=0;o>r;r++)a=this.sockets[r],a.id!==e&&a.emit(t,n,s,i);return this},n.prototype.namespace=function(e){var t=this._namespaces[e];return t||(t=this._namespaces[e]=new s(e,this)),t},n.prototype.contains=function(e){var t,n;for(n=this.sockets.length,t=0;n>t;t++)if(this.sockets[t]===e)return!0;return!1},n.prototype.destroy=function(){var e;for(e=this.sockets.length-1;e>=0;e--)this.leave(this.sockets[e]);n.remove(this.id)},t.exports=n},{"./namespace":6}],8:[function(e,t){"use strict";var n,s,i,r,o,a,c,h,u,f,p;c=e("events").EventEmitter,s=e("./namespace"),i=e("./callbacks"),r=e("./room"),h=e("./util").inherits,o=e("./broadcast").init(r),a=e("./handle"),f=/\.fn\((\d+)\)$/,u=/^([^\(]+)\((.*)\)/,p=/^([\w-]+\.)?([^\.\(]+)$/,n=function(e,t){n.super_.call(this),this.rooms=[],this._namespaces={},this._callbacks=new i(this.namespace("socket")),this.join("all"),o.attach(this),e&&this.connect(e,t)},h(n,c),n.prototype._emit=c.prototype.emit,n.all=r.get("all"),n.in=r.get,n.prototype._process=function(e){var t,n,s,i,r,o;t=this._parse(e),s=t.event,i=t.arg1,r=t.arg2,o=t.arg3,n=this._namespaces[t.namespace],t.namespace&&n?(n._emit(s,i,r,o),this._emit(t.namespace+"."+s,i,r,o)):this._emit(s,i,r,o)},n.prototype._callback=function(e){var t=this;return function(n,s,i){t.emit("socket.fn_"+e,n,s,i)}},n.prototype._handleWith=function(e){this._handle=a(e)},n.prototype.connect=function(e,t){var n=this;t&&this._handleWith(t),this.socket=e,this.id=this._handle.identify(e),this._handle.onopen(this.socket,function(e){n._emit("socket.open",e)}),this._handle.onread(this.socket,function(e){n._process(e)}),this._handle.onerror(this.socket,function(e){n._emit("socket.error",e)}),this._handle.onclose(this.socket,function(e,t){n.release(),n._emit("socket.close",e,t)})},n.prototype.namespace=function(e){var t=this._namespaces[e];return t||(t=this._namespaces[e]=new s(e,this)),t},n.prototype._serialize=function(e){var t,n,s,i,r,o,a,c;for(s=1;4>s;s++)if(i="arg"+s,"function"==typeof e[i]){if(void 0!==c)throw new Error("Limit of one callback per message!");c=this._callbacks.register(e[i]),e[i]=void 0}return r=e.arg1,o=e.arg2,a=e.arg3,n=void 0===r&&void 0===o&&void 0===a?[]:void 0===o&&void 0===a?[r]:void 0===a?[r,o]:[r,o,a],n=JSON.stringify(n),t=e.event+"(",t+=n.slice(1,-1)+")",void 0!==c&&(t+=".fn("+c+")"),t},n.prototype._parse=function(e){var t,n,s,i,r;if("string"!=typeof e)return!1;if(i=e.match(f),i&&(r=i[1],e=e.slice(0,i.index)),i=e.match(u),!i)return!1;if(s=i[2],i=i[1].match(p),!i)return!1;n=i[2],t=i[1],t=t?t.slice(0,-1):!1;try{s=JSON.parse("["+s+"]")}catch(o){return!1}return void 0!==r&&s.push(this._callback(r)),{namespace:t,event:n,arg1:s[0],arg2:s[1],arg3:s[2]}},n.prototype.emit=function(e,t,n,s){return"newListener"===e||"removeListener"===e?this._emit(e,t,n,s):void this._handle.write(this.socket,this._serialize({event:e,arg1:t,arg2:n,arg3:s}))},n.prototype.join=function(e){var t=this.rooms.indexOf(e);0>t&&(this.rooms.push(e),e=r.get(e),e.join(this))},n.prototype.leave=function(e){var t=this.rooms.indexOf(e);t>-1&&(this.rooms.splice(t,1),e=r.get(e),e.leave(this))},n.prototype.room=r.get,n.prototype.release=function(){var e,t;for(t=this.rooms.length,e=t-1;e>=0;e--)this.leave(this.rooms[e])},t.exports=n},{"./broadcast":3,"./callbacks":4,"./handle":5,"./namespace":6,"./room":7,"./util":9,events:2}],9:[function(e,t){"use strict";var n;n={},n.inherits=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})},t.exports=n},{}]},{},[1])(1)});