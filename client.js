!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.Jandal=e():"undefined"!=typeof global?global.Jandal=e():"undefined"!=typeof self&&(self.Jandal=e())}(function(){return function e(t,n,i){function s(o,a){if(!n[o]){if(!t[o]){var c="function"==typeof require&&require;if(!a&&c)return c(o,!0);if(r)return r(o,!0);throw new Error("Cannot find module '"+o+"'")}var u=n[o]={exports:{}};t[o][0].call(u.exports,function(e){var n=t[o][1][e];return s(n?n:e)},u,u.exports,e,t,n,i)}return n[o].exports}for(var r="function"==typeof require&&require,o=0;o<i.length;o++)s(i[o]);return s}({1:[function(e,t){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function i(e){return"function"==typeof e}function s(e){return"number"==typeof e}function r(e){return"object"==typeof e&&null!==e}function o(e){return void 0===e}t.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(e){if(!s(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},n.prototype.emit=function(e){var t,n,s,a,c,u;if(this._events||(this._events={}),"error"===e&&(!this._events.error||r(this._events.error)&&!this._events.error.length))throw t=arguments[1],t instanceof Error?t:TypeError('Uncaught, unspecified "error" event.');if(n=this._events[e],o(n))return!1;if(i(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:for(s=arguments.length,a=new Array(s-1),c=1;s>c;c++)a[c-1]=arguments[c];n.apply(this,a)}else if(r(n)){for(s=arguments.length,a=new Array(s-1),c=1;s>c;c++)a[c-1]=arguments[c];for(u=n.slice(),s=u.length,c=0;s>c;c++)u[c].apply(this,a)}return!0},n.prototype.addListener=function(e,t){var s;if(!i(t))throw TypeError("listener must be a function");if(this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,i(t.listener)?t.listener:t),this._events[e]?r(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,r(this._events[e])&&!this._events[e].warned){var s;s=o(this._maxListeners)?n.defaultMaxListeners:this._maxListeners,s&&s>0&&this._events[e].length>s&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),console.trace())}return this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(e,t){function n(){this.removeListener(e,n),s||(s=!0,t.apply(this,arguments))}if(!i(t))throw TypeError("listener must be a function");var s=!1;return n.listener=t,this.on(e,n),this},n.prototype.removeListener=function(e,t){var n,s,o,a;if(!i(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(n=this._events[e],o=n.length,s=-1,n===t||i(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(r(n)){for(a=o;a-->0;)if(n[a]===t||n[a].listener&&n[a].listener===t){s=a;break}if(0>s)return this;1===n.length?(n.length=0,delete this._events[e]):n.splice(s,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},n.prototype.removeAllListeners=function(e){var t,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],i(n))this.removeListener(e,n);else for(;n.length;)this.removeListener(e,n[n.length-1]);return delete this._events[e],this},n.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?i(this._events[e])?[this._events[e]]:this._events[e].slice():[]},n.listenerCount=function(e,t){var n;return n=e._events&&e._events[t]?i(e._events[t])?1:e._events[t].length:0}},{}],2:[function(e,t){"use strict";var n,i,s,r,o,a;n=function(e,t,n){n=n||"broadcast",t=t||e,t[n]=s(e),t[n].to=r(e)},s=function(e){return function(t,n,i,s){a.broadcast(e.id,t,n,i,s)}},r=function(e){return function(t){return t=o.get(t),{emit:function(n,i,s,r){t.broadcast(e.id,n,i,s,r)}}}},i=function(e){return o=e,a=o.get("all"),t.exports},t.exports={attach:n,init:i}},{}],3:[function(e,t){!function(){"use strict";var e;e=function(e){this.collection={},this.index=0,this.namespace=e},e.prototype.register=function(e){var t,n;return t=this,n=this.index++,this.collection[n]=e,this.namespace.on("fn_"+n,function(e,i,s){t.exec(n,e,i,s)}),n},e.prototype.exec=function(e,t,n,i){this.collection[e](t,n,i),delete this.collection[e]},t.exports=e}()},{}],4:[function(e,t){!function(){"use strict";var e,n;n=0,e={node:{identify:function(e){return e.id},write:function(e,t){e.write(t)},onread:function(e,t){e.on("data",t)},onclose:function(e,t){e.on("close",t)},onerror:function(e,t){e.on("error",t)},onopen:function(e,t){setTimeout(t,0)}},websockets:{identify:function(e){return e.id||e.id=++n},write:function(e,t){e.send(t)},onread:function(e,t){e.onmessage=function(e){t(e.data)}},onclose:function(e,t){e.onclose=t},onerror:function(e,t){e.onerror=t},onopen:function(e,t){e.onopen=t}}},t.exports=e}()},{}],5:[function(e,t){!function(){"use strict";var n,i;n=e("./socket"),i=e("./handles"),n.handle=function(e){if("object"==typeof e)n._handle=e;else{var t=i[e];if(!t)throw new Error('Jandal handler "'+e+'"could not be found');n._handle=t}},t.exports=n}()},{"./handles":4,"./socket":8}],6:[function(e,t){!function(){"use strict";var n,i,s,r;i=e("./broadcast"),s=e("events").EventEmitter,r=e("./util").inherits,n=function(e,t){n.super_.call(this),this.name=e,this.item=t,i.attach(this.item,this,"_broadcast"),delete this.broadcast.to},r(n,s),n.prototype._emit=s.prototype.emit,n.prototype.emit=function(e,t,n,i){e=this.name+"."+e,this.item.emit(e,t,n,i)},n.prototype.broadcast=function(e,t,n,i){e=this.name+"."+e,this._broadcast(e,t,n,i)},t.exports=n}()},{"./broadcast":2,"./util":9,events:1}],7:[function(e,t){!function(){"use strict";var n,i;i=e("./namespace"),n=function(e){this.id=e,this.sockets=[],this.namespaces={}},n.rooms={},n.get=function(e){var t=n.rooms[e];return t||(t=n.rooms[e]=new n(e)),t},n.remove=function(e){delete n.rooms[e]},n.flush=function(){for(var e in n.rooms)n.remove(e)},n.prototype.join=function(e){e in this.sockets||this.sockets.push(e)},n.prototype.leave=function(e){var t=this.sockets.indexOf(e);t>-1&&this.sockets.splice(t,1)},n.prototype.length=function(){return this.sockets.length},n.prototype.emit=function(e,t,n,i){var s,r;for(r=this.sockets.length,s=0;r>s;s++)this.sockets[s].emit(e,t,n,i)},n.prototype.broadcast=function(e,t,n,i,s){var r,o,a;for(o=this.sockets.length,r=0;o>r;r++)a=this.sockets[r],a.id!==e&&a.emit(t,n,i,s)},n.prototype.namespace=function(e){var t=this.namespaces[e];return t||(t=this.namespaces[e]=new i(e,this)),t},n.prototype.in=function(e){return n.get(e)},n.prototype.contains=function(e){var t,n;for(n=this.sockets.length,t=0;n>t;t++)if(this.sockets[t]===e)return!0;return!1},n.prototype.destroy=function(){n.remove(this.id)},t.exports=n}()},{"./namespace":6}],8:[function(e,t){"use strict";var n,i,s,r,o,a,c,u,h,f;a=e("events").EventEmitter,i=e("./namespace"),s=e("./callbacks"),r=e("./room"),c=e("./util").inherits,o=e("./broadcast").init(r),h=/\.fn\((\d+)\)$/,u=/^([^\(]+)\((.*)\)/,f=/^([\w-]+\.)?([^\.\(]+)$/,n=function(e){n.super_.call(this),this.namespaces={},this.rooms=[],this.callbacks=new s(this.namespace("Jandal")),this.join("all"),o.attach(this),e&&this.connect(e)},c(n,a),n.prototype._emit=a.prototype.emit,n.all=r.get("all"),n.in=r.prototype.in,n.prototype._process=function(e){var t,n,i,s,r,o;t=this.parse(e),i=t.event,s=t.arg1,r=t.arg2,o=t.arg3,n=this.namespaces[t.namespace],t.namespace&&n?n._emit(i,s,r,o):this._emit(i,s,r,o)},n.prototype._callback=function(e){var t=this;return function(n,i,s){t.emit("Jandal.fn_"+e,n,i,s)}},n.prototype.connect=function(e){var t=this;this.socket=e,this.id=n._handle.identify(e),n._handle.onopen(this.socket,function(e){t._emit("socket.open",e)}),n._handle.onread(this.socket,function(e){t._process(e)}),n._handle.onerror(this.socket,function(e){t._emit("socket.error",e)}),n._handle.onclose(this.socket,function(e,n){t.release(),t._emit("socket.close",e,n)})},n.prototype.namespace=function(e){var t=this.namespaces[e];return t||(t=this.namespaces[e]=new i(e,this)),t},n.prototype.serialize=function(e){var t,n,i,s,r,o,a,c;for(i=1;4>i;i++)if(s="arg"+i,"function"==typeof e[s]){if(void 0!==c)throw new Error("Limit of one callback per message!");c=this.callbacks.register(e[s]),e[s]=void 0}return r=e.arg1,o=e.arg2,a=e.arg3,n=void 0===r&&void 0===o&&void 0===a?[]:void 0===o&&void 0===a?[r]:void 0===a?[r,o]:[r,o,a],n=JSON.stringify(n),t=e.event+"(",t+=n.slice(1,-1)+")",void 0!==c&&(t+=".fn("+c+")"),t},n.prototype.parse=function(e){var t,n,i,s,r;if("string"!=typeof e)return!1;if(s=e.match(h),s&&(r=s[1],e=e.slice(0,s.index)),s=e.match(u),!s)return!1;if(i=s[2],s=s[1].match(f),!s)return!1;n=s[2],t=s[1],t=t?t.slice(0,-1):!1;try{i=JSON.parse("["+i+"]")}catch(o){return!1}return void 0!==r&&i.push(this._callback(r)),{namespace:t,event:n,arg1:i[0],arg2:i[1],arg3:i[2]}},n.prototype.emit=function(e,t,i,s){return"newListener"===e||"removeListener"===e?this._emit(e,t,i,s):(n._handle.write(this.socket,this.serialize({event:e,arg1:t,arg2:i,arg3:s})),void 0)},n.prototype.join=function(e){var t=this.rooms.indexOf(e);0>t&&(this.rooms.push(e),e=r.get(e),e.join(this))},n.prototype.leave=function(e){var t=this.rooms.indexOf(e);t>-1&&(this.rooms.splice(t,1),e=r.get(e),e.leave(this))},n.prototype.room=r.prototype.in,n.prototype.release=function(){var e,t;for(t=this.rooms.length,e=t-1;e>=0;e--)this.leave(this.rooms[e])},t.exports=n},{"./broadcast":2,"./callbacks":3,"./namespace":6,"./room":7,"./util":9,events:1}],9:[function(e,t){!function(){"use strict";var e;e={},e.inherits=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})},t.exports=e}()},{}]},{},[5])(5)});