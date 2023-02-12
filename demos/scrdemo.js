/**
 * Basic scrollbar demo
 */
function ScrollbarDemo() {
  UIWindow.call(this, 'scrollbarDemo', 'Scrollbar demo')
  this.setSize(300, 300)
  this.destroyOnClose = true;
}

ScrollbarDemo.prototype = Object.create(UIWindow.prototype);
ScrollbarDemo.constructor = ScrollbarDemo;

ScrollbarDemo.prototype.init = function() {
  this.vscroll = new UIScrollBar(this.w - 16, 20, 16, this.h - 36) // , 0, 10, 5)
  this.vscroll.onChange = this._updateStatusLabel.bind(this);
  this.addChildren(this.vscroll);

  this.hscroll = new UIScrollBar(0, this.h - 16, this.w - 16, 16) // , 0, 10, 5)
  this.hscroll.onChange = this._updateStatusLabel.bind(this);
  this.addChildren(this.hscroll);

  this.vScrollValue = new UIText(74, 30, '-1');
  this.hScrollValue = new UIText(74, 40, '-1');
  this.addChildren(new UIText(10, 30, 'Vscroll:'));
  this.addChildren(new UIText(10, 40, 'Hscroll:'));
  this.addChildren(this.vScrollValue);
  this.addChildren(this.hScrollValue);
  
  this._updateStatusLabel();
}

/**
 * Update the labels of scrollbar position.
 */
ScrollbarDemo.prototype._updateStatusLabel = function() {
  this.vScrollValue.setText(this.vscroll.value);
  this.hScrollValue.setText(this.hscroll.value); 
}

exports.__VERSION__ = 1
exports.ScrollbarDemo = ScrollbarDemo
