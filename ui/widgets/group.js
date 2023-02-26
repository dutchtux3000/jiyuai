function UIGroup(label, x, y, w, h) {
  UIWidget.call(this);
  this.label = label;
  this.setPosition(x, y);
  this.setSize(w, h);  
  this.fontName = 'pc6x8'
}

UIGroup.prototype = Object.create(UIWidget.prototype);
UIGroup.prototype.constructor = UIGroup;

UIGroup.prototype.draw = function() {
  var rect = this.getDrawRect(this.x, this.y, this.w, this.h);
  var font = this.app.getFont(this.fontName);
  var labelWidth = font.StringWidth(this.label) + 8;

  BoxWithRadius(rect.x, rect.y + 6, rect.w, rect.h, EGA.BLACK, 4);  
  FilledBox(rect.x + 10, rect.y, rect.x + labelWidth + 4, rect.y + 10, EGA.WHITE);

  font.DrawStringLeft(rect.x + 12, rect.y + 2, this.label, EGA.BLACK, EGA.WHITE);

  // render the children
  this._renderChildren();
}

exports.__VERSION__ = 1;
exports.UIGroup = UIGroup;