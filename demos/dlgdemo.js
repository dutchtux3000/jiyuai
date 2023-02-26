/**
 * Dialog demo
 */
function DialogDemo() {
  UIWindow.call(this, 'dialogDemo', 'Dialog demo')
  this.setSize(320, 150);
  this.setPosition(-1, -1);
  this.destroyOnClose = true;
}

DialogDemo.prototype = Object.create(UIWindow.prototype);
DialogDemo.constructor = DialogDemo;

DialogDemo.prototype.init = function() {
  
  this.addChildren(new UIText(10, 36, 'Title'))
  this.titleInput = new UITextInput('Dialog title', 80, 30, 230, 20)
  this.addChildren(this.titleInput);

  this.addChildren(new UIText(10, 66, 'Description'))
  this.descriptionInput = new UITextInput('Dialog description', 80, 60, 230, 20)
  this.addChildren(this.descriptionInput);

  this.showAlertButton = new UIButton(10,  90, 'Show alert');
  this.showAlertButton.onClick = this.showAlertDialog.bind(this);
  this.addChildren(this.showAlertButton)

  this.showConfirmButton = new UIButton(140,  90, 'Show confirm');
  this.showConfirmButton.onClick = this.showConfirmDialog.bind(this);
  this.addChildren(this.showConfirmButton)  

  this.multiLineDialogButton = new UIButton(10,  120, 'Show multi-line');
  this.multiLineDialogButton.onClick = function() {
    UIDialog.createAlert(
      this.app, 
      'A multiline alert dialog with multiple lines.\nThe lines are from different sizes\nThis is third line to render.\nThe last line you can now close this message. :)'
    );
  }
  this.addChildren(this.multiLineDialogButton);
}

/**
 * Show alert dialog
 */
DialogDemo.prototype.showAlertDialog = function() {
  UIDialog.createAlert(
      this.app, 
      this.descriptionInput.value,
      this.titleInput.value
  )
}

/**
 * Show confirm dialog
 */
DialogDemo.prototype.showConfirmDialog = function() {
  UIDialog.createConfirm(
      this.app, 
      this.descriptionInput.value,
      this.titleInput.value, 
      function (status) {
        UIDialog.createAlert(
          this.app, 
          status ? 'You clicked OK' : 'You clicked Cancel' ,
          'Result'
        );40
      }
  )
}

exports.__VERSION__ = 1
exports.DialogDemo = DialogDemo
