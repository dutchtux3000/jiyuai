/**
 * UITButton widget
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {string} label 
 */
function UIButton(x, y, label) {
  UIWidget.call(this);
  this.label = label
  this.hasFocus = false
  this.setPosition(x, y)
  this.setSize(Utils.calcTextWidth(label) + 16, 20)
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

  UIWidget.prototype._handleMouseInput.call(this, mouseButtons, mouseX, mouseY, isLeftClicked);
}

/**
 * Draw button
 */
UIButton.prototype.draw = function() {
  var font = this.app.getFont(this.fontName);
  if (!this._hasSizeSet) {
    this.setSize(font.StringWidth(this.label) + 16, 20);
  }

  var rect = this.getDrawRect(this.x, this.y, this.w, this.h)
  var rectXCenter = rect.x + (this.w / 2)
  var rectYCenter = rect.y + (this.h / 2)

  FilledBox(rect.x, rect.y, rect.w, rect.h, EGA.WHITE);
  Box(rect.x, rect.y, rect.w, rect.h, EGA.BLACK);

  font.DrawStringCenter(rectXCenter, rectYCenter - 4, this.label, EGA.BLACK, NO_COLOR)

  if (this.hasFocus) {
    Box(rect.x + 2, rect.y + 2, rect.w - 2, rect.h - 2, EGA.BLACK);
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

exports.__VERSION__ = 1;
exports.UIButton = UIButton;