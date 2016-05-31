
var tabooTable = function (elementName, taboo, userOptions) {
  var defaultOptions = {
    addRowsButtons: true,
    addRowHeaderButtons: true,
    editableRows: true,
    editableRowHeader: true,
    autocomplete: true
  },
      globalOptions = {};
  if (_.isObject(userOptions)){
    _.extend(globalOptions, defaultOptions, userOptions);
  } else {
    globalOptions = defaultOptions;
  }
  
  var tableElement = document.querySelector(elementName),
      _this = this,
      cloneProperties= ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
		                    'text-align', 'font', 'font-size', 'font-family', 'font-weight',
		                    'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'height',
                        'width'];
  this.taboo = taboo;
  
  if (tableElement === null) {
    console.log("Taboo-Table Selector " + elementName + " does not exist");
    return;
  }
  
  // When changes occur in the taboo table, this updates the html 
  function syncToHtml(taboo){
    clearTable();
    _this.taboo.getColumnHeaders().forEach(function(header){
      addColumn(header);
    });
    _this.taboo.getRows({objects:false}).forEach(function(row){
      addRow({data:row});
    });
  }
  
  this.updateTaboo = function(newTaboo){
    this.taboo = newTaboo;
    syncToHtml();
  };
  
  // when changes occur in the html table this updates the taboo table
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
        cells.push(row.children[j].querySelector('span').textContent);
      }
      taboo.addRow(cells, {silent:true});
    }
    // manually trigger taboo callbacks
    taboo.triggerCallbacks('update');
  }
  
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
    var existingTr = tableElement.querySelector('tbody tr'),
        existingTd = tableElement.querySelector('tbody td'),
        tbody = tableElement.querySelector('tbody'),
        newTr;
    index = index + 1;
    // if no index, append at the end, otherwise create at index point
    if (!index) {
      newTr = tbody.appendChild(document.createElement('tr'));
      if (existingTr){
        copyStyle(newTr, existingTr);
      }
    } else {
      var before = tbody.querySelector('tr:nth-of-type(' + index +')');
      if (typeof before === null){
        newTr = tbody.appendChild(document.createElement('tr'));
      } else {
        newTr = tbody.insertBefore(document.createElement('tr'), before);
      }
    }
    // create the rows
    var td,
        span,
        headers = tableElement.querySelector('thead tr').children;
    for (var i = 0; i < headers.length; i++) {
      td = document.createElement('td');
      span = document.createElement('span');
      td.appendChild(span);
      if (existingTd){
        copyStyle(td, existingTd);
      }
      // if data has been passed need to add that to the newly created cells
      if (data) {
        span.textContent = data[i];
      } else {
        span.textContent = "";
      }
      if (globalOptions.editableRows){
        td.tabIndex = '1';
      }
      newTr.appendChild(td);
    }
    // add the event handlers for the buttons
    if (globalOptions.addRowsButtons) {
      addRowButtonsEvents(newTr);
    }
    return newTr;
  };

  var addColumn = this.addColumn = function(columnName, columnData, index){
    if (typeof columnName === "undefined") {
      columnName = 'empty';
    }
    if (typeof columnData === 'undefined'){
      columnData = [];
    }
    // insert column heading
    var newTh;
    if (typeof index === 'number'){
      index = index + 1;
      var before = tableElement.querySelector('thead tr :nth-of-type('+ index +')');
      if (before === null){
        newTh = tableElement.querySelector('thead tr').appendChild(document.createElement('th'));        
      } else {
        newTh = tableElement.querySelector('thead tr').insertBefore(document.createElement('th'), before);
      }
    } else {
      newTh = tableElement.querySelector('thead tr').appendChild(document.createElement('th'));        
    }
    // add rows
    var newSpan = newTh.appendChild(document.createElement('span')),
        allTrs = tableElement.querySelectorAll('tbody tr');
    newSpan.textContent = columnName;
    for (var i = 0; i < allTrs.length; i++) {
      var tr = allTrs[i],
          text;
      // add data if we have it
      if (columnData[i] == 'undefined'){
        text = '';
      } else {
        text = columnData[i];
      }
      var newTd = document.createElement('td'),
          span = document.createElement('span');
      newTd.appendChild(span);      
      if (typeof index === 'number'){
        var beforeTd = tr.querySelector(':nth-of-type('+ index + ')');
        tr.insertBefore(newTd, beforeTd);
      } else {
        tr.appendChild(newTd);  
      }
      if (globalOptions.editable){
        newTd.tabIndex = '1';
      }
      span.textContent = text;
    }
    if (globalOptions.addRowHeaderButtons) {
      addColumnButtonsEvents(newTh);
    }
  };
  
  var deleteColumn = this.deleteColumn = function(index){
    var th = tableElement.querySelector('thead tr th:nth-of-type(' + (index + 1) +')'),
        headTr = tableElement.querySelector('thead tr');
    headTr.removeChild(th);
    // remove the tbody rows
    var allTrs = tableElement.querySelectorAll('tbody tr');
    for (var i = 0; i < allTrs.length; i++) {
      var tr = allTrs[i];
      var td = tr.querySelector(':nth-of-type('+ (index + 1) +')');
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
    var td;
    if (event.target.tagName === "SPAN"){
      td = event.target.parentNode;
    } else if (event.target.tagName === "TD"){
      td = event.target;
    } else {
      return undefined;
    }
    var tr = td.parentNode,
        table = tr.parentNode,
        lastTd = tr.lastChild;
    // if it already exists, then return early
    var existingButtonDiv = lastTd.querySelector('.buttonWrapper');
    if (existingButtonDiv) {
      existingButtonDiv.dispatchEvent(stopKillEvent);
      return existingButtonDiv;
    }
    var rect = tr.getBoundingClientRect();
    var buttonWrapper = document.createElement('div'),
        buttonDiv = document.createElement('div'),
        plus = document.createElement('p'),
        minus = document.createElement('p'),
        buttonDivWidth = 20;
    buttonWrapper.className = 'buttonWrapper';
    buttonWrapper.appendChild(buttonDiv);
    buttonDiv.className = 'buttonsDiv';
    buttonDiv.appendChild(plus);
    buttonDiv.appendChild(minus);
    buttonDiv.style.top = (rect.top + document.body.scrollTop + 5) + 'px';
    buttonDiv.style.left = (rect.right + document.body.scrollLeft - buttonDivWidth - 40) + 'px';
    plus.textContent = '+';
    minus.textContent = '—';
    plus.className = 'plus';
    minus.className = 'minus';
    // handlers for clicks
    var plusClickHandler = function(event){
      // stop the editor from doing its thing
      event.stopPropagation();
      var plusButton = event.target,
          bd = plusButton.parentNode,
          wrappingDiv = bd.parentNode,
          td = wrappingDiv.parentNode,
          tr = td.parentNode,
          tbody = tr.parentNode,
          index = Array.prototype.indexOf.call(tbody.childNodes, tr);
      addRow({index:index});
      syncToTaboo();
    };
    var minusClickHandler = function(event){
      // stop the editor from doing its thing
      event.stopPropagation();
      var minusButton = event.target,
          bd = minusButton.parentNode,
          wrappingDiv = bd.parentNode,
          td = wrappingDiv.parentNode,
          tr = td.parentNode,
          tbody = tr.parentNode,
          index = Array.prototype.indexOf.call(tbody.childNodes, tr);
      tbody.removeChild(tr);
      syncToTaboo();
    };
    plus.addEventListener('click', plusClickHandler);
    plus.addEventListener('dblclick', plusClickHandler);
    minus.addEventListener('click', minusClickHandler);
    minus.addEventListener('dblclick', minusClickHandler);
    // handlers for killing the buttonDiv
    var timeoutID, 
        killing = false;
    // timed, cancellable kill signal    
    buttonWrapper.addEventListener('kill', function() {
      // if already killing the buttonDiv, don't add another kill timer
      if (killing){
        return;
      } else {
        killing = true;
        timeoutID = window.setTimeout(function(){
          lastTd.removeChild(buttonWrapper);
        }, 50);
      }
    });
    buttonWrapper.addEventListener('stopKill', function(){
      killing = false;
      window.clearTimeout(timeoutID);
    });
    // if we mouseover then stop the kill
    buttonWrapper.addEventListener('mouseover', function(){
      buttonWrapper.dispatchEvent(stopKillEvent);
    });
    // if we mouseout then kill the buttonrow
    buttonWrapper.addEventListener('mouseout', function(){
      buttonWrapper.dispatchEvent(killEvent);
    });
    // add the button div to the row
    lastTd.appendChild(buttonWrapper);
    return buttonWrapper;
  };
  
  var removeRowButtons = function(event) {
    var td = event.target,
        tr = td.parentNode,
        lastTd = tr.lastChild;
    var buttonsDiv = lastTd.querySelector('.buttonWrapper');
    if (buttonsDiv) {
      buttonsDiv.dispatchEvent(killEvent);
    }
  };
  
  var addRowButtonsEvents = function(tr){
    // create buttons
    tr.addEventListener('mouseover', createRowButtons);
    // remove buttons
    tr.addEventListener('mouseout', removeRowButtons);
    tr.addEventListener('click', removeRowButtons);
  };
  
  var createColumnButtons = function(event) {
    var th;
    if (event.target.tagName === "TH"){
      th = event.target;
    } else if (event.target.tagName === "SPAN") {
      th = event.target.parentNode;
    } else {
      return undefined;
    }
    var tr = th.parentNode,
        thead = tr.parentNode;
    if (th.nodeName !== 'TH'){
      return undefined;
    }
    // if it already exists, then return early
    var existingButtonDiv = th.querySelector('.buttonsDiv');
    if (existingButtonDiv) {
      existingButtonDiv.dispatchEvent(stopKillEvent);
      return existingButtonDiv;
    }
    var rect = th.getBoundingClientRect();
    var buttonDiv = document.createElement('div'),
        plus = document.createElement('p'),
        minus = document.createElement('p'),
        buttonDivWidth = 20;
    buttonDiv.className = 'buttonsDiv';
    buttonDiv.appendChild(plus);
    buttonDiv.appendChild(minus);
    buttonDiv.style.top = (rect.top + document.body.scrollTop + 5) + 'px';
    buttonDiv.style.left = (rect.right + document.body.scrollLeft - buttonDivWidth - 40) + 'px';
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
      addColumn("New Column", undefined, index);
      syncToTaboo();
    };
    
    var minusClickHandler = function(event){
      // stop the editor from doing its thing
      event.stopPropagation();
      // do the things
      var minusButton = event.target,
          bd = minusButton.parentNode,
          th = bd.parentNode,
          thead = th.parentNode,
          index = Array.prototype.indexOf.call(thead.childNodes, th);
      deleteColumn(index);
      syncToTaboo();
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
          th.removeChild(buttonDiv);
        }, 50);
      }
    });
    buttonDiv.addEventListener('stopKill', function() {
      killing = false;
      window.clearTimeout(timeoutID);
    });
    // if we mouseover then stop the kill
    buttonDiv.addEventListener('mouseover', function(){
      buttonDiv.dispatchEvent(stopKillEvent);
    });
    // if we mouseout then kill the buttonrow
    buttonDiv.addEventListener('mouseout', function(){
      buttonDiv.dispatchEvent(killEvent);
    });
    // add the button div to the row
    th.appendChild(buttonDiv);
    return buttonDiv;
  };
  
  var removeColumnButtons = function(event) {
    var th = event.target,
        tr = th.parentNode;
    var buttonsDiv = th.querySelector('.buttonsDiv');
    if (buttonsDiv) {
      buttonsDiv.dispatchEvent(killEvent);
    }
  };
  
  var addColumnButtonsEvents = function(th){
    th.addEventListener('mouseover', createColumnButtons);
    th.addEventListener('mouseout', removeColumnButtons);
    th.addEventListener('click', removeColumnButtons);
  };

  var clearTable = function(){
    tableElement.innerHTML = '<thead><tr></tr></thead><tbody></tbody>';
  };
  
  // allows cells in the html table to altered
  var Editor = function(options){
    var defaultOptions = {
	    cloneProperties: ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					              'text-align', 'font', 'font-size', 'font-family', 'font-weight',
					              'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'height',
                        'width']
    };
    
    var element = tableElement,
        editor = document.querySelector('body').appendChild(document.createElement('input')),
		    activeOptions = _.extend({}, defaultOptions, options),
		    ARROW_LEFT = 37, ARROW_UP = 38, ARROW_RIGHT = 39, ARROW_DOWN = 40, ENTER = 13, ESC = 27, TAB = 9,
        F2 = 113, LEFT_WINDOWS = 91, RIGHT_WINDOWS = 92, SELECT = 93, CTRL = 17, BACKSPACE = 8,
		    active,
        cursorPosition;
    
    editor.style.position= 'absolute';
    editor.style.display = 'none';
    element.style.cursor = 'pointer';
    
    var showEditor = function(event) {
	    active = event.target;
      if (active === element) {
        // user has clicked the table itself, not a cell within the table
        return;
      }
	    if (active) {
        if (active.tagName === "SPAN"){
          active = active.parentNode;
        }
        if (active.parentNode.parentNode.tagName === "TBODY" && !globalOptions.editableRows ||
            active.parentNode.parentNode.tagName === "THEAD" && !globalOptions.editableRowHeader){
          return;
        }
        editor.value = active.querySelector('span').textContent;
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
	    if (active.querySelector('span').textContent === newText || editor.classList.contains('error')) {
		    return true;
	    } else {
        active.querySelector('span').textContent = editor.value;
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
    
    var editorBlur = function (e) {
	    setActiveText();
	    editor.style.display = 'none';
	  };
    
    var editorKeydown = function(e) {
      var atEnd = editor.selectionEnd === editor.value.length,
          atStart = editor.selectionEnd === 0,
          currentColumnIndex = Array.prototype.indexOf.call(active.parentNode.children, active),
          currentRowIndex = Array.prototype.indexOf.call(active.parentNode.parentNode.children, active.parentNode),
          cell,
          possibleMove;
	    if (e.which === ENTER) {
        editor.dispatchEvent(new Event('blur'));
        e.preventDefault();
		    e.stopPropagation();
        cell = element.querySelector('tr:nth-child(' + (currentRowIndex + 1)  + 
                                     ") td:nth-child(" + (currentColumnIndex + 1) + ")");
        var move = movement(cell, ENTER);
        move.focus();
	    } else if (e.which === ESC) {
        // ignore typed values, hide input editor
        editor.value = active.querySelector('span').textContent;
		    e.preventDefault();
		    e.stopPropagation();
		    editor.style.display = 'none';
		    active.focus();
	    } else if (e.which === TAB) {
		    setActiveText();
		    editor.style.display = 'none';
        cell = element.querySelector('tr:nth-child(' + (currentRowIndex + 1)  + 
                                     ") td:nth-child(" + (currentColumnIndex + 1) + ")");
        possibleMove = movement(cell, ARROW_RIGHT);
        if (possibleMove) {
          possibleMove.focus();
        } else {
          active.focus();
        }
		    e.preventDefault();
		    e.stopPropagation();
	    } else if ((atEnd && (e.which === ARROW_DOWN || e.which === ARROW_RIGHT)) ||
                 atStart && (e.which === ARROW_UP || e.which === ARROW_LEFT)) {
		    possibleMove = movement(active, e.which);
		    if (possibleMove) {
          possibleMove.focus();
		      e.preventDefault();
		      e.stopPropagation();
		    }
	    } else {
        insert(e, currentColumnIndex, currentRowIndex);
      }
	  };
    
    var insert = function (e, currentColumnIndex, currentRowIndex){
      if (globalOptions.autocomplete){
        var currentCursorPosition = editor.selectionStart,
            pressedKey = e.shiftKey ? String.fromCharCode(e.which) : String.fromCharCode(e.which).toLowerCase(),
            highlightedText = window.getSelection().toString(),
            getMatches = function(){
              // get the current column values
              var cells = element.querySelectorAll('tr td:nth-child(' + (currentColumnIndex + 1) + ') span');
              var matches = [];
              Array.prototype.forEach.call(cells, function(cell, idx) {
                if (idx === currentRowIndex) return;
                if (cell.textContent.startsWith(editor.value)){
                  matches.push(cell.textContent);
                }
                matches.sort();
              });
              return matches;
            },
            alphaNumericRegex = /[a-zA-Z0-9]/;
        
        // only do autocomplete if the key is alphanumeric
        if (alphaNumericRegex.exec(pressedKey)) {
          var matches;
          e.preventDefault();
          
          // check if there is a suggestion 
          if (highlightedText.length === 0){ // no suggestion
            editor.value = editor.value + pressedKey;
            // check if there is a potential autocomplete
            matches = getMatches();
            if (matches.length > 0){
              // slice the first match in
              editor.value = editor.value + matches[0].slice(currentCursorPosition + 1, matches[0].length);
              // highlight suggestion
              editor.setSelectionRange(currentCursorPosition + 1, matches[0].length);
            }

          } else { // suggestion already there
            // get current suggestion
            var suggestion = window.getSelection();
            editor.value = editor.value.slice(0, editor.selectionStart) + editor.value.slice(editor.selectionEnd);
            // insert the character before the suggestion
            editor.value = editor.value + pressedKey;
            // reupdate the suggestion
            matches = getMatches();
            if (matches.length > 0) {
              // slice the first match in
              editor.value = editor.value + matches[0].slice(currentCursorPosition + 1, matches[0].length);
              // highlight suggestion
              editor.setSelectionRange(currentCursorPosition + 1, matches[0].length);
            }
          }
        }
      }
    };

    // intercept keys for movement 
    var elementKeydown = function(e) {
	    var prevent = true,
		      possibleMove = movement(e.target, e.which);
	    if (possibleMove) {
		    possibleMove.focus();
	    } else if (e.which === ENTER) {
		    showEditor(false);
	    } else if (e.which === CTRL || e.which === LEFT_WINDOWS || e.which === RIGHT_WINDOWS, e.which === F2) {
		    showEditor(true);
		    prevent = false;
      } else if (e.which === BACKSPACE){
        prevent = true;
      } else {
		    prevent = false;
	    }
	    if (prevent) {
		    e.stopPropagation();
		    e.preventDefault();
	    }
	  };
    
    var validate = function (event) {
      // TODO do something?
	  };

    var windowResize = function (event) {
	    if (editor.style.display !== 'none') {
        var rect = active.getBoundingClientRect();
        editor.style.top = rect.top + document.body.scrollTop + 'px';
        editor.style.left = rect.left + document.body.scrollLeft + 'px';
        editor.style.width = active.offsetWidth + 'px';
        editor.style.height = active.offsetHeight + 'px';
	    }
	  };
    
    // Add event listeners
    editor.addEventListener('paste', validate);
    editor.addEventListener('input', validate);
    editor.addEventListener('blur', editorBlur);
    editor.addEventListener('keydown', editorKeydown);
    
    element.addEventListener('click', showEditor);
    element.addEventListener('keypress', showEditor);
    element.addEventListener('dblclick', showEditor);
    element.addEventListener('keydown', elementKeydown);
    
	  window.addEventListener('resize', windowResize);
  };
  
  // init
  var e = new Editor();
  syncToHtml(taboo);
  // add a single empty row if there are headers but no rows in the taboo
  if (taboo.numberOfColumns() > 0 && taboo.numberOfRows() === 0){
    addRow();
  }
  
  registerCallbacks();
};

