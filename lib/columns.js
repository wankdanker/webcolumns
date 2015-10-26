"use strict";

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var WebObject = require('web-object');

var Column = require('./column');

module.exports = Columns;

function Columns (opts) {
	if (this instanceof Columns === false) {
		return new Columns(opts);
	}
	
	var self = this;
	
	self.type = 'Columns';
	self.className = 'columns';
	self.parts = [];
	self.appendTo = 'root';
	
	WebObject.call(this, opts);
	
	opts.container = opts.container || document.body;
	
	self.columns = self.objects;
	
	opts.container.appendChild(self.root);
}

inherits(Columns, WebObject);

//over-ride the add method
Columns.prototype.add = function (opts) {
	var self = this;
	
	if (typeof opts === 'string' || typeof opts === 'function') {
		opts = { header : opts };
	}
	
	if (self.settings.dragdrop) {
		opts.dragdrop = true;
	}
	
	var column = Column(opts, self);
	
	self.addObject(column);
	
	return column
}