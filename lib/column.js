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
	
	self.items = document.createElement('div');
	self.items.className = 'column-items';
	
	self.root.appendChild(self.title);
	self.root.appendChild(self.items);
	
	if (typeof opts.title === 'string') {
		self.title.innerHTML = opts.title;
		
	}
	else if (typeof opts.title === 'function') {
		var title = opts.title(self);
		self.title.appendChild(title);
	}
	else {
		//assume it's an element 
		self.title.appendChild(opts.title);
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

Column.prototype.addNode = function (node, index) {
	var self = this;
	
	if (index) {
		self.nodes.push(node);
		self.items.appendChild(node.root);
	}
	else {
		self.nodes.splice(index, 0, node);
		self.items.insertBefore(node.root, self.items.children[index]);
	}
	
	self.emit('added', node);
	
	return self;
};

Column.prototype.removeNode = function (node) {
	var self = this;
	
	self.nodes.splice(self.nodes.indexOf(node), 1);
	self.items.removeChild(node.root);
	self.emit('removed', node);
	
	return self;
};

Column.prototype.positionNode = function (node, index) {
	var self = this;
	
	self.nodes.splice(self.nodes.indexOf(node), 1);
	self.nodes.splice(index, 0, node);
	self.items.removeChild(node.root);
	self.items.insertBefore(node.root, self.items.children[index]);
	
	return self;
};

Column.prototype.hide = function () {
	var self = this;
	
	if (self.root.style.display !== 'none') {
		self.root._defaultDisplay = self.root.style.display;
		self.root.style.display = 'none';
	}
	
	return self;
};

Column.prototype.show = function () {
	var self = this;
	
	if (self.root.style.display === 'none') {
		self.root.style.display = self.root._defaultDisplay;
	}
	
	return self;
};

Column.prototype.toggle = function () {
	var self = this;
	
	if (self.root.style.display === 'none') {
		self.show();
	}
	else {
		self.hide();
	}
	
	return self;
};

Column.prototype.filter = function (fn) {
	var self = this;
	
	var matches = self.nodes.filter(function (node) {
		var result = fn(node, self);
		
		if (result) {
			node.show();
		}
		else {
			node.hide();
		}
		
		return result;
	});
	
	self.emit('filter', matches);
	
	return matches;
}

Column.prototype.sort = function (fn) {
	var self = this;
	
	self.nodes.sort(fn);
	
	self.nodes.forEach(function (node, i) {
		self.positionNode(node, i);
	});
	
	return self;
}