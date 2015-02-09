
var tabooTable = function (elementName, options) {
    
    // allows cells in the html table to altered
    function Editor(elementName, options){
        var defaultOptions = {
	        cloneProperties: ['padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
					          'text-align', 'font', 'font-size', 'font-family', 'font-weight',
					          'border', 'border-top', 'border-bottom', 'border-left', 'border-right'],
	        editor: document.createElement('textarea')
        };
	    var buildDefaultOptions = function () {
		    var opts = _.extend({}, defaultOptions);
		    opts.editor = opts.editor.cloneNode();
		    return opts;
	    };
        var element = document.querySelector(elementName),
		    activeOptions = _.extend(buildDefaultOptions(), options),
		    ARROW_LEFT = 37, ARROW_UP = 38, ARROW_RIGHT = 39, ARROW_DOWN = 40, ENTER = 13, ESC = 27, TAB = 9,
	        editor,
		    active;
        
        var showEditor = function (select) {
			active = element.querySelector('td:hover');
			if (active) {
				editor.value = active.textContent;
                var activeStyle = window.getComputedStyle(active);
                activeOptions.cloneProperties.forEach(function(property){
                    try {
                        editor.style[property] = activeStyle[property];
                    } catch (e){}; // silent fail is best fail
                });
			    editor.classList.remove('error');
			    editor.style.display = '';
                var rect = active.getBoundingClientRect();
                editor.style.top = rect.top + document.body.scrollTop + 'px';
                editor.style.left = rect.left + document.body.scrollLeft + 'px';
                // editor.style.width = active.offsetWidth + 'px';
                // editor.style.height = active.offsetHeight + 'px';
			    editor.focus();
			    if (select) {
				    editor.select();
			    }
            }
		};
        var setActiveText = function () {
            var newText = editor.value;
		    if (active.textContent === newText || editor.classList.contains('error')) {
			    return true;
		    } else {
                active.textContent = editor.value;
            }
            return undefined;
	    };
        var movement = function (element, keycode) {
		    if (keycode === ARROW_RIGHT) {
			    return element.nextElementSibling;
		    } else if (keycode === ARROW_LEFT) {
			    return element.previousElementSibling;
		    } else if (keycode === ARROW_UP) {
			    return element.parent().prev().children().eq(element.index());
		    } else if (keycode === ARROW_DOWN) {
			    return element.parent().next().children().eq(element.index());
		    }
		    return [];
	    };
        
        editor = element.parentNode.appendChild(document.createElement('input'));
        editor.style.position= 'absolute';
        editor.style.display = 'none';
        
        // editor event listeners
        editor.addEventListener('blur', function () {
		    setActiveText();
		    editor.style.display = 'none';
	    });
        editor.addEventListener('keydown', function (e) {
		    if (e.which === ENTER) {
			    setActiveText();
			    editor.style.display = 'none';
			    active.focus();
			    e.preventDefault();
			    e.stopPropagation();
		    } else if (e.which === ESC) {
			    editor.value = active.textContent;
			    e.preventDefault();
			    e.stopPropagation();
			    editor.hide();
			    active.focus();
		    } else if (e.which === TAB) {
			    active.focus();
		    } else if (this.selectionEnd - this.selectionStart === this.value.length) {
			    var possibleMove = movement(active, e.which);
			    if (possibleMove.length > 0) {
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
        var tableListener = function(e) {
		    var prevent = true,
			    possibleMove = movement((e.target), e.which);
		    if (possibleMove.length > 0) {
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
	    };
        element.addEventListener('keydown', tableListener);
        element.addEventListener('click', tableListener);
        element.addEventListener('dblclick', tableListener);
	    element.querySelector('td').tabindex = 1;
        
	    window.addEventListener('resize', function () {
		    if (editor.matches(':visible')) {
                var rect = active.getBoundingClientRect();
                editor.style.top = rect.top + document.body.scrollTop + 'px';
                editor.style.left = rect.left + document.body.scrollLeft + 'px';
                editor.style.width = active.offsetWidth + 'px';
                editor.style.height = active.offsetHeight + 'px';
		    }
	    });
    };
    
    // init
    (function (){
        Editor(elementName, options);
    })();
    
};

