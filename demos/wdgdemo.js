function WidgetsDemo() {
  UIWindow.call(this, 'widgetsDemo', 'Component/widget showcase')
  this.setSize(SizeX()- 10, SizeY() - 30)
  this.setPosition(-1, 25)
  this.destroyOnClose = true;
  this.menu = [
    {
      label: 'Menu item',
      children: [
        {
          label: 'You can have multiple menu items attached to a window'
        },
        {
          label: '-'
        },
        {
          label: 'The can be separated by a line if you want'
        }
      ]
    },
    {
      label: 'Second menu item',
      children: [
        {
          label: 'Second menu item'
        },
      ]
    }
  ]
}


WidgetsDemo.prototype = Object.create(UIWindow.prototype);
WidgetsDemo.constructor = WidgetsDemo;


WidgetsDemo.prototype.init = function() {
  this.addChildren(new UIText(10, 30, 'This is a showcase of all supported widgets'));
  this.addChildren(new UIButton(10, 50, 'Example Button'));
  this.addChildren(new UITextInput('Example text input', 10, 80, 200));
  this.addChildren(new UIScrollBar(10, 110, 200, 20));
  this.addChildren(new UIScrollBar(10, 130, 20, 100));
  this.addChildren(new UICheckbox(10, 240, 'Checkbox example 1'));
  this.addChildren(new UICheckbox(10, 260, 'Checkbox example 2', true));

  var menu = new UIMenu(
      this.app, 
      [
        {
          label: 'Menu item test'
        },
        {
          label: '-'
        },
        {
          label: 'menu item 2'
        }      
      ],
      220, 
      50
    );
    this.addChildren(menu);

  var group = new UIGroup('Group name', 40, 130, 200, 100)
  this.addChildren(group);
  group.addChildren(new UIText(10, 20, 'A widget inside a group'));
  group.addChildren(new UIButton(10, 40, 'Example Button'))

  this.addChildren(new UIImage(new Bitmap('./images/js.png'), 10, 300))
}

exports.__VERSION__ = 1;
exports.WidgetsDemo = WidgetsDemo;
