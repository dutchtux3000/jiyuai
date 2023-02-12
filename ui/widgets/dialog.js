var dialogCounter = 0
var DIALOG_PADDING_X = 10;
var DIALOG_PADDING_Y = 10;
/**
 * Create dialogs with buttons
 * 
 * @param {string} title 
 * @param {string} description 
 * @param {*[]} buttons 
 */
function UIDialog(title, description, buttons) {
  dialogCounter++;
  UIWindow.call(this, 'dialog' + dialogCounter, title)
  this.description = description;
  this.buttons = buttons  
  this.isModal = true
  this.showTitlebar = false;
  this.destroyOnClose = true;

  if (this.buttons.length > 1) {
    this.isClosable = false;
  }
}

UIDialog.prototype = Object.create(UIWindow.prototype);
UIDialog.constructor = UIDialog;

/**
 * Init dialog
 */
UIDialog.prototype.init = function() {
  var font = this.app.getFont('pc6x8');

  var descriptionLineSplit = this.description.split('\n');
  var minWidth = this.buttons.length * 90
  var labelMaxWidth = this.showTitlebar ? font.StringWidth(this.title) + 40 : minWidth + (DIALOG_PADDING_Y * 2);
  var labelPosY = this.showTitlebar === true ?  20 : 0;
  descriptionLineSplit.forEach(function (line) {
    var textWidth = font.StringWidth(line);
    if (textWidth > labelMaxWidth) {
      labelMaxWidth = textWidth;
    }
    var uiLabel = new UIText(DIALOG_PADDING_X, DIALOG_PADDING_Y + labelPosY, line);

    this.addChildren(uiLabel);
    labelPosY = labelPosY + 10;
  }.bind(this));
  labelPosY = labelPosY + 10;

  labelMaxWidth = (labelMaxWidth < minWidth) ? minWidth : labelMaxWidth;

  var buttonOffsetX = labelMaxWidth + DIALOG_PADDING_X;
  this.buttons.reverse().forEach(function (btn) {
    var button = new UIButton(0, 0, btn.label)
    button.hasFocus = btn.hasFocus;
    button.onClick = function() {
      if (btn.onClick) {
        btn.onClick();
      }      
      this.close();
    }.bind(this);
    button.setSize((button.w < 75) ? 75 : button.w, button.h)
    button.setPosition(buttonOffsetX - button.w, DIALOG_PADDING_Y + labelPosY);
    this.addChildren(button);
    buttonOffsetX = buttonOffsetX - (button.w + 10)
  }.bind(this))

  this.setSize(labelMaxWidth + (DIALOG_PADDING_X * 2), 20 + (DIALOG_PADDING_Y * 2) + labelPosY)
  this.setPosition(-1, 80);
}

/**
 * Function to create alert dialog
 * 
 * @param {UIApp} app 
 * @param {string} description 
 * @param {string} title 
 * @param {Function} callBack 
 */
UIDialog.createAlert = function(app, description, title, callBack) {
  var dialog = new UIDialog(
    title ? title : 'Alert',
    description,
    [
      {
        label: 'OK',
        hasFocus: true,
        onClick: callBack
      }
    ]
  );
  
  app.addWindow(dialog)
  dialog.reDraw();
}

/**
 * Create confirm dialog
 * 
 * @param {UIApp} app 
 * @param {string} description 
 * @param {string} title 
 * @param {Function} callBack 
 */
UIDialog.createConfirm = function(app, description, title, callBack) {
  var dialog = new UIDialog(
    title ? title : 'Confirm',
    description,
    [
      {
        label: 'OK',
        hasFocus: true,
        onClick: function () {
          callBack(true);
        },
      },
      {
        label: 'Cancel',
        hasFocus: false,
        onClick: function () {
          callBack(false);
        },
      }    
    ]
  );
  
  app.addWindow(dialog)
  dialog.reDraw();
}

exports.__VERSION__ = 1;
exports.UIDialog = UIDialog;