var MENUITEM_SELECTED_COLOR = Color(242, 140, 40, 255) //EGA.BLACK

/**
 * UIMenu widget
 * 
 * @param {UIApp} app 
 * @param {*} items 
 * @param {number} x 
 * @param {number} y 
 */
function UIMenu(app, items, x, y) {
  UIWidget.call(this);
  this.x = x
  this.y = y
  this.w = 16
  this.h = 16
  this.items = items;
  this.app = app
  this.hasBeenLoaded = false
  this.selectedIndex = -1;
  this.onMenuItemSelected = undefined
  this.menuRects = []
  this.fontName = 'pc8x8'
}

UIMenu.prototype = Object.create(UIWidget.prototype);
UIMenu.prototype.constructor = UIMenu;

/**
 * Calculate menu size based on items
 */
UIMenu.prototype.calculateSize = function () {
  var font = this.app.getFont(this.fontName);
  var maxWidth = 16;
  var maxHeight = 0;

  this.items.forEach(function (item) {
    var menuItemWidth = font.StringWidth(item.label) +
      font.StringWidth(item.keyLabel ? '  ' + item.keyLabel : '')
      + 16;

    if (menuItemWidth > maxWidth) {
      maxWidth = menuItemWidth;
    }
    if (item.label !== '-') {
      maxHeight = maxHeight +  20;
    }
  });

  var menuOffsetY = 0
  this.menuRects = this.items.map(function (item) {
    if (item.label !== '-') {

      if (item.label !== '-') {
        var retValue = Utils.createRectObj(0, menuOffsetY, maxWidth, 20)
        menuOffsetY = menuOffsetY + 20;

        return retValue;
      } else {
        return undefined
      }
    }
  })

  if (maxHeight === 0) {
    maxHeight = 16
  }

  this.setSize(maxWidth, maxHeight);
  this.hasBeenLoaded = true
}

/**
 * Draw menu
 */
UIMenu.prototype.draw = function () {
  if (!this.hasBeenLoaded) {
    this.calculateSize();
  }
  var font = this.app.getFont(this.fontName);
  //var relRect = this.getRelativeRect(this.x, this.y, this.w, this.h);
  var rect = this.getDrawRect(this.x, this.y, this.w, this.h);

  FilledBox(rect.x, rect.y, rect.w, rect.h, EGA.WHITE);
  Box(rect.x, rect.y, rect.w, rect.h, EGA.BLACK);
  Line(rect.x + 2, rect.h + 1, rect.w + 1, rect.h + 1, EGA.DARK_GREY)
  Line(rect.w + 1, rect.y + 3, rect.w + 1, rect.h, EGA.DARK_GREY)

  menuOffsetY = this.y
  menuOffsetX = this.x

  this.items.forEach(function (item, index) {
    textColor = item.isDisabled ? EGA.DARK_GRAY : EGA.BLACK
    if (item.label === '-') {
      Line(menuOffsetX, menuOffsetY, menuOffsetX + this.w, menuOffsetY, EGA.BLACK)
    } else {
      if (this.selectedIndex === index) {
        textColor = item.isDisabled ? EGA.LIGHT_GRAY : EGA.WHITE
        FilledBox(menuOffsetX + 1, menuOffsetY +1, (menuOffsetX + this.w) -1, menuOffsetY + 19, MENUITEM_SELECTED_COLOR);
      }
      font.DrawStringLeft(menuOffsetX + 8, menuOffsetY + 6, item.label, textColor, NO_COLOR)
      if (item.keyLabel) {
        font.DrawStringRight((menuOffsetX + (this.w - 8)), menuOffsetY + 6, item.keyLabel, textColor, NO_COLOR)
      }
      menuOffsetY = menuOffsetY + 20
    }
  }.bind(this));
}

/**
 * Keyboard handling
 * 
 * @param {number} key 
 * @param {number} keyCode 
 * @returns 
 */
UIMenu.prototype.onKeyPress = function (key, keyCode) {
  var retValue = false
  var currentMenuItemIndex = this.selectedIndex;

  switch (keyCode) {
    case KEY.Code.KEY_UP:
      currentMenuItemIndex = this.getNewMenuIndex(currentMenuItemIndex, -1)
      break;

    case KEY.Code.KEY_DOWN:
      currentMenuItemIndex = this.getNewMenuIndex(currentMenuItemIndex, 1)
      break;

    case KEY.Code.KEY_ENTER:
    case KEY.Code.KEY_ENTER_PAD:
      this._handleCurrentSelectedItem(currentMenuItemIndex);
      retValue = true
      break;
  }

  if (currentMenuItemIndex !== this.selectedIndex) {
    this.selectedIndex = currentMenuItemIndex
    this.reDraw();
  }

  return retValue;
}

/**
 * Hanlde mouse input
 * 
 * @param {number} buttons 
 * @param {number} x 
 * @param {number} y 
 * @param {bool} isLeftClicked 
 */
UIMenu.prototype._handleMouseInput = function (buttons, x, y, isLeftClicked) {
  if (buttons === 1 || isLeftClicked) {
    var relRect = this.getRelativeRect(this.x, this.y, this.w, this.h);
    var newSelectedIndex = 0;

    this.menuRects.forEach(function (item, index) {
      if (item !== undefined) {
        if (Utils.hitTest(x, y, relRect.x + item.x, relRect.y + item.y, relRect.x + item.w, relRect.y + item.h)) {
          newSelectedIndex = index
        }
      }
    })

    if (newSelectedIndex !== this.selectedIndex) {
      this.selectedIndex = newSelectedIndex;
      this.reDraw();
    }

    if (isLeftClicked) {
      this._handleCurrentSelectedItem(this.selectedIndex);
    }
  }
}

/**
 * Determine next menu item that can be selected
 * 
 * @param {number} currentIndex 
 * @param {number} amount -1 go up, 1 go down
 * @returns 
 */
UIMenu.prototype.getNewMenuIndex = function (currentIndex, amount) {
  var newIndex = currentIndex + amount
  if (amount < 0) {
    newIndex = (newIndex < 0) ? (this.items.length - 1) : newIndex
  }
  if (amount > 0) {
    newIndex = (newIndex >= this.items.length) ? 0 : newIndex
  }

  if (this.items[newIndex] && this.items[newIndex].label === '-') {
    newIndex = this.getNewMenuIndex(newIndex, amount)
  }

  return newIndex;
}
/**
 * Handle current menu item
 * 
 * @param {number} menuIndex 
 * @returns 
 */
UIMenu.prototype._handleCurrentSelectedItem = function (menuIndex) {
  if (this.items[menuIndex]) {
    if (this.items[menuIndex].isDisabled) {
      return;
    }
    if (this.items[menuIndex].onClick) {
      this.items[menuIndex].onClick();
    }
  }

  if (this.onMenuItemSelected) {
    this.onMenuItemSelected(this);
  }
}

exports.__VERSION__ = 1
exports.UIMenu = UIMenu;