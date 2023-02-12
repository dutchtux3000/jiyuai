/**
 * About program dialog
 */
function AboutWindow() {
  UIWindow.call(this, 'aboutWindow', 'About program')
  this.setSize(300, 148);
  this.setPosition(-1, 96);
  this.destroyOnClose = true;

  this.showHumanReadableMemory = true
}

AboutWindow.prototype = Object.create(UIWindow.prototype);
AboutWindow.constructor = AboutWindow;

/**
 * Init window
 */
AboutWindow.prototype.init = function() {
  var appInfo = this.app.applicationInfo

  this.title = 'About ' + appInfo.name
  var appTitle = new UIText(24, 30, appInfo.name + ' ' + appInfo.version)
  appTitle.setFontName('pc8x16')  
  this.addChildren(appTitle);
  this.addChildren(new UIText(24, 50, appInfo.copyright));
  this.addChildren(new UIText(24, 60, appInfo.license));

  this.memoryUsedLabel = new UIText(24, 80, 'Memory used:')
  this.memoryRemainingLabel = new UIText(24, 90, 'Memory used:')
  this.memoryAvailable = new UIText(24, 100, 'Memory total:')
  this.addChildren(this.memoryUsedLabel);
  this.addChildren(this.memoryRemainingLabel);
  this.addChildren(this.memoryAvailable);

  var button = new UIButton((this.w / 2) - (70 /2), this.h - 28, 'Close');
  button.setSize(75, 20);
  button.hasFocus = true;
  button.onClick = function () {
    this.close();
  }.bind(this)
  this.addChildren(button)
}

/**
 * On focus
 */
AboutWindow.prototype.onFocus = function() {
  this.updateMemoryInfo();
}

/**
 * Keyboard handling
 * 
 * @param {number} key 
 * @param {number} keyCode 
 * @param {string} char 
 */
AboutWindow.prototype.onKeyPress = function(key, keyCode, char) {
  if (keyCode === KEY.Code.KEY_M) {
    this.showHumanReadableMemory = !this.showHumanReadableMemory;
    this.updateMemoryInfo();
  }
}
/**
 * Update memory information
 */
AboutWindow.prototype.updateMemoryInfo = function() {
  // update memory information
  var memoryInfo = MemoryInfo()

  if (this.showHumanReadableMemory) {
    this.memoryUsedLabel.setText('Memory used: ' + Utils.humanFileSize(memoryInfo.total - memoryInfo.remaining));
    this.memoryRemainingLabel.setText('Memory remaining: ' + Utils.humanFileSize(memoryInfo.remaining));
    this.memoryAvailable.setText('Memory total: ' + Utils.humanFileSize(memoryInfo.total));
  } else {  
    this.memoryUsedLabel.setText('Memory used: ' + (memoryInfo.total - memoryInfo.remaining));
    this.memoryRemainingLabel.setText('Memory remaining: ' + memoryInfo.remaining);
    this.memoryAvailable.setText('Memory total: ' + memoryInfo.total);  
  }
}

exports.__VERSION__ = 1
exports.AboutWindow = AboutWindow
