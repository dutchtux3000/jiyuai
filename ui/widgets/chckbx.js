function UICheckbox(x, y, label, isChecked) {
  UIWidget.call(this);
  this.setPosition(x, y);
  this.setSize(200, 20);
  this.label = label
  this.fontName = 'pc6x8';  
  this.isChecked = isChecked === undefined ?  false : isChecked;
  this._canHaveFocus = true
}

UICheckbox.prototype = Object.create(UIWidget.prototype);
UICheckbox.prototype.constructor = UICheckbox;

/**
 * Draw checkbox
 */
UICheckbox.prototype.draw = function() {
  var drawPos = this.getDrawRect(this.x, this.y, this.w, this.h);
  var font = this.app.getFont(this.fontName);

  // draw checkbox
  var checkboxRect = this._checkboxRect();
  Box(checkboxRect.x, checkboxRect.y, checkboxRect.w, checkboxRect.h, EGA.BLACK);

  if (this.hasFocus) {
    Line(checkboxRect.x + 1, checkboxRect.h + 1, checkboxRect.w + 1, checkboxRect.h + 1, EGA.DARK_GREY)
    Line(checkboxRect.w + 1, checkboxRect.y + 1, checkboxRect.w + 1, checkboxRect.h, EGA.DARK_GREY)
  }

  if (this.isChecked) {
    Line(checkboxRect.x + 2, checkboxRect.y + 2, checkboxRect.w - 2, checkboxRect.h - 2, EGA.BLACK)
    Line(checkboxRect.w - 2, checkboxRect.y + 2, checkboxRect.x + 2, checkboxRect.h - 2, EGA.BLACK)    
  }

  font.DrawStringLeft(checkboxRect.w + 6, drawPos.y + 4, this.label, EGA.BLACK, NO_COLOR);
}

/**
 * Handle mouse input
 * 
 * @param {number} mouseButtons 
 * @param {number} mouseX 
 * @param {number} mouseY 
 * @param {bool} isLeftClicked 
 */
UICheckbox.prototype._handleMouseInput = function(mouseButtons, mouseX, mouseY, isLeftClicked) {
  if (mouseButtons === 1 &&  this.hasFocus === false) {
    if (this.parent && this.parent._clearFocusFromWidgets) {
      this.parent._clearFocusFromWidgets();
    }
    this.hasFocus = true    
    this.reDraw();
  }

  UIWidget.prototype._handleMouseInput.call(this, mouseButtons, mouseX, mouseY, isLeftClicked);
}

UICheckbox.prototype.onClick = function() {
  this.setChecked(!this.isChecked);
}

UICheckbox.prototype._checkboxRect = function() {
  var rect = this.getDrawRect(this.x, this.y);
  return {
    x: rect.x + 2,
    y: rect.y + 2,
    w: rect.x + 12,
    h: rect.y + 12
  }
}

UICheckbox.prototype._handleMouseClick = function(x, y) {
  this.onClick();
}

UICheckbox.prototype.setChecked = function(value) {
  this.isChecked = value;
  this.onChecked(value);
  this.reDraw();
}

UICheckbox.prototype.onChecked = function(value) {

}



exports.__VERSION__ = 1;
exports.UICheckbox = UICheckbox;