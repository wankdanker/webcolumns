"use strict";

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var WebObject = require('web-object');

module.exports = ColumnNode;

function ColumnNode (opts, parent) {
	if (this instanceof ColumnNode === false) {
		return new ColumnNode(opts, parent);
	}
	
	var self = this;
	
	self.type = 'ColumnNode';
	self.className = 'column-node';
	self.parts = ['body'];
	self.appendTo = 'body';
	
	self.dragdrop = opts.dragdrop;
	
	if (self.dragdrop) {
		self.draggable = true;
	}
	
	WebObject.call(self, opts, parent);
	
	self.nodes = self.objects;
	
}

inherits(ColumnNode, WebObject);
