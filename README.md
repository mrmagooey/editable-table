taboo-table
=================

This plugin synchronises taboo tabular data structures with html tables and provides some in page editing capabilities. Here are the key features:

* Updates a html table as a taboo table updates, and the reverse.
* Uses standard DOM focus for selection (so does not interrupt scrolling or tabbing outside the table)
* Does not force any styling (so you can style it any way you want, using normal CSS)

Dependencies
------------

* Underscore
* Taboo

This library requires a modern, standards compliant browser.

Basic Usage
-----------

The tabooTable constructor takes two arguments, a selector for a `<table>` element and a taboo object.

    var taboo = new Taboo('test1');
    taboo.addRows([{col1:'a', col3:'b'}, {col1:'c', col3:'d'}]);
    var table = new tabooTable('#table', taboo);

This will fill the html table with the contents of the taboo table.

The html table can be resynchronised to a new taboo table using updateTaboo() method. This function allows for computed tables (e.g. those that exist as the result of a join) to be constantly updated:

    var innerTaboo = taboo1.innerJoin('col1', taboo2, 'col1');
    var innerTable = new tabooTable('#inner', innerTaboo);

    function updateInnerJoin(){
        innerTaboo = taboo1.innerJoin('col1', taboo2, 'col1');
        innerTable.updateTaboo(innerTaboo);
    };
    
    taboo1.registerCallback('update', updateInnerJoin);
    taboo2.registerCallback('update', updateInnerJoin);

This example shows how Taboo's callback system can be used to trigger the update of an inner joined taboo table (`innerTaboo`), and then update a tabooTable (`innerTable`).

