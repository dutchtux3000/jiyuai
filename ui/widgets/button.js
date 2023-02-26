/**
 * UITButton widget
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {string} label 
 */
function UIButton(x, y, label) {
  UIWidget.call(this);
  this.setPosition(x, y)
  this.setSize(Utils.calcTextWidth(label) + 32, 24)
  this.label = label
  this.hasFocus = false
  this._canHaveFocus = true
  this._isPressed = false
  this._hasSizeSet = false
  this.fontName = 'pc8x8' 
}

UIButton.prototype = Object.create(UIWidget.prototype);
UIButton.prototype.constructor = UIButton;

/**
 * Handle mouse input
 * 
 * @param {number} mouseButtons 
 * @param {number} mouseX 
 * @param {number} mouseY 
 * @param {bool} isLeftClicked 
 */
UIButton.prototype._handleMouseInput = function(mouseButtons, mouseX, mouseY, isLeftClicked) {
  if (mouseButtons === 1 &&  this.hasFocus === false) {
    if (this.parent && this.parent._clearFocusFromWidgets) {
      this.parent._clearFocusFromWidgets();
    }
    this.hasFocus = true    
  }

  this._checkPressState(mouseX, mouseY, mouseButtons);
 
  UIWidget.prototype._handleMouseInput.call(this, mouseButtons, mouseX, mouseY, isLeftClicked);
}

/**
 * Draw button
 */
UIButton.prototype.draw = function() {
  var font = this.app.getFont(this.fontName);
  if (!this._hasSizeSet) {
    this.setSize(font.StringWidth(this.label) + 32, 24);
  }

  var radius = this.h / 2;
  radius = radius < 0 ? 8: radius;

  var rect = this.getDrawRect(this.x, this.y, this.w, this.h)
  var rectXCenter = rect.x + (this.w / 2)
  var rectYCenter = rect.y + (this.h / 2)


  FilledBoxWithRadius(rect.x, rect.y, rect.w, rect.h, this._isPressed ? Color(242, 140, 40, 255) : EGA.WHITE, radius);
  if (!this._isPressed) {
    BoxWithRadius(rect.x, rect.y, rect.w, rect.h, EGA.BLACK, radius);
  }  
  font.DrawStringCenter(rectXCenter, rectYCenter - 4, this.label, this._isPressed ? EGA.WHITE : EGA.BLACK, NO_COLOR)

  if (this.hasFocus) {
    // Box(rect.x + 2, rect.y + 2, rect.w - 2, rect.h - 2, EGA.BLACK);
    BoxWithRadius(rect.x + 2, rect.y + 2, rect.w - 2, rect.h - 2, this._isPressed ? EGA.WHITE : EGA.BLACK, radius);
  }
}

/**
 * Set size of button
 * 
 * @param {number} w 
 * @param {number} h 
 */
UIButton.prototype.setSize = function(w, h) {
  this._hasSizeSet = true;

  UIWidget.prototype.setSize.call(this, w, h);
}

UIButton.prototype._handleLoop = function(tick) {
  if(!this.app._windowIsMoving) {
    var mouseState = this.app.getMouseState();
    this._checkPressState(mouseState.x, mouseState.y, mouseState.buttons);
  }
}

UIButton.prototype._checkPressState  = function(x, y, buttons) {
  var isPressed = (this.rectTest(x, y) && buttons === 1)
  if (isPressed !== this._isPressed) {
    this._isPressed = isPressed;
    this.reDraw();
  }
}

exports.__VERSION__ = 1;
exports.UIButton = UIButton;