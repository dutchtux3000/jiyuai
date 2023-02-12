var MENUITEM_SELECTED_COLOR = Color(242, 140, 40, 255) //EGA.BLACK
var MENU_TOGGLE_KEY = KEY.Code.KEY_F10
var MENU_CLOSE_KEY = 15131 // escape
/**
 * UI menu bar
 * 
 * @param {UIApp} app 
 */
function UIMenuBar(app) {
  this.applicationMenuSymbol = '@';
  this.currentMenuOpen = -1;
  this.items = [];
  this.isActive = false;
  this.selectedMenuItem = 0
  this.app = app;
  this.currentActiveMenu = undefined;
  this.x = 0
  this.y = 0
  this.w = SizeX()
  this.h = 20
  this.menuRects = []
  this.fontName = 'pc8x8'
}

UIMenuBar.prototype = Object.create(UIWidget.prototype);
UIMenuBar.prototype.constructor = UIMenuBar;

/**
 * Draw menubar
 */
UIMenuBar.prototype.draw = function () {
  var font = this.app.getFont(this.fontName);
  FilledBox(0, 0, SizeX(), 20, EGA.WHITE);
  Line(0, 20, SizeX(), 20, EGA.BLACK);

  menuActiveOffsetX = 0
  this.menuRects.forEach(function (item, index) {
    textColor = index === 0 ? Color(242, 140, 40, 255) : EGA.BLACK;
    if (this.isActive === true && index === this.selectedMenuItem) {
      textColor = EGA.WHITE;
      FilledBox(item.x, item.y, item.w, item.h - 1, MENUITEM_SELECTED_COLOR);
      menuActiveOffsetX = item.x;
    }
    font.DrawStringLeft(item.x + 8, item.y + 6, this.items[index].label, textColor, NO_COLOR)
  }.bind(this));

  if (this.isActive && this.currentActiveMenu) {
    this.currentActiveMenu.x = menuActiveOffsetX;
    this.currentActiveMenu.draw();
  }
}

/**
 * Handle keyboard input
 * 
 * @param {number} key 
 * @param {number} keyCode 
 * @returns 
 */
UIMenuBar.prototype.onKeyPress = function (key, keyCode) {
  var retValue = false
  // check if menubar needs to be activated
  if (keyCode === MENU_TOGGLE_KEY) {
    this.toggleMenu();
    if (this.isActive) {
      retValue = true
    }
  }

  if (!this.isActive) {
    return false;
  }
  var currentMenubarItemIndex = this.selectedMenuItem;

  switch (keyCode) {
    case KEY.Code.KEY_LEFT:
      currentMenubarItemIndex--;
      currentMenubarItemIndex = (currentMenubarItemIndex < 0) ? (this.items.length - 1) : currentMenubarItemIndex
      break;

    case KEY.Code.KEY_RIGHT:
      currentMenubarItemIndex++;
      currentMenubarItemIndex = (currentMenubarItemIndex >= this.items.length) ? 0 : currentMenubarItemIndex
      break;
  }

  if (key === MENU_CLOSE_KEY) { // escape
    this.closeMenu();
  }

  if (this.selectedMenuItem !== currentMenubarItemIndex) {
    this.selectedMenuItem = currentMenubarItemIndex;
    this.createMenuFromSelected();
    this.reDraw();
    retValue = true
  }

  if (this.currentActiveMenu) {
    retValue = this.currentActiveMenu.onKeyPress(key, keyCode);
  }

  return retValue
}

/**
 * Handle keyboard shortcuts in menu
 * 
 * @param {*} keyCode 
 * @returns 
 */
UIMenuBar.prototype.handleMenuShortCode = function(keyCode) {
  var retValue = false;

  this.items.forEach(function (item) {
    if (item.isDisabled === true || retValue === true) {
      return;
    }
    item.children.forEach(function (subItem) {
      if (subItem.isDisabled === true || retValue === true) {
        return;
      }
      if (subItem.keyCode !== undefined && subItem.keyCode === keyCode && subItem.onClick) {
        subItem.onClick();        
        retValue = true;
        return;
      }
    });
  });

  // input is handled close the menu..isModal
  if (retValue === true) {
    this.closeMenu();
  }

  return retValue;
}
/**
 * Create UIMenu object from the selected menu
 */
UIMenuBar.prototype.createMenuFromSelected = function () {
  var currentMenubarItemIndex = this.selectedMenuItem;
  var currentMenu = this.items[currentMenubarItemIndex]
  if (currentMenubarItemIndex >= 0 && currentMenu && currentMenu.children) {
    this.currentActiveMenu = new UIMenu(this.app, currentMenu.children, 0, 20);
    this.currentActiveMenu.onMenuItemSelected = function () {
      this.closeMenu();
    }.bind(this)
  } else {
    this.currentActiveMenu = undefined
  }
  this.reDraw();
}

/**
 * Close menu
 */
UIMenuBar.prototype.closeMenu = function () {
  this.isActive = false;
  this.currentActiveMenu = undefined;
  this.selectedMenuItem = 0
  this.createMenuFromSelected();
}

/**
 * Open menu
 */
UIMenuBar.prototype.openMenu = function () {
  this.isActive = true;
  this.createMenuFromSelected();
}

/**
 * Toggle menu to show or hide.
 */
UIMenuBar.prototype.toggleMenu = function () {
  if (!this.isActive) {
    this.openMenu();
  } else {
    this.closeMenu();
  }
}
/**
 * Set menu items
 * 
 * @param {*} items 
 */
UIMenuBar.prototype.setMenu = function (items) {
  this.items = items;
  var font = this.app.getFont(this.fontName);

  // calculate menu items
  menuOffsetX = 0
  this.menuRects = items.map(function (item) {
    var menuItemWidth = font.StringWidth(item.label);
    var menuRect = Utils.createRectObj(menuOffsetX, 0, menuItemWidth + 16, 20)
    menuOffsetX = menuRect.w
    return menuRect;
  });
}

/**
 * Handle mouse input
 * 
 * @param {number} buttons 
 * @param {number} x 
 * @param {number} y 
 * @param {number} isLeftClicked 
 * @returns 
 */
UIMenuBar.prototype._handleMouseInput = function (buttons, x, y, isLeftClicked) {
  // if (buttons === 1) {
  if (buttons === 1 || isLeftClicked) {
    if (!this.isActive && this.rectTest(x, y)) {
      this._handleMouseMenuBarSelect(x, y);
      this.openMenu();
      return true;
    }

    if (this.isActive) {
      if (this._handleMouseMenuBarSelect(x, y)) {
        return true;
      }

      if (this.currentActiveMenu && this.currentActiveMenu.rectTest(x, y)) {
        this.currentActiveMenu._handleMouseInput(buttons, x, y, isLeftClicked);
        return true;
      }

      if (!this.rectTest(x, y)) {
        this.closeMenu();
        return true;
      }
    }
  }

  return false;
}

/**
 * Handle mouse input to select menu item
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns 
 */
UIMenuBar.prototype._handleMouseMenuBarSelect = function (x, y) {
  var newIndex = this.selectedMenuItem;

  // check which menu items should be opened.
  this.menuRects.forEach(function (item, index) {
    if (Utils.hitTest(x, y, item.x, item.y, item.w, item.h)) {
      newIndex = index
    }
  })

  if (newIndex !== this.selectedMenuItem) {
    this.selectedMenuItem = newIndex
    this.createMenuFromSelected();
    return true;
  }

  return false;
}

exports.__VERSION__ = 1
exports.UIMenuBar = UIMenuBar;