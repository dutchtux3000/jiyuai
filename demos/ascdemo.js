/**
 * Ascii table demo.
 * 
 * Basic demo to show ascii table from 1 to 255
 */
function AsciiTableDemo() {
  UIWindow.call(this, 'ascciDemo', 'Ascii table')
  this.setSize(SizeX()- 10, SizeY() - 30)
  this.setPosition(-1, 25)
  this.destroyOnClose = true;
}

AsciiTableDemo.prototype = Object.create(UIWindow.prototype);
AsciiTableDemo.constructor = AsciiTableDemo;

AsciiTableDemo.prototype.init = function() {
  var widgetOffsetY = 30
  var widgetOffsetX = 10
  var itemCounter = 0;

  for (var a = 1; a <= 255; a++) {    
    if (a >= 128 && a <= 160) {
      // continue;
    }

    this.addChildren(new UIText(widgetOffsetX, widgetOffsetY, a + ' ' + String.fromCharCode(a)))
    widgetOffsetY = widgetOffsetY + 12
    itemCounter++
    if (itemCounter > 30) {
      widgetOffsetY = 30
      widgetOffsetX = widgetOffsetX + 50
      itemCounter = 0;
    }    
  }
}

exports.__VERSION__ = 1
exports.AsciiTableDemo = AsciiTableDemo;
