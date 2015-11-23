

var taboo1 = new Taboo();
taboo1.addRows([{col1:'a', col3:'b'}, {col1:'c', col3:'d'}]);
console.log(taboo1.print());
var table1 = new tabooTable('#table1', taboo1);
taboo1.addRows([{col1:'e', col3:'f'}, {col1:'g', col3:'h'}]);
console.log(taboo1.print());

// var taboo2 = new Taboo();
// taboo2.addRows([{col1:'a', col2:'b'}, {col1:'c', col2:'asdf'}]);
// var table2 = new tabooTable('#test2', taboo2);
// taboo2.addRows([{col1:'cat', col2:'dog'}, {col1:'horse', col2:'elephant'}]);

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
