
var tabooTable = function (elementName, taboo) {
  var tableElement = document.querySelector(elementName),
      _this = this,
      cloneProperties= ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
		                'text-align', 'font', 'font-size', 'font-family', 'font-weight',
		                'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'height',
                        'width'];
  this.taboo = taboo;
  
  // When changes occur in the taboo table, this updates the html 
  function syncToHtml(taboo){
    clearTable();
    _this.taboo.getColumnHeaders().forEach(function(header){
      addColumn(header);
    });
    _this.taboo.getRows({objects:false}).forEach(function(row){
      addRow({data:row});
    });
  };
  
  this.updateTaboo = function(newTaboo){
    this.taboo = newTaboo;
    syncToHtml();
  };
  
  // when changes occur in the table this updates the taboo table
  function syncToTaboo(){
    taboo.clear({silent:true});
    var headers = tableElement.querySelector('thead tr').children;
    for (var i = 0; i < headers.length; i++) {
      taboo.addColumns([headers[i].querySelector('span').textContent], {silent:true});
    }
    var rows = tableElement.querySelectorAll('tbody tr');
    for (i = 0; i < rows.length; i++){
      var row = rows[i];
      var cells = [];
      for (var j = 0; j < row.children.length; j++){
        cells.push(row.children[j].textContent);
      }
      taboo.addRow(cells, {silent:true});
    }
    // manually trigger taboo callbacks
    taboo.triggerCallbacks('update');
  };
  
  function registerCallbacks(){
    taboo.registerCallback('update', syncToHtml);
  }
  
  // copy the style from the copyElement to the newElement
  function copyStyle(newElement, copyElement){
    var activeStyle = window.getComputedStyle(copyElement);
    cloneProperties.forEach(function(property){
      newElement.style[property] = activeStyle[property];
    });
  }
  
  var addRow = this.addRow = function(options) {
    var index, data;
    if (typeof options === 'undefined'){
      options = {};
    }
    if (options.hasOwnProperty('index')){
      index = options.index;
    } 
    if (options.hasOwnProperty('data')){
      data = options.data;
    }

    var currentTr = tableElement.querySelector('tbody tr'),
        tbody = tableElement.querySelector('tbody'),
        currentTd,
        newTr;
    
    // fucked if i know why
    index = index + 1;
    // if no index, append at the end, otherwise create at index point
    if (!index) {
      newTr = tbody.appendChild(document.createElement('tr'));
    } else {
      var before = tbody.querySelector('tr:nth-of-type(' + index +')');
      if (typeof before === 'undefined'){
        newTr = tbody.appendChild(document.createElement('tr'));
      } else {
        newTr = tbody.insertBefore(document.createElement('tr'), before);
      }
    }
    // check if there are any rows
    // if so get an existing cell so we can later copy the style
    if (currentTr){
      currentTd = currentTr.querySelector('td');
    }
    // add the event handlers for the buttons
    rowButtons(newTr);
    // create the rows
    var elem;
    var headers = tableElement.querySelector('thead tr').children;
    for (var i = 0; i < headers.length; i++){
      elem = document.createElement('td');
      if (currentTd){
        copyStyle(elem, currentTd);
      };
      // if data has been passed need to add that to th newly created cells
      if (data) {
        elem.textContent = data[i];
      }
      elem.tabIndex = '1';
      newTr.appendChild(elem);
      
    }
    return newTr;
  };

  var addColumn = this.addColumn = function(columnName, columnData){
    if (typeof columnName === "undefined") {
      columnName = 'empty';
    }
    if (typeof columnData === 'undefined'){
      columnData = [];
    }
    var newTh = tableElement
          .querySelector('thead tr')
          .appendChild(document.createElement('th')),
        newSpan = newTh.appendChild(document.createElement('span'));
    
    newSpan.textContent = columnName;
    var allTrs = tableElement.querySelectorAll('tbody tr');
    for (var i = 0; i < allTrs.length; i++) {
      var tr = allTrs[i];
      var text;
      if (columnData[i] == 'undefined'){
        text = '';
      } else {
        text = columnData[i];
      }
      var newTd = tr.appendChild(document.createElement('td'));
      newTd.tabIndex = '1';
      newTd.textContent = text;
    }
  };
  
  var deleteColumn = this.deleteColumn = function(index){
    var th = tableElement.querySelector('thead tr th:nth-of-type(' + index +')'),
        headTr = tableElement.querySelector('thead tr');
    headTr.removeChild(th);
    // remove the tbody rows
    var allTrs = tableElement.querySelectorAll('tbody tr');
    for (var i = 0; i < allTrs.length; i++) {
      var tr = allTrs[i];
      var td = tr.querySelector(':nth-of-type('+ index +')');
      tr.removeChild(td);
    }
  };
  
  var deleteRow = this.deleteRow = function(index){
    var tr = tableElement.querySelector('tbody tr:nth-of-type('+ index + ')'),
        tbody = tableElement.querySelector('tbody');
    tbody.removeChild(tr);
  };

  // adding rows 
  var killEvent = document.createEvent('Event');
  killEvent.initEvent('kill', true, true);
  var stopKillEvent = document.createEvent('Event');
  stopKillEvent.initEvent('stopKill', true, true);
  
  var createRowButtons = function(event) {
    var td = event.target,
        tr = td.parentNode,
        table = tr.parentNode;
    
    // if it already exists, then return early
    var existingButtonDiv = tr.querySelector('.buttonsDiv');
    if (existingButtonDiv) {
      existingButtonDiv.dispatchEvent(stopKillEvent);
      return existingButtonDiv;
    }
    
    var rect = tr.getBoundingClientRect();
    var buttonDiv = document.createElement('div'),
        plus = document.createElement('p'),
        minus = document.createElement('p'),
        buttonDivWidth = 20;
    
    buttonDiv.className = 'buttonsDiv';
    buttonDiv.appendChild(plus);
    buttonDiv.appendChild(minus);
    buttonDiv.style.top = rect.top + document.body.scrollTop + 'px';
    buttonDiv.style.left = (rect.right + document.body.scrollLeft - buttonDivWidth - 60) + 'px';
    plus.textContent = '+';
    minus.textContent = '—';
    plus.className = 'plus';
    minus.className = 'minus';
    
    var plusClickHandler = function(event){
      // stop the editor from doing its thing
      event.stopPropagation();
      var plusButton = event.target,
          bd = plusButton.parentNode,
          tr = bd.parentNode,
          tbody = tr.parentNode,
          index = Array.prototype.indexOf.call(tbody.childNodes, tr);
      addRow({index:index});
    };
    
    var minusClickHandler = function(event){
      // stop the editor from doing its thing
      event.stopPropagation();
      // do the things
      var minusButton = event.target,
          bd = minusButton.parentNode,
          tr = bd.parentNode,
          tbody = tr.parentNode;
      tbody.removeChild(tr);
    };
    
    plus.addEventListener('click', plusClickHandler);
    plus.addEventListener('dblclick', plusClickHandler);
    minus.addEventListener('click', minusClickHandler);
    minus.addEventListener('dblclick', minusClickHandler);
    
    // handlers for killing the buttonDiv
    var timeoutID, 
        killing = false;
    
    // timed, cancellable kill signal    
    buttonDiv.addEventListener('kill', function() {
      // if already killing the buttonDiv, don't add another kill timer
      if (killing){
        return;
      } else {
        killing = true;
        timeoutID = window.setTimeout(function(){
          tr.removeChild(buttonDiv);
        }, 50);
      }
    });
    
    buttonDiv.addEventListener('stopKill', function(){
      console.log('stopKill');
      killing = false;
      window.clearTimeout(timeoutID);
    });
    
    // if we mouseover then stop the kill
    buttonDiv.addEventListener('mouseover', function(){
      console.log('mouseover');
      buttonDiv.dispatchEvent(stopKillEvent);
    });
    
    // if we mouseout then kill the buttonrow
    buttonDiv.addEventListener('mouseout', function(){
      buttonDiv.dispatchEvent(killEvent);
    });
    
    // add the button div to the row
    tr.appendChild(buttonDiv);
    return buttonDiv;
  };
  
  var removeRowButtons = function(event){
    var td = event.target,
        tr = td.parentNode;
    var buttonsDiv = tr.querySelector('.buttonsDiv');
    if (buttonsDiv) {
      buttonsDiv.dispatchEvent(killEvent);
    }
  };
  
  var rowButtons = function(tr){
    // create buttons
    tr.addEventListener('mouseover', createRowButtons);
    // remove buttons
    tr.addEventListener('mouseout', removeRowButtons);
    tr.addEventListener('click', removeRowButtons);
  };
  
  // 

  var clearTable = function(){
    tableElement.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';
  };
  
  // allows cells in the html table to altered
  function Editor(elementName, options){
    var defaultOptions = {
	  cloneProperties: ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					    'text-align', 'font', 'font-size', 'font-family', 'font-weight',
					    'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'height',
                        'width'],
	  editor: document.createElement('textarea')
    };
    
	var buildDefaultOptions = function () {
	  var opts = _.extend({}, defaultOptions);
	  return opts;
	};
    
    var element = tableElement,
		activeOptions = _.extend(buildDefaultOptions(), options),
		ARROW_LEFT = 37, ARROW_UP = 38, ARROW_RIGHT = 39, ARROW_DOWN = 40, ENTER = 13, ESC = 27, TAB = 9,
	    editor,
		active;
    
    var showEditor = function(event) {
	  active = event.target;
      if (active === element){
        // user has clicked the table itself, not a cell within the table
        return;
      }
	  if (active) {
		editor.value = active.textContent;
        var activeStyle = window.getComputedStyle(active);
        activeOptions.cloneProperties.forEach(function(property){
          editor.style[property] = activeStyle[property];
        });
		editor.classList.remove('error');
		editor.style.display = '';
        var rect = active.getBoundingClientRect();
        editor.style.top = rect.top + document.body.scrollTop + 'px';
        editor.style.left = rect.left + document.body.scrollLeft + 'px';
		editor.focus();
      }
	};
    
    var setActiveText = function () {
      var newText = editor.value;
	  if (active.textContent === newText || editor.classList.contains('error')) {
		return true;
	  } else {
        active.textContent = editor.value;
      }
      // update the taboo instance to which this table is linked
      syncToTaboo();
      return undefined;
	};
    
    var movement = function (cell, keycode) {
      var currentIndex;
	  if (keycode === ARROW_RIGHT) {
		return cell.nextElementSibling;
	  } else if (keycode === ARROW_LEFT) {
		return cell.previousElementSibling;
	  } else if (keycode === ARROW_UP) {
        currentIndex = Array.prototype.indexOf.call(cell.parentNode.children, cell);
        var previous = cell.parentNode.previousElementSibling;
        if (previous){
          return previous.children[currentIndex];
        } else{
          return false;
        }
	  } else if (keycode === ARROW_DOWN || keycode === ENTER) {
        currentIndex = Array.prototype.indexOf.call(cell.parentNode.children, cell);
        var nextRow = cell.parentNode.nextElementSibling;
        // if there is another row beneath this one, move to it
        if (nextRow){
          return nextRow.children[currentIndex];
        } else {
          // otherwise create a new row below it
          nextRow = addRow();
          return nextRow.children[currentIndex];
        }
	  }
	  return false;
	};
    
    editor = document.querySelector('body').appendChild(document.createElement('input'));
    editor.style.position= 'absolute';
    editor.style.display = 'none';
    
    // editor event listeners
    editor.addEventListener('blur', function () {
	  setActiveText();
	  editor.style.display = 'none';
	});
    
    editor.addEventListener('keydown', function (e) {
      var atEnd = editor.selectionEnd === editor.value.length,
          atStart = editor.selectionEnd === 0,
          currentColumnIndex = Array.prototype.indexOf.call(active.parentNode.children, active),
          currentRowIndex = Array.prototype.indexOf.call(active.parentNode.parentNode.children, active.parentNode);
	  if (e.which === ENTER) {
        editor.dispatchEvent(new Event('blur'));
        e.preventDefault();
		e.stopPropagation();
        var cell = element.querySelector('tr:nth-child(' + (currentRowIndex + 1)  + 
                                         ") td:nth-child(" + (currentColumnIndex + 1) + ")");
        var move = movement(cell, ENTER);
        move.focus();
	  } else if (e.which === ESC) {
        // ignore typed values, hide input editor
		editor.value = active.textContent;
		e.preventDefault();
		e.stopPropagation();
		editor.style.display = 'none';
		active.focus();
	  } else if (e.which === TAB) {
		setActiveText();
		editor.style.display = 'none';
        var cell = element.querySelector('tr:nth-child(' + (currentRowIndex + 1)  + 
                                         ") td:nth-child(" + (currentColumnIndex + 1) + ")");
        var possibleMove = movement(cell, ARROW_RIGHT);
        if (possibleMove){
          possibleMove.focus();
        } else {
          active.focus();
        }
		e.preventDefault();
		e.stopPropagation();
	  } else if ((atEnd && (e.which === ARROW_DOWN || 
                            e.which === ARROW_RIGHT))
                 || 
                 atStart && (e.which === ARROW_UP || 
                             e.which === ARROW_LEFT)) {
		var possibleMove = movement(active, e.which);
		if (possibleMove) {
          possibleMove.focus();
		  e.preventDefault();
		  e.stopPropagation();
		}
	  }
	});
    
    var validate = function () {
      // TODO do something?
	};
    editor.addEventListener('paste', validate);
    editor.addEventListener('input', validate);
    // element 
    element.addEventListener('click', showEditor);
    element.addEventListener('keypress', showEditor);
    element.addEventListener('dblclick', showEditor);
    element.style.cursor = 'pointer';
    element.addEventListener('keydown', function(e) {
	  var prevent = true,
		  possibleMove = movement(e.target, e.which);
	  if (possibleMove) {
		possibleMove.focus();
	  } else if (e.which === ENTER) {
		showEditor(false);
	  } else if (e.which === 17 || e.which === 91 || e.which === 93) {
		showEditor(true);
		prevent = false;
      } else {
		prevent = false;
	  }
	  if (prevent) {
		e.stopPropagation();
		e.preventDefault();
	  }
	});
    
    // add tabIndex to each td so it can be focused
    var tdElements = element.getElementsByTagName('td');
    for (var i = 0; i < tdElements.length; i++){
      tdElements[i].tabIndex = '1';
    }
    
	window.addEventListener('resize', function () {
	  if (editor.style.display !== 'none') {
        var rect = active.getBoundingClientRect();
        editor.style.top = rect.top + document.body.scrollTop + 'px';
        editor.style.left = rect.left + document.body.scrollLeft + 'px';
        editor.style.width = active.offsetWidth + 'px';
        editor.style.height = active.offsetHeight + 'px';
	  }
	});
  };
  
  // init
  
  var e = new Editor(elementName);
  syncToHtml(taboo);
  registerCallbacks();

  
};

