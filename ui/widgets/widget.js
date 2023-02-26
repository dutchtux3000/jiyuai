/**
 * UI widget component
 * 
 * The base widget where all other widgets are based on.
 */
function UIWidget() {
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.h = 0;
  this.children = [];
  this.app = undefined
  this.parent = undefined;
  this.isActive = false;
  this.isVisible = true;
  this._canHaveFocus = false;
  this._calculatedRelativePosition = { x: this.x, y: this.y };
  this._needsDraw = false;
  this.hasOwnDrawBuffer = false;
}

/**
 * Draw widget
 */
UIWidget.prototype.draw = function() {
  this._renderChildren();
}

/**
 * Set size of widget
 * 
 * @param {number} w 
 * @param {number} h 
 */
UIWidget.prototype.setSize = function(w, h) {
  this.w = w;
  this.h = h;
  this.reDraw();
}

/**
 * Set position of widget
 * 
 * @param {number} x 
 * @param {number} y 
 */
UIWidget.prototype.setPosition = function(x, y) {
  this.x = x;
  this.y = y;
  this.reDraw();
}

/**
 * Set widget visible state
 * 
 * @param {bool} isVisible 
 */
UIWidget.prototype.setVisible = function(isVisible) {
  this.isVisible = isVisible
}


/**
 * Add child to widget
 * 
 * @param {UIWidget} child 
 */
UIWidget.prototype.addChildren = function(child) {
  child.app = this.app;
  child.parent = this;
  this.children.push(child);  
  this.reDraw();
}

/**
 * Remove all children from the widget
 */
UIWidget.prototype.clearChildren = function() {
  this.children = [];
  this.reDraw();
}

/**
 * Get relative position of widget that will be drawn to the screen.
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns {x: number, y: number}
 */
UIWidget.prototype.getRelativePosition = function(x, y) {
  if (this.parent === undefined) {
    return { x: x, y: y}
  }

  return this.parent.getRelativePosition(this.parent.x + x, this.parent.y + y)
}

/**
 * Get relative rect of widget that will be rendered.
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @returns {x: number, y: number, w: number, h: number}
 */
UIWidget.prototype.getRelativeRect = function(x, y, w, h) {
  var relativePos = this.getRelativePosition(x, y);

  return {
    x: relativePos.x,
    y: relativePos.y,
    w: relativePos.x + w,
    h: relativePos.y + h,
  }
}

/**
 * Get drawing position of the widget
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns {x: number, y: number}
 */
UIWidget.prototype.getDrawPosition = function(x, y) {
  if ((this.parent === undefined) || (this.parent.hasOwnDrawBuffer)) {
    return { x: x, y: y}    
  }

  return this.parent.getDrawPosition(this.parent.x + x, this.parent.y + y)
}

/**
 * Get drawing rect of the widget.
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @returns {x: number, y: number, w: number, h: number}
 */
UIWidget.prototype.getDrawRect = function(x, y, w, h) {
  var drawPos = this.getDrawPosition(x, y);

  return {
    x: drawPos.x,
    y: drawPos.y,
    w: drawPos.x + w,
    h: drawPos.y + h,
  }
}


/**
 * Call draw function of all children.
 */
UIWidget.prototype._renderChildren = function() {
  this.children.forEach(function (child) {    
    if (child.isVisible) {
      child.draw();
      child._needsDraw = false;

    }
  }.bind(this))
}

/**
 * Hanlde key input of widget
 * 
 * @param {number} key 
 * @param {number} keyCode 
 * @param {string} char 
 */
UIWidget.prototype._handleInput = function(key, keyCode, char) {
  this.onKeyPress(key, keyCode, char);
}

/**
 * Handle mouse input of widget
 * It will send mouse input to it children if mouse is hit.
 * 
 * @param {number} buttons 
 * @param {number} x 
 * @param {number} y 
 * @param {bool} isLeftClicked 
 */
UIWidget.prototype._handleMouseInput = function(buttons, x, y, isLeftClicked) {

  var childHasClicked = false
  if (this.children && this.children.length > 0) {    
    this.children.forEach(function (child) {
      if (child.rectTest(x, y) === true) {
        child._handleMouseInput(buttons, x, y, isLeftClicked);
        childHasClicked = true
      }
    });
  }

  // no child click then click the widget it self.
  if (childHasClicked === false) {
    if (isLeftClicked && this._handleMouseClick) {
      this._handleMouseClick(x, y);
    }
  }
}

/**
 * Handle loop of widget and send throught is children.
 *  
 * @param {number} tick 
 */
UIWidget.prototype._handleLoop = function(tick) {
  if (this.onLoop) {
    this.onLoop(tick)
  }

  this.children.forEach(function (child) {
    if (child._handleLoop) {
      child._handleLoop(tick);
    }
  });
}

/**
 * Handle mouse click of widget
 * 
 * @param {number} x 
 * @param {number} y 
 */
UIWidget.prototype._handleMouseClick = function (x, y) {
  if (this.onClick) { 
    this.onClick(x, y)
  }
}

/**
 * Check if a position is within the Widget position
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns 
 */
UIWidget.prototype.rectTest = function (x, y) {  
  var relativePos = this.getRelativeRect(this.x, this.y, this.w, this.h);
  return Utils.hitTest(x, y, relativePos.x, relativePos.y, relativePos.w, relativePos.h)
}

// events
UIWidget.prototype.onKeyPress = function(key, keyCode, char) {

}

UIWidget.prototype.onClick = function (x, y) {

}

UIWidget.prototype.onFocus = function() {
  this.reDraw();
}

UIWidget.prototype.onBlur = function() {
  this.reDraw();
}

UIWidget.prototype.onLoop = function(tick) {
}

/**
 * Set UIAPP to the widget and it's children.
 */
UIWidget.prototype.setApp = function(app) {
  this.app  = app;
  this.children.forEach(function (child) {
    child.app = app;
    if (child.setApp) {
      child.setApp(app);
    }
  })
}

/**
 * Mark to widget to be redraw for the next time.
 */
UIWidget.prototype.reDraw = function() {
  this._needsDraw = true;

  if (this.parent !== undefined) {
    this.parent.reDraw();
  }

  if (this.app) {
    this.app.reRender();
  }  
}

exports.__VERSION__ = 1;
exports.UIWidget = UIWidget;