

var taboo1 = new Taboo();
taboo1.addRows([{col1:'a', col3:'b'}, {col1:'c', col3:'d'}]);
var table1 = new tabooTable('#table1', taboo1);
taboo1.addRows([{col1:'e', col3:'f'}, {col1:'g', col3:'h'}]);

var taboo2 = new Taboo();
taboo2.addRows([{col1:'a', col2:'b'}, {col1:'c', col2:'asdf'}]);
var table2 = new tabooTable('#table2', taboo2, {addRowsButtons: false,
                                                addColumnsButtons: false});
taboo2.addRows([{col1:'cat', col2:'dog'}, {col1:'horse', col2:'elephant'}]);

var taboo3 = new Taboo();
taboo3.addRows([{col1:'a', col2:'b'}, {col1:'c', col2:'asdf'}]);
var table3 = new tabooTable('#table3', taboo3, {editableRows: false,
                                                editableRowHeader: false});
taboo3.addRows([{col1:'cat', col2:'dog'}, {col1:'horse', col2:'elephant'}]);

var taboo4 = new Taboo();
taboo4.addColumns(["one", "two"]);
var table4 = new tabooTable('#table4', taboo4, {editableRowHeader: false});



// var leftTaboo = taboo1.leftJoin('col1', taboo2, 'col1');
// var leftTable = new tabooTable('#join', leftTaboo);

// function updateLeftJoin(){
//   leftTaboo = taboo1.leftJoin('col1', taboo2, 'col1');
//   leftTable.updateTaboo(leftTaboo);
// };

// taboo1.registerCallback('update', updateLeftJoin);
// taboo2.registerCallback('update', updateLeftJoin);

// var innerTaboo = taboo1.innerJoin('col1', taboo2, 'col1');
// var innerTable = new tabooTable('#inner', innerTaboo);

// function updateInnerJoin(){
//   innerTaboo = taboo1.innerJoin('col1', taboo2, 'col1');
//   innerTable.updateTaboo(innerTaboo);
// };

// taboo1.registerCallback('update', updateInnerJoin);
// taboo2.registerCallback('update', updateInnerJoin);
