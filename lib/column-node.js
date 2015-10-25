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
	
	self.emit('move', dstColumn, srcColumn);
	
	return self;
};

ColumnNode.prototype.position = function (index) {
	var self = this;
	
	self.parent.positionNode(self, index);
	
	return self;
}

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

ColumnNode.prototype.toggle = function () {
	var self = this;
	
	if (self.root.style.display === 'none') {
		self.show();
	}
	else {
		self.hide();
	}
	
	return self;
};

ColumnNode.prototype.hide = function () {
	var self = this;
	
	if (self.visible()) {
		self.root._defaultDisplay = self.root.style.display;
		self.root.style.display = 'none';
	}
	
	return self;
};

ColumnNode.prototype.show = function () {
	var self = this;
	
	if (!self.visible()) {
		self.root.style.display = self.root._defaultDisplay;
	}
	
	return self;
};

ColumnNode.prototype.toggle = function () {
	var self = this;
	
	if (!self.visible()) {
		self.show();
	}
	else {
		self.hide();
	}
	
	return self;
};

ColumnNode.prototype.visible = function () {
	var self = this;
	
	return self.root.style.display !== 'none';
}