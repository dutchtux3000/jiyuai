var SCROLLBAR_ORIENTATION_HORIZONTAL = 'horizontal';
var SCROLLBAR_ORIENTATION_VERTICAL = 'vertical';
var SCROLLBAR_SIZE = 16;
var SCROLLBAR_BUTTON_SIZE = 16;

/**
 * Arrows of scrollbar
 */
var SCROLLBAR_ARROW_FILENAME = "./ui/res/scrollb.png";
var SCROLLBAR_ARROW_BITMAP = undefined

/**
 * Which button is pressed on the scrollbar
 */
var SCROLLBAR_BUTTON_STATE = {
  NONE: undefined,
  MIN_BUTTON: 'min',
  PLUS_BUTTON: 'plus',
  SCROLL: 'scroll',
}

/**
 * UI scrollbar widget
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @param {number} min 
 * @param {number} max 
 * @param {number} value 
 */
function UIScrollBar(x, y, w, h, min, max, value) {
  UIWidget.call(this);
  this.orientation = SCROLLBAR_ORIENTATION_VERTICAL;
  this.min = min ? min : 0;
  this.max = max ? max : 100;
  this.value = value ? value : 0;
  this.step = 1

  this._isMoveScroll = false
  this._state = SCROLLBAR_BUTTON_STATE.NONE;
  
  this.setPosition(x, y);  
  this.setSize(w, h);

  // load arrow images if not done yet.
  if (SCROLLBAR_ARROW_BITMAP === undefined) {
    SCROLLBAR_ARROW_BITMAP = new Bitmap(SCROLLBAR_ARROW_FILENAME)
  }
}

UIScrollBar.prototype = Object.create(UIWidget.prototype);
UIScrollBar.prototype.constructor = UIScrollBar;

/**
 * Set size of scrollbasr
 * 
 * @param {number} w 
 * @param {number} h 
 */
UIScrollBar.prototype.setSize = function(w, h) {
  this.w = w;
  this.h = h;

  this._determineScrollbarType();
  UIWidget.prototype.setSize.call(this, this.w, this.h);
}

/**
 * Set min value
 * 
 * @param {number} min 
 */
UIScrollBar.prototype.setMin = function(min) {
  this.min = min
  this.reDraw();
}

/**
 * Set max value
 * 
 * @param {number} max 
 */
UIScrollBar.prototype.setMax = function(max) {
  this.max = max
  this.reDraw();
}

/**
 * Set value
 * 
 * @param {number} value 
 */
UIScrollBar.prototype.setValue = function(value) {
  this.value = value
  if (this.value < this.min) {
    this.value = this.min;
  }
  if (this.value > this.max) {
    this.value = this.max;
  }  
  this.onChange(this.value);
  this.reDraw();
}

/**
 * Set step of when clicking the arrow buttons
  * 
 * @param {number} step 
 */
UIScrollBar.prototype.setStep = function(step) {
  this.step = step;
}


/**
 * On change event of the scrollbar
 * 
 * @param {number} value 
 */
UIScrollBar.prototype.onChange = function(value) {

}

/**
 * Scrollbar loop
 * 
 * @param {number} tick 
 */
UIScrollBar.prototype._handleLoop = function(tick) {
  var mouseState = this.app.getMouseState();

  if (this._state !== SCROLLBAR_BUTTON_STATE.NONE) {    
    if (!this.rectTest(mouseState.x, mouseState.y)) {
      this._resetScroll();
      return;
    }

    switch (mouseState.buttons)  {
      case 0:
        this._resetScroll();
        break;
      case 1:
        if (!this.rectTest(mouseState.x, mouseState.y)) {
          this._resetScroll();       
        } else {
          this._handleScrollButton(mouseState.x, mouseState.y);          
        }
        break;
    }
  }
}

/**
 * Determine the scrollbar type by checking width and height
 */
UIScrollBar.prototype._determineScrollbarType = function() {
  if (this.w > this.h) {
    this.orientation = SCROLLBAR_ORIENTATION_HORIZONTAL;
    this.h = SCROLLBAR_SIZE;    
  } else {
    this.orientation = SCROLLBAR_ORIENTATION_VERTICAL;
    this.w = SCROLLBAR_SIZE;    
  }  
}

/**
 * Draw scrollbar
 */
UIScrollBar.prototype.draw = function() {
  var relRect = this.getDrawRect(this.x, this.y, this.w, this.h);
  var minBtnRect = this._getMinButtonRect(true);
  var plusBtnRect = this._getPlusButtonRect(true);
  var valueBtnRect = this._getValueButtonRect(true);

  var minImgX = (this.orientation === SCROLLBAR_ORIENTATION_HORIZONTAL) ?  32 : 0
  var minImgY = (this._state === SCROLLBAR_BUTTON_STATE.MIN_BUTTON) ? 16 : 0
  
  var plusImgX = (this.orientation === SCROLLBAR_ORIENTATION_HORIZONTAL) ? 48 : 16
  var plusImgY = (this._state === SCROLLBAR_BUTTON_STATE.PLUS_BUTTON) ? 16 : 0

  FilledBox(relRect.x, relRect.y, relRect.w, relRect.h, EGA.LIGHT_GREY);
  Box(relRect.x, relRect.y, relRect.w, relRect.h, EGA.BLACK);
  
  // min button
  SCROLLBAR_ARROW_BITMAP.DrawAdvanced(minImgX, minImgY, 16, 16, minBtnRect.x, minBtnRect.y, 16, 16)
  Box(minBtnRect.x, minBtnRect.y, minBtnRect.w, minBtnRect.h, EGA.BLACK);

  // plus button
  SCROLLBAR_ARROW_BITMAP.DrawAdvanced(plusImgX, plusImgY, 16, 16, plusBtnRect.x, plusBtnRect.y, 16, 16)
  Box(plusBtnRect.x, plusBtnRect.y, plusBtnRect.w, plusBtnRect.h, EGA.BLACK);

  // value rect
  FilledBox(valueBtnRect.x, valueBtnRect.y, valueBtnRect.w, valueBtnRect.h, EGA.WHITE);
  Box(valueBtnRect.x, valueBtnRect.y, valueBtnRect.w, valueBtnRect.h, EGA.BLACK);
}

/**
 * Get the rect for up/left arrow
 * 
 * @param {boolean} forDraw  get rect for drawing
 * @returns { x: number, y: number, w: number, h:number }
 */
UIScrollBar.prototype._getMinButtonRect = function(forDraw) {
  var relRect = (forDraw === true) ?  this.getDrawRect(this.x, this.y, this.w, this.h) : this.getRelativeRect(this.x, this.y, this.w, this.h);
  if (this.orientation === SCROLLBAR_ORIENTATION_HORIZONTAL) {
    return {
      x: relRect.x,
      y: relRect.y,
      w: relRect.x + SCROLLBAR_BUTTON_SIZE,
      h: relRect.h,
    }
  } else {
    return {
      x: relRect.x,
      y: relRect.y,
      w: relRect.w,
      h: relRect.y + SCROLLBAR_BUTTON_SIZE,
    }
  }
}

/**
 * Get the rect for down/right arrow
 * 
 * @param {boolean} forDraw  get rect for drawing
 * @returns { x: number, y: number, w: number, h:number }
 */
UIScrollBar.prototype._getPlusButtonRect = function(forDraw) {
  var relRect = (forDraw === true) ?  this.getDrawRect(this.x, this.y, this.w, this.h) : this.getRelativeRect(this.x, this.y, this.w, this.h);
  if (this.orientation === SCROLLBAR_ORIENTATION_HORIZONTAL) {
    return {
      x: relRect.w - SCROLLBAR_BUTTON_SIZE,
      y: relRect.y,
      w: relRect.w,
      h: relRect.h,
    }
  } else {
    return {
      x: relRect.x,
      y: relRect.h - SCROLLBAR_BUTTON_SIZE,
      w: relRect.w,
      h: relRect.h,
    }
  }
}

/**
 * Get the rect for scroll position
 * 
 * @param {boolean} forDraw  get rect for drawing
 * @returns { x: number, y: number, w: number, h:number }
 */
UIScrollBar.prototype._getValueButtonRect = function(forDraw) {
  var relRect = (forDraw === true) ?  this.getDrawRect(this.x, this.y, this.w, this.h) : this.getRelativeRect(this.x, this.y, this.w, this.h);
  var pxVal = this._pixelPerUnit()
  var valuePos = (this.value * pxVal);
  var valueRectOffset = (SCROLLBAR_BUTTON_SIZE / 2)
  var scrollOffset = SCROLLBAR_BUTTON_SIZE + valueRectOffset
  var scrollPos = scrollOffset + valuePos
  
  if (this.orientation === SCROLLBAR_ORIENTATION_HORIZONTAL) {
    return {
      x: relRect.x + scrollPos - valueRectOffset,
      y: relRect.y,
      w: relRect.x + scrollPos + valueRectOffset,
      h: relRect.h,
    }
  } else {
    return {
      x: relRect.x,
      y: relRect.y + scrollPos - valueRectOffset,
      w: relRect.w,
      h: relRect.y + scrollPos + valueRectOffset,
    }
  }
}

/**
 * Handle mouse input
 * 
 * @param {number} mouseButtons 
 * @param {number} mouseX 
 * @param {number} mouseY 
 * @param {bool} isLeftClicked 
 */
UIScrollBar.prototype._handleMouseInput = function(mouseButtons, mouseX, mouseY, isLeftClicked) {
  if (mouseButtons === 1 &&  this.hasFocus === false) {
    if (this.parent && this.parent._clearFocusFromWidgets) {
      this.parent._clearFocusFromWidgets();
    }
    this.hasFocus = true
  }

  var minBtnRect = this._getMinButtonRect();
  var valueBtnRect = this._getValueButtonRect();

  // check arrow buttons
  if (mouseButtons === 1) {
    if (this._isMoveScroll) {
      var mouseAbsPos = (this.orientation === SCROLLBAR_ORIENTATION_HORIZONTAL) ?
        mouseX - minBtnRect.w - (SCROLLBAR_BUTTON_SIZE / 2) :
        mouseY - minBtnRect.h - (SCROLLBAR_BUTTON_SIZE / 2)
      var mouseVal = mouseAbsPos / this._pixelPerUnit();

      this.setValue(Math.round(mouseVal));
      this._state = SCROLLBAR_BUTTON_STATE.SCROLL;
      return;
    }

    if (this._state === SCROLLBAR_BUTTON_STATE.NONE) {
      this._handleScrollButton(mouseX, mouseY);

      if (Utils.hitTestRect(mouseX, mouseY, valueBtnRect)) {
        this._isMoveScroll = true;
        this._state = SCROLLBAR_BUTTON_STATE.SCROLL;
        return;
      }
      return;
    }
  }

  if (mouseButtons === 0 && this._state !== SCROLLBAR_BUTTON_STATE.NONE) {
    this._resetScroll();
  }
}


/**
 * Handle buttons of mouse
 * 
 * @param {number} mouseX 
 * @param {number} mouseY 
 */
UIScrollBar.prototype._handleScrollButton = function(mouseX, mouseY) {
  var minBtnRect = this._getMinButtonRect();
  var plusBtnRect = this._getPlusButtonRect();

  if (Utils.hitTestRect(mouseX, mouseY, minBtnRect)) {      
    this.setValue(this.value - this.step);
    this._state = SCROLLBAR_BUTTON_STATE.MIN_BUTTON;          
    return;
  }
  
  if (Utils.hitTestRect(mouseX, mouseY, plusBtnRect)) {
    this.setValue(this.value + this.step);
    this._state = SCROLLBAR_BUTTON_STATE.PLUS_BUTTON;
    return;
  }
}

UIScrollBar.prototype._pixelPerUnit = function() {
  var rectSize = (this.orientation === SCROLLBAR_ORIENTATION_HORIZONTAL) ? this.w : this.h
  return (rectSize - SCROLLBAR_BUTTON_SIZE - (SCROLLBAR_BUTTON_SIZE * 2)) / (this.max - this.min) 
}

UIScrollBar.prototype._resetScroll = function() {
  this._isMoveScroll = false;
  this._state = SCROLLBAR_BUTTON_STATE.NONE;
  this.reDraw();
}

exports.__VERSION__ = 1
exports.UIScrollBar = UIScrollBar
