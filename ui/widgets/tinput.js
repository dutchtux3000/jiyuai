/**
 * UI text input widget.
 * 
 * TODO:
 * [ ] add multiline support
 * [ ] better hanlding of scrolling of text
 * 
 * 
 * @param {string} value 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 */
function UITextInput(value, x, y, w, h) {
  UIWidget.call(this);
  this.value = value;
  this.setPosition(x, y)
  this.setSize(w ? w : 200, h ? h : 20)
  this._canHaveFocus = true
  this.hasFocus = false
  this.textPaddingX = 5
  this._carrotPosition = 0;
  this._textOffsetRender = 0;
  this.fontName = 'pc8x8'
  this._textOffsetCalculated = false

  Debug(JSON.stringify(String));
}

UITextInput.prototype = Object.create(UIWidget.prototype);
UITextInput.prototype.constructor = UITextInput;

/**
 * Draw widget
 */
UITextInput.prototype.draw = function () {
  var rect = this.getDrawRect(this.x, this.y, this.w, this.h)
  var font = this.app.getFont(this.fontName);
  var TextPosY = rect.y + 6

  if (!this._textOffsetCalculated) {
    this._recalcTextOffset();
  }

  FilledBox(rect.x, rect.y, rect.w, rect.h, EGA.WHITE);
  Box(rect.x, rect.y, rect.w, rect.h, EGA.BLACK);

  var renderValue = this.value
  var maxCharsInput = (this.w - (this.textPaddingX * 2)) / 8;

  if (renderValue.length > maxCharsInput) {
    renderValue = renderValue.slice(this._textOffsetRender, this._textOffsetRender + maxCharsInput);
  }

  // render text
  font.DrawStringLeft(rect.x + this.textPaddingX, TextPosY, renderValue, EGA.BLACK, NO_COLOR);


  if (this.hasFocus) {
    var carrotColor = EGA.DARK_GREY

    // focus shadow
    Line(rect.x + 1, rect.h + 1, rect.w + 1, rect.h + 1, EGA.DARK_GREY)
    Line(rect.w + 1, rect.y + 1, rect.w + 1, rect.h, EGA.DARK_GREY)

    // set carrot position
    var carrotPositionX = this.textPaddingX + this._carrotPosition * 8;
    if (this._textOffsetRender > 0) {
      carrotPositionX = carrotPositionX - (this._textOffsetRender * 8)
    }
    Line(rect.x + carrotPositionX, TextPosY - 1, rect.x + carrotPositionX, TextPosY + 8, carrotColor);

    Line(rect.x + carrotPositionX - 2, TextPosY - 3, rect.x + carrotPositionX - 1, TextPosY - 2, carrotColor);
    Line(rect.x + carrotPositionX + 2, TextPosY - 3, rect.x + carrotPositionX + 1, TextPosY - 2, carrotColor);

    Line(rect.x + carrotPositionX - 2, TextPosY + 10, rect.x + carrotPositionX - 1, TextPosY + 9, carrotColor);
    Line(rect.x + carrotPositionX + 2, TextPosY + 10, rect.x + carrotPositionX + 1, TextPosY + 9, carrotColor);
  }
}

/**
 * Handle mouse input. so if you click position of the text it will set the cursor to it.
 * 
 * @param {number} mouseButtons 
 * @param {number} mouseX 
 * @param {number} mouseY 
 * @param {bool} isLeftClicked 
 */
UITextInput.prototype._handleMouseInput = function (mouseButtons, mouseX, mouseY, isLeftClicked) {
  if (mouseButtons === 1 && this.hasFocus === false) {
    if (this.parent && this.parent._clearFocusFromWidgets) {
      this.parent._clearFocusFromWidgets();
    }

    this.hasFocus = true
  }

  if (isLeftClicked) {
    var rect = this.getRelativeRect(this.x, this.y, this.w, this.h)
    var relativeMouseX = mouseX - rect.x;

    if (this._textOffsetRender > 0) {
      this.setCarrotPosition(this._textOffsetRender + parseInt((relativeMouseX - this.textPaddingX) / 8));
    } else {
      this.setCarrotPosition(parseInt((relativeMouseX - this.textPaddingX) / 8));
    }
  }

  UIWidget.prototype._handleMouseInput.call(this, mouseButtons, mouseX, mouseY, isLeftClicked);
}
/**
 * Handles the keyboard input.
 * 
 * @param {*} key 
 * @param {*} keyCode 
 * @param {*} char 
 */
UITextInput.prototype._handleInput = function (key, keyCode, char) {
  switch (keyCode) {
    case KEY.Code.KEY_END:
      this.setCarrotPosition(this.value.length);
      break;
    case KEY.Code.KEY_HOME:
      this.setCarrotPosition(0);
      break;
    case KEY.Code.KEY_DOWN:
    case KEY.Code.KEY_LEFT:
      this.setCarrotPosition(this._carrotPosition - 1);
      break;
    case KEY.Code.KEY_UP:
    case KEY.Code.KEY_RIGHT:
      this.setCarrotPosition(this._carrotPosition + 1);
      break;
    case KEY.Code.KEY_BACKSPACE:
      this._removeCharsFromValue(this._carrotPosition - 1)
      break;
    case KEY.Code.KEY_DEL:
      this._removeCharsFromValue(this._carrotPosition)
      break;
    case KEY.Code.KEY_TAB: // Ignore TAB for now
    case KEY.Code.KEY_ENTER: // Ignore TAB for now
      break;
    default:
      if (key >= CharCode(" ")) {
        this._addCharAtCarrotPosition(char);
      }
      break;
  }

  UIWidget.prototype._handleInput.call(this, key, keyCode, char)
}

/**
 * Sets value
 * 
 * @param {string} value 
 */
UITextInput.prototype.setValue = function (value) {
  this.value = value;
  this._recalcTextOffset();

  this.reDraw();
}

/**
 * Set carrot position of widget
 * 
 * @param {number} position 
 */
UITextInput.prototype.setCarrotPosition = function (position) {
  var newPosition = position;

  if (newPosition > this.value.length) {
    newPosition = this.value.length
  }

  if (newPosition < 0) {
    newPosition = 0;
  }

  this._carrotPosition = newPosition;
  this._recalcTextOffset();

  this.reDraw();
}
/**
 * Add a character at the carrot position
 * 
 * @param {string} char 
 */
UITextInput.prototype._addCharAtCarrotPosition = function (char) {
  var oldValue = this.value;
  var newValue = oldValue.substring(0, this._carrotPosition) + char + oldValue.substring(this._carrotPosition);

  this.setValue(newValue);
  this.setCarrotPosition(this._carrotPosition + 1);
}

/**
 * Remove a char from position
 * 
 * @param {number} position 
 */
UITextInput.prototype._removeCharsFromValue = function (position) {
  if ((position > this.value.length) || (position <= -1)) {
    return;
  }
  var newValue = this.value.slice(0, position) + this.value.slice(position + 1);
  this.setValue(newValue);
  this.setCarrotPosition(position);
}

/**
 * Recalculate the offset of the text that is going to be redrawn.
 * 
 * @returns 
 */
UITextInput.prototype._recalcTextOffset = function () {
  this._textOffsetRender = 0
  if (!this.app) {
    return;
  }

  var font = this.app.getFont(this.fontName);
  var textWidth = font.StringWidth(this.value);
  var maxCharsInput = (this.w - (this.textPaddingX * 2)) / 8;
  var maxOffset = this.value.length - maxCharsInput
  if (textWidth > this.w - (this.textPaddingX * 2)) {
    this._textOffsetRender = this._carrotPosition - (maxCharsInput / 2);
  }

  if (this._textOffsetRender < 0) {
    this._textOffsetRender = 0;
  }

  if (this._textOffsetRender > maxOffset) {
    this._textOffsetRender = maxOffset;
  }

  this._textOffsetCalculated = true;
}


exports.__VERSION__ = 1;
exports.UITextInput = UITextInput;