/**
 * Calculate width of given text
 * 
 * @param {string} text 
 * @returns {number}
 */
function calcTextWidth(text) {
  return text.length * 8
}

/**
 * 
 * @param {number} testX 
 * @param {number} testY 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @returns {bool}
 */
function hitTest(testX, testY, x, y, w, h) {
  return (testX >= x && testX <= w) && (testY >= y && testY <= h)
}

/**
 * Check if the text x and y are in the given rect
 * 
 * @param {number} testX 
 * @param {number} testY 
 * @param {x: number, y: number, w: number, h: number} rect 
 * @returns {bool}
 */
function hitTestRect(testX, testY, rect) {
  return hitTest(testX, testY, rect.x, rect.y, rect.w, rect.h)
}

/**
 * Create react object from params
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 * @returns {x: number, y: number, w: number, h: number}
 */
function createRectObj(x, y, w, h) {
  return {
    x: x,
    y: y,
    w: x + w,
    h: y + h
  }
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param siParam True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dpParam Number of decimal places to display.
 * 
 * @return Formatted string.
 */
function humanFileSize(bytes, siParam, dpParam) {
  var si = siParam ? siParam : false;
  var dp = dpParam ? dpParam : 1;
  var thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  var r = Math.pow(10, dp);
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];  
}

/**
 * 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @param {Color} c 
 * @param {number} r 
 */
function BoxWithRadius(x1, y1, x2, y2, c, r) {

  Line(x1 + r, y1, x2 - r, y1, c) // top
  Line(x2, y1 + r, x2, y2 - r, c) // right
  Line(x1 + r, y2, x2 - r, y2, c) // bottom  
  Line(x1, y1 + r, x1, y2 - r, c) // left

  // create corners
  CircleArc(x1 + r, y1 + r, r, 64, 128, c) // top left
  CircleArc(x2 - r, y1 + r, r, 0, 64, c) // top right
  CircleArc(x2 - r, y2 - r, r, 192, 256, c) // bottom right
  CircleArc(x1 + r, y2 - r, r, 128, 192, c) // bottom left
}

function FilledBoxWithRadius(x1, y1, x2, y2, c, r) {

  // left right
  FilledBox(x1, y1 + r, x2, y2 - r, c);

  // top
  FilledBox(x1 + r, y1, x2 - r, y1 + r, c);

  // bottom
  FilledBox(x1 + r, y2 - r, x2 - r, y2, c);
  
  // create corners
  FilledCircle(x1 + r, y1 + r, r, c) // top left
  FilledCircle(x2 - r, y1 + r, r, c) // top right
  FilledCircle(x2 - r, y2 - r, r, c) // bottom right
  FilledCircle(x1 + r, y2 - r, r, c) // bottom left
}

exports.__VERSION__ = 1;
exports.Utils = {
  calcTextWidth: calcTextWidth,
  hitTest: hitTest,
  hitTestRect: hitTestRect,
  createRectObj: createRectObj,
  humanFileSize: humanFileSize
};
exports.BoxWithRadius = BoxWithRadius;
exports.FilledBoxWithRadius = FilledBoxWithRadius;