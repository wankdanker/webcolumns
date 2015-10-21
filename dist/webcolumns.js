(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Columns = require('./lib/columns');
var Column = require('./lib/column');
var ColumnNode = require('./lib/column-node');

module.exports = Columns;
module.exports.Columns = Columns;
module.exports.Column = Column;
module.exports.ColumnNode = ColumnNode;
},{"./lib/column":3,"./lib/column-node":2,"./lib/columns":4}],2:[function(require,module,exports){
"use strict";

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = ColumnNode;

function ColumnNode (opts, parent) {
	if (this instanceof ColumnNode === false) {
		return new ColumnNode(opts, parent);
	}
	
	EventEmitter.call(this);
	
	opts = opts || {};
	
	var self = this;
	
	self._isColumnNode = true;
	self.settings = opts;
	self.parent = parent;
	
	self.root = document.createElement('div');
	self.root.className = 'column-node';
	
	if (opts.content) {
		if (typeof opts.content === 'string') {
			var textNode = document.createTextNode(opts.content);
			self.root.appendChild(textNode);
		}
		else if (typeof opts.content === 'function') {
			var content = opts.content(self);
			self.root.appendChild(content);
		}
		else {
			self.root.appendChild(opts.content);
		}
	}
	
	if (self.parent.parent.settings.dragdrop) {
		self.root.className += ' draggable';
		
		self.root.draggable = true;
		self.root.ondragstart = dragstart;
		self.root.dragend = dragend;
	}
	
	function dragstart (e) {
		self.parent.parent.setDraggingNode(self);
	}
	
	function dragend(e) {
		self.parent.parent.setDraggingNode(null);
	}
}

inherits(ColumnNode, EventEmitter);

ColumnNode.prototype.move = function (type, dest) {
	var self = this;
	var dstColumn;
	
	if (!dest && dest !== 0) {
		dest = type;
		
		if (typeof dest === 'object' && dest._isColumn) {
			type = 'reference';
		}
		else {
			type = 'title';
		}
	}
	
	switch (type) {
		case 'title':
			dstColumn = self.parent.parent.getColumnByTitle(dest);
			break;
		case 'id':
			dstColumn = self.parent.parent.getColumnById(dest);
			break;
		case 'index':
			dstColumn = self.parent.parent.getColumnByIndex(dest);
			break;
		case 'reference':
			dstColumn = dest;
			break;
	}
	
	if (!dstColumn) {
		throw new Error('Destination Column not found');
	}
	
	var srcColumn = self.parent;
	
	srcColumn.removeNode(self);
	self.parent = dstColumn;
	dstColumn.addNode(self);
	
	self.emit('moved', dstColumn, srcColumn);
	
	return self;
};

ColumnNode.prototype.hide = function () {
	var self = this;
	
	self.root._defaultDisplay = self.root.style.display;
	self.root.style.display = 'none';
	
	return self;
};

ColumnNode.prototype.show = function () {
	var self = this;
	
	self.root.style.display = self.root._defaultDisplay;
	
	return self;
};
},{"events":7,"inherits":6}],3:[function(require,module,exports){
"use strict";

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var ColumnNode = require('./column-node');

module.exports = Column;

function Column (opts, parent) {
	if (this instanceof Column === false) {
		return new Column(opts, parent);
	}
	
	EventEmitter.call(this);
	
	opts = opts || {};
	
	var self = this;
	self._isColumn = true;
	
	self.settings = opts;
	self.parent = parent;
	self.ondrop = opts.ondrop;
	
	self.nodes = [];
	
	self.root = document.createElement('div');
	self.root.className = 'column';
	
	self.title = document.createElement('div');
	self.title.className = 'column-title';
	
	if (typeof opts.title === 'string') {
		self.title.innerHTML = opts.title;
		self.root.appendChild(self.title);
	}
	else if (typeof opts.title === 'function') {
		var title = opts.title(self);
		self.root.appendChild(title);
	}
	else {
		//assume it's an element 
		self.root.appendChild(opts.title);
	}
	
	if (self.parent.settings.dragdrop) {
		self.root.ondragover = dragover;
		self.root.ondragenter = dragenter;
		self.root.ondragleave = dragleave;
		self.root.ondrop = drop
	}
	
	var dragCounter = 0;
	
	function dragover(e) {
		e.preventDefault();
	}
	
	function dragenter(e) {
		e.preventDefault();
		
		var node = self.parent.getDraggingNode();
		
		if (!node) {
			return;
		}
		
 		if (!dragCounter) { 
			self.emit('dragover', node);
 		}
		
		dragCounter += 1;
	}
	
	function dragleave(e) {
		e.preventDefault();
		
		var node = self.parent.getDraggingNode();
		
		if (!node) {
			return;
		}
		
		dragCounter -= 1;
		
		if (!dragCounter) {
			self.emit('dragleave', node);
		}
	}
	
	function drop(e) {
		e.preventDefault();
		
		dragCounter = 0;
		
		var node = self.parent.getDraggingNode();
		
		if (!node) {
			return;
		}
		
		self.emit('drop', node);
	} 
}

inherits(Column, EventEmitter);

Column.prototype.add = function (opts) {
	var self = this;
	
	if (typeof opts === 'string' || typeof opts === 'function') {
		opts = { content : opts };
	}
	
	var node = ColumnNode(opts, self);
	
	self.addNode(node);
	
	return node;
};

Column.prototype.addNode = function (node) {
	var self = this;
	
	self.nodes.push(node);
	self.root.appendChild(node.root);
	self.emit('added', node);
	
	return self;
};

Column.prototype.removeNode = function (node) {
	var self = this;
	
	self.nodes.splice(self.nodes.indexOf(node), 1);
	self.root.removeChild(node.root);
	self.emit('removed', node);
	
	return self;
};
},{"./column-node":2,"events":7,"inherits":6}],4:[function(require,module,exports){
"use strict";

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

var Column = require('./column');

module.exports = Columns;

function Columns (opts) {
	if (this instanceof Columns === false) {
		return new Columns(opts);
	}
	
	EventEmitter.call(this);
	
	opts = opts || {};
	
	var self = this;
	
	self.settings = opts;
	opts.container = opts.container || document.body;
	
	self.columns = [];
	self.columnTitleIndex = {};
	self.columnIdIndex = {};
	
	self.root = document.createElement('div');
	self.root.className = 'columns';
	opts.container.appendChild(self.root);
	
}

inherits(Columns, EventEmitter);

Columns.prototype.add = function (opts, id) {
	var self = this;
	
	if (typeof opts === 'string') {
		opts = { title : opts };
	}
	else if (typeof opts === 'function') {
		opts = { title : opts, id : id || + new Date() };
	}
	
	opts.id = opts.id || id || opts.title;
	
	var c = Column(opts, self);
	
	self.addColumn(c);
	
	return c;
};

Columns.prototype.addColumn = function (column) {
	var self = this;
	
	column.index = self.columns.length;

	self.columns.push(column);
	self.columnTitleIndex[column.settings.title] = column;
	self.columnIdIndex[column.settings.id] = column;
	self.root.appendChild(column.root);
	
	self.emit('added', column);
	
	return self;
};

Columns.prototype.getColumnByTitle = function (title) {
	var self = this;
	
	return self.columnTitleIndex[title] || null;
};

Columns.prototype.getColumnById = function (id) {
	var self = this;
	
	return self.columnIdIndex[id] || null;
};

Columns.prototype.getColumnByIndex = function (index) {
	var self = this;
	
	return self.columns[index];
};

Columns.prototype.setDraggingNode = function (node) {
	var self = this;
	
	self._dragging = node;
};

Columns.prototype.getDraggingNode = function () {
	var self = this;
	
	return self._dragging;
};


},{"./column":3,"events":7,"inherits":6}],5:[function(require,module,exports){
WebColumns = require('./');
},{"./":1}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(require,module,exports){
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
      }
      throw TypeError('Uncaught, unspecified "error" event.');
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
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
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

},{}]},{},[5]);
