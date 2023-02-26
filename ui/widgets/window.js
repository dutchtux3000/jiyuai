var KEY_CLOSE_WINDOW = 5911 // ctrl + w
var KEY_NEXT_WIDGET = 16393 // tab
var KEY_PREV_WIDGET = 16511 // ctrl + tab
var KEY_CLICK_WIDGET = 17165 // enter
var KEY_CLICK_WIDGET_ALT = 23309 // enter keypad

/**
 * UI Window object
 * 
 * @param {string} id 
 * @param {string} title 
 */
function UIWindow(id, title) {
  UIWidget.call(this);
  
  this.id = id

  this.title = title  
  this.menu = [];
  this.isClosable = true;
  this.isModal = false;
  this.showTitlebar = true;
  this.destroyOnClose = false;
  this.onlyWhenInFocus = true;
  
  // private props
  this.hasOwnDrawBuffer = true;
  this._isCloseDown = false;
  this._titlebarFont = 'pc8x8'
  this._menuBarFont = 'pc8x8'
  this._windowBuffer = undefined;

  this.setSize(SizeX() - (24 * 2), this.h = SizeY() - (24 * 2) - 20)
  this.setPosition(24, 44);
}

UIWindow.prototype = Object.create(UIWidget.prototype);
UIWindow.prototype.constructor = UIWindow;

/**
 * called when the window is added to the UIApp object
 */
UIWindow.prototype.init = function() {
}

/**
 * Draw the window to the screen
 */
UIWindow.prototype.draw = function() {
  if (!this._windowBuffer) {
    this._windowBuffer = new Bitmap(this.w + 1, this.h + 1, EGA.WHITE);
  }

  // set render target for the widgets.
  if (this._needsDraw === true) {

    SetRenderBitmap(this._windowBuffer);
    
    FilledBox(0, 0, this.w, this.h, EGA.WHITE);
    Box(0, 0, this.w, this.h, EGA.BLACK);
    
    // draw children
    this._renderChildren();
    
    // draw titlebar
    if (this.showTitlebar) {
      this.drawTitlebar();
    }

    SetRenderBitmap(null);

    // reset redraw
    this._needsDraw = false;    
  }

  // draw buffer to screen
  if ((this.x <= 0) || (this.y <= 0)) {
    var offsetX = (this.x <= 0) ?  Math.abs(this.x) : 0
    var offsetY = (this.y <= 0) ?  Math.abs(this.y) : 0
    this._windowBuffer.DrawAdvanced(offsetX, offsetY, (this.w + 1) - offsetX, (this.h + 1) - offsetY, (this.x + offsetX), (this.y + offsetY), (this.w + 1) - offsetX, (this.h + 1) - offsetY)    
  } else {
    this._windowBuffer.Draw(this.x, this.y);    
  }

  // draw shadow
  if (this.isActive) {
    // bottom
    Line(this.x + 2, this.y + this.h + 1, this.x + this.w + 1, this.y + this.h + 1, EGA.DARK_GREY)

    // right
    Line(this.x + this.w + 1, this.y + 2, this.x + this.w + 1, this.y + this.h, EGA.DARK_GREY)  
  }


  if (this.isModal) {
    this.drawMenubarTitle();
  }

}

/**
 * Draw titlebar
 */
UIWindow.prototype.drawTitlebar = function () {
  Box(0, 0, this.w, 20, EGA.BLACK);

  // close button
  if (this.isClosable) {
    Box(4, 4, 16, 16, EGA.BLACK);
    if (this._isCloseDown) {
      Line(7, 7, 13, 13, EGA.BLACK)
      Line(13, 7, 7, 13, EGA.BLACK)
    }
  }

  // title
  var font = this.app.getFont(this._titlebarFont);  
  var titleWidth = font.StringWidth(this.title);
  font.DrawStringLeft(24, 6, this.title, EGA.BLACK, NO_COLOR)

  // var lines = [6, 10, 14]
  var lines = [6, 8, 10, 12, 14]
  if (this.isActive) {
    lines.forEach(function (lineY) {
      Line(32 + titleWidth, lineY, this.w - 6, lineY, EGA.BLACK)  
    }.bind(this));
  }
}

/**
 * Draw titlebar to position of the menu bar
 */
UIWindow.prototype.drawMenubarTitle = function() {
  var font = this.app.getFont(this._menuBarFont);  
  FilledBox(0, 0, SizeX(), 20, EGA.WHITE);
  Line(0, 20, SizeX(), 20, EGA.BLACK);
  font.DrawStringCenter((SizeX() / 2), 6, this.title, EGA.BLACK, NO_COLOR)
}

/**
 * Check if position is in rect of the titlebar
 * It excludes the close button if it not clossable.
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns {bool} 
 */
UIWindow.prototype.titlebarHitTest = function(x, y) {
  var titlebarRect = Utils.createRectObj(this.x, this.y, this.w, 20)
  // check if close is not selected.
  if (this.isClosable && Utils.hitTest(x, y, this.x + 4, this.y + 4, this.x + 16, this.y + 16)) {
    return false;
  }

  return Utils.hitTestRect(x, y, titlebarRect)
}


/**
 * Handles the keyboard input of the window.
 * 
 * @param {number} key 
 * @param {number} keyCode 
 * @param {string} char 
 */
UIWindow.prototype._handleInput = function(key, keyCode, char) {
  switch (key) {
    case KEY_CLOSE_WINDOW:
      if (this.isClosable) {
        this.close();
      }
      break;
    case KEY_NEXT_WIDGET:
      this._setNextChildFocus(1);   
      break;

    case KEY_PREV_WIDGET:
      this._setNextChildFocus(-1);   
      break;
    case KEY_CLICK_WIDGET:
    case KEY_CLICK_WIDGET_ALT:
      this.children.forEach(function (child) {
        if (child.hasFocus) {
          child.onClick();
        }
      });
      break;
  }  
  var stopPropagation = false
  this.children.forEach(function (child) {
    if (child.hasFocus) {
      stopPropagation = child._handleInput(key, keyCode, char)
    }
  })

  if (stopPropagation !== true) {
    this.onKeyPress(key, keyCode);
  }
}

/**
 * Handles mouse input of the window.
 * 
 * @param {number} buttons 
 * @param {number} x 
 * @param {number} y 
 * @param {bool} isLeftClicked 
 */
UIWindow.prototype._handleMouseInput = function(buttons, x, y, isLeftClicked) {
  if (this.isClosable) {
    var lastCloseDown = this._isCloseDown
    this._isCloseDown = false

    if (Utils.hitTest(x, y, this.x + 4, this.y + 4, this.x + 16, this.y + 16)) {
      if (buttons === 1) {
        this._isCloseDown = true;      
      }
      if (isLeftClicked) {
        this._isCloseDown = false;
        this.close();
      }
    }
    
    if (lastCloseDown !== this._isCloseDown) {
      this.reDraw();
    }
  }

  UIWidget.prototype._handleMouseInput.call(this, buttons, x, y, isLeftClicked);
}

/**
 * Set the next available child in the window focused
 * 
 * @param {number} direction 
 */
UIWindow.prototype._setNextChildFocus = function(direction) {
  // get current focused element
  var currentFocus = -1;
  this.children.forEach(function (item, index) {
    if (item.hasFocus === true) {
      currentFocus = index;
    }
  });

  currentFocus = this._getNextFocusableChildIndex(currentFocus, direction);

  // set focus on new element
  this.children.forEach(function (item, index) {
    if (index === currentFocus) {
      item.hasFocus = true
    } else {
      item.hasFocus = false
    }
  });

  this.reDraw();
}

/**
 * Clears focus of all widgets
 */
UIWindow.prototype._clearFocusFromWidgets = function () {
  this.children.forEach(function (item) {
      item.hasFocus = false
  });

  this.reDraw();
}

/**
 * Get the next index of the child that can has focus
 * 
 * @param {number} startIndex 
 * @param {number} direction  -1 is up, 1 is down
 * @returns 
 */
UIWindow.prototype._getNextFocusableChildIndex = function (startIndex, direction) {
  var lookUpIndex = startIndex + direction
  
  if (lookUpIndex  > this.children.length - 1) {
    lookUpIndex = 0 
  }
  if (lookUpIndex < 0) {
    lookUpIndex = this.children.length - 1
  }

  if (this.children[lookUpIndex] && this.children[lookUpIndex]._canHaveFocus == true) { 
    return lookUpIndex;    
  } 

  return this._getNextFocusableChildIndex(lookUpIndex, direction);  
}

/**
 * handle the closing of the window
 * 
 * @returns 
 */
UIWindow.prototype.close = function() {
  var contClose = this.onClose();

  if (contClose === false) {
    return;
  }

  if (this.destroyOnClose) {
    this.app.removeWindowById(this.id);
  } else {
    this.app.hideWindow(this.id);
  }
}

/**
 * Handle showing the window
 */
UIWindow.prototype.show = function() {
  if (this.onShow) {
    this.onShow();
  }
}

/**
 * onClose event
 */
UIWindow.prototype.onClose = function() {  
  
}

/**
 * onshow Event 
 */
UIWindow.prototype.onShow = function() {

}

/**
 * Handle window loop[
 * ]
 * @param {number} tick 
 * @returns 
 */
UIWindow.prototype._handleLoop = function(tick) {
  if (!this.onlyWhenInFocus) {
    return;
  }

  UIWidget.prototype._handleLoop.call(this, tick)
}

/**
 * Get position for drawing widgets inside the window
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns 
 */
UIWindow.prototype.getDrawPosition = function(x, y) {
  return { x: x, y: y }
}

/**
 * Set size of window
 * 
 * @param {number} w 
 * @param {number} h 
 */
UIWindow.prototype.setSize = function(w, h) {
  this.w = w;
  this.h = h;
  this._windowBuffer = undefined; // clear window buffer from 
  this.reDraw();
}

/**
 * Set the window visible
 * 
 * @param {*} isVisible 
 */
UIWindow.prototype.setVisible = function(isVisible) {
  this.isVisible = isVisible;

  // clear out window buffer if visible is set to false (Frees memory)
  if (isVisible === false) {
    this._windowBuffer = undefined;
  } else {
    this.reDraw();
  }
}

/**
 * Set position of window
 * 
 * @param {number} x 
 * @param {number} y 
 */
UIWindow.prototype.setPosition = function(x, y) {
  this.x = x === -1 ? (SizeX() / 2) - (this.w / 2) : x;
  this.y = y === -1 ? (SizeY() / 2) - (this.h / 2) : y;

  if (this.app) {
    this.app.reRender();
  }
}

exports.__VERSION__ = 1;
exports.UIWindow = UIWindow;
