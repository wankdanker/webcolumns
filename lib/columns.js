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

Columns.prototype.filter = function (fn) {
	var self = this;
	
	self.columns.forEach(function (column) {
		column.filter(fn);
	});
}

Columns.prototype.sort = function (fn) {
	var self = this;
	
	self.columns.forEach(function (column) {
		column.sort(fn);
	});
}