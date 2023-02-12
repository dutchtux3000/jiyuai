/**
 * UI font manager loading. keep everything in one place.
  */
function UIFonts() {
  // this.fonts = Require('./ui/res/fontlist.js');
  this.loadedFonts = {}
}

/**
 * Load font base on string from JSBOOT.ZIP * 
 * @param {string} name 
 */
UIFonts.prototype.loadFont = function(name) {
  this.loadedFonts[name] = new Font(JSBOOTPATH + 'fonts/' + name + '.fnt');
}

/**
 * Get font object from given name
 * 
 * @param {string} name 
 * @returns {Font} 
 */
UIFonts.prototype.getFont = function(name) {
  if (!this.loadedFonts[name]) {
    this.loadFont(name);
  }

  return this.loadedFonts[name];
}

exports._VERSION_ = 1
exports.UIFonts = UIFonts;