/*
Copyright 2023 Gilliaard Damme

Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in 
 the Software without restriction, including without limitation the rights to 
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
 of the Software, and to permit persons to whom the Software is furnished to do 
 so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/
Include('./ui/utils.js');
Include('./ui/fonts.js');
Include('./ui/widgets/widget.js');

Include('./ui/widgets/menubar.js');
Include('./ui/widgets/menu.js');
Include('./ui/widgets/window.js');

// widgets
Include('./ui/widgets/text.js');
Include('./ui/widgets/button.js');
Include('./ui/widgets/tinput.js');
Include('./ui/widgets/scrllbr.js');

// window
Include('./ui/widgets/dialog.js');
Include('./ui/window/about.js');
Include('./ui/window/debug.js');

// library loading
LoadLibrary("png")

/**
 * UI app object handling all rendering/event handling of the application
 */
function UIApp() {
  this.showFps = false
  this.showLastDrawTick = false
  this.showMemStats = false;
  this.background = Color(1,130,129, 255)
  this.needsRedraw = true; // first time needs to draw.
  this.applicationMenuSymbol = '@'
  this.applicationMenu = []; // Application menu that is always used.

  this.currentWindowMenu = [];
  this.menuBar = new UIMenuBar(this);
  this._windows = [];

  this._windowIsMoving = false
  this._windowOffsetX = 0;
  this._windowOffsetY = 0;
  this._windowMoveX = 0;
  this._windowMoveY = 0;

  this._prevMouseButtons = 0;
  this._prevMouseTick = 0;
  this._prevMouseX = 0;
  this._prevMouseY = 0;

  this.enableDebugWindow = false;

  this.applicationInfo = {
    name: 'Application name',
    version: '0.0.1',
    copyright: 'Created by DutchTux 2023',
    license: 'Unlicensed'
  }

  this.fonts = new UIFonts();
}

/**
 * Init app after creating.
 */
UIApp.prototype.init = function () {
  // init
  this.menuBar.app = this;
  this.applicationMenu = [
    {
      label: 'About',
      onClick: function () {
        this.showAbout()
      }.bind(this)
    },
    {
      label: '-'
    },
    {
      label: 'Quit',
      keyCode: 4352,
      keyLabel: 'Alt+Q',
      onClick: function () {
        Stop()
      }
    }
  ]; 
  // Application menu that is always used.
  if (this.enableDebugWindow) {
    this.debugWindow = new DebugWindow();
    this.debugWindow.setVisible(false);
    this.addWindow(this.debugWindow);
  }
  this.rebuildMenu();
}

/**
 * Rebuild the menubar based on active window adn the applicationMenu variable.
 * It also creates a menu Window at the end so you can switch from window by selecting in the menu
 */
UIApp.prototype.rebuildMenu = function () {
  var activeWindow = this.getActiveWindow()

  this.menuBar.setMenu(
    [
      {
        label: this.applicationMenuSymbol,
        children: this.applicationMenu
      }
    ].concat(
      this.currentWindowMenu,
      [
        {
          label: 'Window',
          children: [
            {
              label: 'Close window',
              // keyCode: 5911,
              keyLabel: 'Ctrl+W',
              isDisabled: !(activeWindow && activeWindow.isClosable),
              onClick: function () {
                this.hideActiveWindow()
              }.bind(this)
            },
            {
              label: '-'
            },
          ].concat(
            this._windows.
              filter(function (item) {
                return item.isVisible === true
              })
              .map(function (item) {
                return {
                  label: ((item.isActive) ? String.fromCharCode(7) + ' ' : '  ') + item.title,
                  isChecked: item.isActive,
                  onClick: function () {
                    this.setWindowActiveById(item.id)
                  }.bind(this)
                }
              }.bind(this))
          )
        }
      ]
    )
  );
}

/**
 * Applcation loop handling.
 * 
 * Go through all window that reloaded and call the _handleloop function.
 */
UIApp.prototype.loop = function() {
  // loop through all widget and call the loop function
  var tick = MsecTime();
  // loop through all window and call the loop function if it exists.
  this._windows.forEach(function (item) {
    if (item._handleLoop) {
      item._handleLoop(tick)
    }
  })

  // draw screen;
  this.draw();
}

/**
 * Handling drawing screen if needed.
 * 
 * It only redraws when needed.
 * It also renders some debug information if needed.
 * 
 */
UIApp.prototype.draw = function () {
  if (this.needsRedraw == true) {

    MouseShowCursor(false);
    ClearScreen(app.background);
    this._windows.forEach(function (windowItem) {
      if (windowItem.isVisible) {
        windowItem.draw();
      }
    })

    var activeWindow = this.getActiveWindow();
    if ((activeWindow && activeWindow.isModal !== true) || (activeWindow === undefined)) {
      this.menuBar.draw();
    }

    this.drawWindowMoveFrame()
    this.needsRedraw = false;

    // render last draw tick    
    if (this.showLastDrawTick) {
      var lastDrawStr = 'Last draw tick:' + MsecTime();    
      var lastDrawX = SizeX() - (Utils.calcTextWidth(lastDrawStr) + 16)
      FilledBox(lastDrawX, 6, SizeX(), 14, EGA.WHITE);
      TextXY(lastDrawX, 6, lastDrawStr, EGA.BLACK, EGA.BLUE);
    }

    MouseShowCursor(true);
  }

  if (this.showFps || this.showMemStats) {
    var statStr = ''

    // show FPS
    if (this.showFps) {
      statStr += 'FPS:' + GetFramerate() + ' ';
    }

    // show mem stats
    if (this.showMemStats) {
      var memoryInfo = MemoryInfo()
      // statStr += 'Mem:' + Utils.humanFileSize(memoryInfo.total - memoryInfo.remaining) + '/' + Utils.humanFileSize(memoryInfo.total)    
      statStr += 'Mem:' + (memoryInfo.total - memoryInfo.remaining) + '/' + (memoryInfo.total)
    }
    
    var statX = SizeX() - (Utils.calcTextWidth(statStr) + 16)
    FilledBox(statX, 6, SizeX(), 14, EGA.WHITE);
    TextXY(statX, 6, statStr, EGA.BLACK, EGA.BLUE);            
  }
}

/**
 * Draws the window move frame of the current window that use is moving.
 */
UIApp.prototype.drawWindowMoveFrame = function () {
  var activeWindow = this.getActiveWindow();
  if (!activeWindow || !this._windowIsMoving) {
    return;
  }

  var frameRect = Utils.createRectObj(this._windowMoveX, this._windowMoveY, activeWindow.w, activeWindow.h);
  Box(frameRect.x, frameRect.y, frameRect.w, frameRect.h, EGA.DARK_GRAY);
  Box(frameRect.x, frameRect.y, frameRect.w, frameRect.y + 20, EGA.DARK_GRAY);
}

/**
 * Do all keyboard/mouse handling of the applciation. think of handling menu shortcuts and window shortcuts.
 * Send the first to the menu and then through the active window if needed.
 * 
 * @param {*} event 
 * @returns 
 */
UIApp.prototype.input = function (event) {
  var activeWindow = this.getActiveWindow();
  // key press handle
  if (event.key >= 0) {
    // var key = event.key & 0xff
    var key = event.key
    var keyCode = key >> 8;
    var char = String.fromCharCode(key & 0xFF);

    // send to menubar
    var stopPropagation = this.menuBar.onKeyPress(key, keyCode, char)
    if (stopPropagation === true) {
      return;
    }

    // send key press to window   
    if (activeWindow && !this.menuBar.isActive && activeWindow.onKeyPress) {
      activeWindow._handleInput(key, keyCode, char);
    }
  }

  // mouse handle
  // check menu
  var mouseX = event.x
  var mouseY = event.y
  var mouseButtons = event.buttons
  var isLeftClicked = (mouseButtons === 0 && this._prevMouseButtons === 1);

  var menuHandled = false
  if ((activeWindow && activeWindow.isModal !== true) || (activeWindow === undefined)) {
    menuHandled = (this._windowIsMoving === false) ?
    this.menuBar._handleMouseInput(mouseButtons, mouseX, mouseY, isLeftClicked)
    : false
    if (!menuHandled) {
      this.menuBar.handleMenuShortCode(key)
    }
  }

  if (!menuHandled) {    
    this._inputMouseHandle(mouseButtons, mouseX, mouseY, isLeftClicked)
  }

  if (this.enableDebugWindow && keyCode === KEY.Code.KEY_F12) {
    if (this.debugWindow && this.debugWindow.isVisible) {
      this.hideWindow('debugWindow');
    } else {
      this.showWindow('debugWindow');
    }
  }

  this._prevMouseButtons = mouseButtons
  this._prevMouseTick = event.ticks
  this._prevMouseX = mouseX
  this._prevMouseY = mouseY
}

/**
 * Mouse handling handling.
 * 
 * @param {number} mouseButtons 
 * @param {number} mouseX 
 * @param {number} mouseY 
 * @param {bool} isLeftClicked 
 */
UIApp.prototype._inputMouseHandle = function (mouseButtons, mouseX, mouseY, isLeftClicked) {
  var activeWindow = this.getActiveWindow();

  if (this._windowIsMoving === true) {
    if (mouseButtons === 0) {
      this._windowIsMoving = false;      
      var newY = mouseY - this._windowOffsetY
      if (newY < 20) {
        newY = 20
      }

      activeWindow.setPosition(mouseX - this._windowOffsetX, newY);
      return;
    } else {
      this._windowMoveX = mouseX - this._windowOffsetX
      this._windowMoveY = mouseY - this._windowOffsetY
      this.reRender();
      return
    }
  }

  // check if a window needs to be actived
  if (activeWindow &&  activeWindow.rectTest(mouseX, mouseY)) {
    // check if going to drag the window
    if (activeWindow.showTitlebar === true && mouseButtons === 1 && this._prevMouseButtons == 0 && activeWindow.titlebarHitTest(mouseX, mouseY)) {
      this._windowIsMoving = true
      this._windowOffsetX = mouseX - activeWindow.x
      this._windowOffsetY = mouseY - activeWindow.y

      this._windowMoveX = mouseX - this._windowOffsetX
      this._windowMoveY = mouseY - this._windowOffsetY
      this.reRender();
      return;
    }

    activeWindow._handleMouseInput(mouseButtons, mouseX, mouseY, isLeftClicked);
    return;
  }

  if (isLeftClicked && activeWindow && activeWindow.isModal !== true) {
    var foundHits = this._windows
      .filter(function (child) {
        return child.isVisible === true && child.rectTest(mouseX, mouseY)
      });

    if (foundHits.length > 0) {
      // active window
      this.setWindowActiveById(foundHits[foundHits.length - 1].id)
    }
  }
}

/**
 * Shows the about window.
 */
UIApp.prototype.showAbout = function () {
  if (this.doesWindowExistsById('aboutWindow')) {
    this.showWindow('aboutWindow');
  } else {
    this.addWindow(new AboutWindow());
  }
}

/**
 * Add window to window stack and set active if is visible.
 * 
 * @param {UIWindow} window 
 */
UIApp.prototype.addWindow = function (window) {
  this._windows.push(window);
  window.setApp(this);
  window.init();
  if (window.isVisible) {
    this.setWindowActiveById(window.id)
  }
}

/**
 * Set window active by id
 * 
 * @param {string} id 
 */
UIApp.prototype.setWindowActiveById = function (id) {
  activeIndex = -1
  this._windows.forEach(function (windowItem, index) {
    // old window is active. mark for redraw
    if (windowItem.isActive === true && (id !== windowItem.id)) {
      windowItem.reDraw(); 
    }

    // mark window if it is active.
    windowItem.isActive = (id === windowItem.id)
    if (windowItem.isActive) {
      this.currentWindowMenu = windowItem.menu
      activeIndex = index
    }
  }.bind(this));

  if (activeIndex >= 0) {
    this._windows.push(this._windows.splice(activeIndex, 1)[0]);
    this._windows[this._windows.length - 1].reDraw();
    if (this._windows[this._windows.length - 1].onFocus) {
      this._windows[this._windows.length - 1].onFocus()
    }
  }

  this.rebuildMenu();
  this.reRender();
}

/**
 * Show the window visible and active bij id
 * 
 * @param {string} id 
 */
UIApp.prototype.showWindow = function (id) {
  var index = this.getWindowIndexById(id);
  if (index >= 0) {
    this._windows[index].setVisible(true);
  }
  this.setWindowActiveById(id);
}

/**
 * Returns active window that has current focus/active
 * 
 * @returns {UIWindow}
 */
UIApp.prototype.getActiveWindow = function () {
  var activeWindow = this._windows.filter(function (item) { return item.isActive === true });
  return activeWindow.length > 0 ? activeWindow[0] : undefined;
}

/**
 * Get index of window by id
 * 
 * @param {string} id 
 * @returns {number}
 */
UIApp.prototype.getWindowIndexById = function (id) {
  var foundIndex = -1;
  this._windows.forEach(function (item, index) {
    if (item.id === id) {
      foundIndex = index
    }
  })

  return foundIndex;
}

/**
 * Check if a window exists by id
 * 
 * @param {string} id 
 * @returns {bool}
 */
UIApp.prototype.doesWindowExistsById = function (id) {
  return (this.getWindowIndexById(id) >= 0)
}

/**
 * Hide window by id
 * 
 * @param {string} id 
 */
UIApp.prototype.hideWindow = function (id) {
  var windowIndex = this.getWindowIndexById(id);
  if (windowIndex >= 0) {
    this._windows[windowIndex].setVisible(false);
    this.reRender();
    var inactiveWindow = this._windows.filter(function (item) { return item.isVisible === true })
    if (inactiveWindow.length > 0) {
      var newWindow = inactiveWindow.pop();
      this.setWindowActiveById(newWindow.id);
    }
  }
  this.rebuildMenu();
}

/**
 * Hide active window
 */
UIApp.prototype.hideActiveWindow = function () {
  var activeWindow = this.getActiveWindow();
  if (activeWindow && activeWindow.isClosable) {
    activeWindow.close();
  }
}

/**
 * Removes a window by id from the stack.
 * It automaticly active the most last window in the stack.
 * 
 * @param {string} id 
 */
UIApp.prototype.removeWindowById =  function(id) {
  var windowIndex = this.getWindowIndexById(id);
  var activeWindow = this.getActiveWindow();

  if (windowIndex >= 0) {
    this._windows.splice(windowIndex, 1)    
    this.reRender();
  }

  if (activeWindow.id === id) {
    var inactiveWindow = this._windows.filter(function (item) { return item.isVisible === true })
    if (inactiveWindow.length > 0) {
      var newWindow = inactiveWindow.pop();
      this.setWindowActiveById(newWindow.id);
    }
  }
}

/**
 * Get the most recent mouse state as a object
 * 
 * @returns {buttons: number, tick: number, x: number, y: number}
 */
UIApp.prototype.getMouseState = function() {
  return {
    buttons: this._prevMouseButtons,
    tick: this._prevMouseTick,
    x: this._prevMouseX,
    y: this._prevMouseY
  }
}

/**
 * Mark the UI to be rendered.
 */
UIApp.prototype.reRender = function () {
  this.needsRedraw = true
}

/**
 * Shortcut function to get a font
 * 
 * @param {string} name 
 * @returns 
 */
UIApp.prototype.getFont = function(name) {
  return this.fonts.getFont(name);
}

exports.__VERSION__ = 1;
exports.UIApp = UIApp;

