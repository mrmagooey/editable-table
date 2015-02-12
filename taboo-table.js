
var tabooTable = function (elementName, taboo) {
    var tableElement = document.querySelector(elementName),
        _this = this,
        cloneProperties= ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
		                  'text-align', 'font', 'font-size', 'font-family', 'font-weight',
		                  'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'height',
                          'width'];
    
    this.taboo = taboo;
    
    function copyStyle(newElement, copyElement){
        var activeStyle = window.getComputedStyle(copyElement);
        cloneProperties.forEach(function(property){
            newElement.style[property] = activeStyle[property];
        });
    }
    
    // When changes occur in the taboo table, this updates the html 
    function syncToHtml(taboo){
        clearTable();
        _this.taboo.getColumnHeaders().forEach(function(header){
            addColumn(header);
        });
        _this.taboo.getRows({array:true}).forEach(function(row){
            addRow(row);
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
        for (var i = 0; i < headers.length; i++){
            taboo.addColumns([headers[i].textContent], {silent:true});
        }
        var rows = tableElement.querySelectorAll('tbody tr');
        for (i = 0; i < rows.length; i++){
            var row = rows[i];
            var cells = [];
            for (var j = 0; j < row.children.length; j++){
                cells.push(row.children[j].textContent);
            }
            taboo.addRows([cells], {silent:true});
        }
        // manually trigger taboo callbacks
        taboo.triggerCallbacks('update');
    };
    
    function registerCallbacks(){
        taboo.registerCallback('update', syncToHtml);
    }
    
    // 
    var addRow = function(data){
        var currentTr = tableElement.querySelector('tbody tr'),
            currentTd;
        
        if (currentTr){
            currentTd = currentTr.querySelector('td');
        }
            
        if (data){
            // add row
            var newTr = tableElement.querySelector('tbody').appendChild(document.createElement('tr'));
            // add columns
            for (var i = 0; i < data.length; i++){
                var elem = document.createElement('td');
                if (currentTd){
                    copyStyle(elem, currentTd);
                };
                elem.textContent = data[i];
                elem.tabIndex = '1';
                newTr.appendChild(elem);
            }
            return newTr;
        } else {
            var newTr = tableElement.querySelector('tbody').appendChild(document.createElement('tr'));
            if (currentTr){
                for (var i = 0; i < currentTr.children.length; i++){
                    var elem = document.createElement('td');
                    if (currentTd){
                        copyStyle(elem, currentTd);
                    };

                    elem.tabIndex = '1';
                    newTr.appendChild(elem);
                }
            }
            return newTr;
        }
    };

    // 
    var deleteRow = function(){
        var rows = tableElement.querySelectorAll('tbody tr');
        var lastRow = rows[rows.length -1];
        lastRow.parentNode.removeChild(lastRow);
    };
    
    var addColumn = function(columnHeader){
        var header = document.createElement('th');
        header.textContent = columnHeader;
        tableElement.querySelector('thead tr').appendChild(header);
        var rows = tableElement.querySelectorAll('tbody tr');
        for (var i = 0; i < rows.length; i++) {
            var elem = document.createElement('td');
            elem.tabIndex = '1';
            rows[i].appendChild(elem);
        }
    };
    
    var removeColumn = function(columnHeader){
        tableElement.querySelector('thead tr');
    };
    
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
		    } else if (keycode === ARROW_DOWN) {
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
                atStart = editor.selectionEnd === 0;
		    if (e.which === ENTER) {
			    setActiveText();
			    editor.style.display = 'none';
                // move down in addition to setting the text
                var move = movement(active, ARROW_DOWN);
                move.focus();
			    e.preventDefault();
			    e.stopPropagation();
		    } else if (e.which === ESC) {
                // ignore typed values, hide input editor
			    editor.value = active.textContent;
			    e.preventDefault();
			    e.stopPropagation();
			    editor.style.display = 'none';
			    active.focus();
		    } else if (e.which === TAB) {
			    active.focus();
		    } else if ((atEnd && (e.which === ARROW_DOWN || 
                                  e.which === ARROW_RIGHT))
                        || 
                        atStart && (e.which === ARROW_UP || 
                                    e.which === ARROW_LEFT)) {
			    var possibleMove = movement(active, e.which);
			    if (possibleMove) {
                    window.possibleMove = possibleMove;
                    possibleMove.focus();
				    e.preventDefault();
				    e.stopPropagation();
			    }
		    }
	    });
        
        var validate = function () {
            
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

