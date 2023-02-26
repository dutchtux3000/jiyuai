/**
 * Debug window
 * For now you van set values to keep on screen
 */
function DebugWindow() {
  UIWindow.call(this, 'debugWindow', 'Debug')
  this.setSize(200, 200);
  this.setPosition(SizeX() - 210, SizeY() - 210)

  this.watchValues = [];
}

DebugWindow.prototype = Object.create(UIWindow.prototype);
DebugWindow.constructor = DebugWindow;

/**
 * Init
 */
DebugWindow.prototype.init = function() {
  this.watchValueHolder = new UIGroup('Value watcher', 10, 30, this.w - 20, this.h - 40);
  this.addChildren(this.watchValueHolder);
  this._updateWatchValueUI();
}

/**
 * Update widgets of values that is being watched.
 */
DebugWindow.prototype._updateWatchValueUI = function() {
  this.watchValueHolder.clearChildren();
  var offsetY = 14
  this.watchValues.forEach(function (item) {
    this.watchValueHolder.addChildren(new UIText(4, offsetY, item.key + ' : ' + item.value));
    offsetY = offsetY + 10
  }.bind(this));  
}

/**
 * Add value to watch
 * 
 * @param {string} key 
 * @param {string|number} value 
 */
DebugWindow.prototype.addValueWatch = function(key, value) {
  var item = {
    key: key,
    value: value
  }

  var keyIndex = -1
  this.watchValues.forEach(function(item, index) { 
      if (item.key === key) {
        keyIndex = index
      }
   });

  if (keyIndex >= 0) {
    this.watchValues[keyIndex] = item;
  } else {
    this.watchValues.push(item);
  }

  this._updateWatchValueUI()
}

exports.__VERSION__ = 1
exports.DebugWindow = DebugWindow;
