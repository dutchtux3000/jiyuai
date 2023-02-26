function UIImage(image, x, y) {
  UIWidget.call(this);
  this.image = image;
  this.setPosition(x, y)
  // this.setSize(image.width. image.height);  
}

UIImage.prototype = Object.create(UIWidget.prototype);
UIImage.prototype.constructor = UIImage;

UIImage.prototype.draw = function() {
  var rect = this.getDrawRect(this.x, this.y, this.w, this.h)
  this.image.Draw(rect.x, rect.y);
}

exports.__VERSION__ = 1;
exports.UIImage = UIImage;