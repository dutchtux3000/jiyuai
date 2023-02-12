/**
 * UI Text - simple draw text to the screen at a specific position
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} text 
 */
function UIText(x, y, text) {
  UIWidget.call(this);
  this.x = x;
  this.y = y;
  this.text = text;
  this.forecolor = EGA.BLACK;
  this.backgroundColor = NO_COLOR;
  this.fontName = 'pc6x8'
}

UIText.prototype = Object.create(UIWidget.prototype);
UIText.prototype.constructor = UIText;

/**
 * Draw text
 */
UIText.prototype.draw = function() {
  var drawPos = this.getDrawPosition(this.x, this.y);
  var font = this.app.getFont(this.fontName);
  font.DrawStringLeft(drawPos.x, drawPos.y, this.text, this.forecolor, this.backgroundColor);
}

/**
 * Set text
 * 
 * @param {string} text 
 */
UIText.prototype.setText = function(text) {
  this.text = text;
  this.reDraw();
}

/**
 * Set the font used to render the text
 * 
 * @param {string} name 
 */
UIText.prototype.setFontName = function(name) {
  this.fontName = name;
  this.reDraw();
}

exports.__VERSION__ = 1;
exports.UIText = UIText;