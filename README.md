webcolumns
----------

A smallish API for managing columns and their contents. 

example
-------

```js
var WebColumns = require('webcolumns');

var wc = WebColumns({ container : document.getElementById('the-container'), dragdrop : true });
var c1 = wc.add("Column 1");
var c2 = wc.add("Column 2");

var n1 = c1.add("test");
var n2 = c1.add("test2");
var n3 = c1.add("test3");

n1.move("Column 2");
```

For a more detailed example see `test.html` in the repo.

api
---

### WebColumns = require('webcolumns');

## columns = WebColumns([opts]);

Returns a WebColumn instance

* opts: [optional] options object to toggle the features of WebColumns
	* container: [optional:HTMLElement] HTML Element of which the WebColumns instance should become a child. (default: document.body)
	* dragdrop: [optional:Boolean] Whether or not drag and drop functionality and events should be loaded. (default: false)

## column = columns.add(opts/title [, id]);

Creates a new Column object and adds it to the WebColumns instance

Must specify at least `opts` or `title`.

Returns a Column instance 

* opts: options object for the column
	* title: [required:String/HTMLElement/Function] The title of the column
		* When title is a String, the string is added to the title div
		* When title is an HTMLElement, the HTMLElement is added to the title div
		* When title is a Function, the function is called, passing it the new column instance. The function should return an HTMLElement to be added to the title div
	* id: [optional:String] The id of the column. Useful for if you need to refer to the column using something other than the title. (default: same as title)

## columns = columns.addColumn(Column)

### Column

Add a Column instance to the WebColumns instance

Returns the WebColumns instance

## column = columns.getColumnByTitle(title);
## column = columns.getColumnById(id);
## column = columns.getColumnByIndex(index);

## node = column.add(opts/content);

Creates a new Node object and adds it to the Columns instance

Returns a Node instance 

* opts: options object for the node
	* content: [required:String/HTMLElement/Function] The content of the node
		* When title is a String, the string is added to the content of the node
		* When title is an HTMLElement, the HTMLElement is added to the content of the node
		* When title is a Function, the function is called, passing it the new node instance. The function should return an HTMLElement to be added to the content of the node


### Node

## column = column.addNode(Node)

Add an instance of a Node object to the Column instance

Returns the Column instance

## column = column.removeNode(Node)

Remove an instance of a Node object from a Column instance

Returns the Column instance

## node.move()
## node.hide()
## node.show()


license
-------

MIT
