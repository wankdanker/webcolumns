"use strict";

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var WebObject = require('web-object');

var ColumnNode = require('./column-node');

module.exports = Column;

function Column (opts, parent) {
	if (this instanceof Column === false) {
		return new Column(opts, parent);
	}
	
	var self = this;
	
	self.type = 'Column';
	self.className = 'column';
	self.parts = ['header', 'items'];
	self.appendTo = 'items';
	self.dragdrop = opts.dragdrop;
	
	if (self.dragdrop) {
		self.droppable = true;
	}
	
	WebObject.call(this, opts, parent);
}

inherits(Column, WebObject);

//over-ride the WebObject add method
Column.prototype.add = function (opts) {
	var self = this;
	
	if (typeof opts === 'string' || typeof opts === 'function') {
		opts = { body : opts };
	}
	
	if (self.dragdrop) {
		opts.dragdrop = true;
	}
	
	var node = ColumnNode(opts, self);
	
	self.addObject(node);
	
	return node;
};
