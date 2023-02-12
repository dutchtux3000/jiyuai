var inputStr = '';
Include('./ui/uiapp.js');
Include('./demos/dlgdemo.js');
Include('./demos/scrdemo.js');
Include('./demos/ascdemo.js');

function Setup() {  
  inputStr = ''
  SetFramerate(60);
  MouseShowCursor(true);
  MouseSetCursorMode(1);
  //SetExitKey(KEY.Code.KEY_F12);
  SetExitKey(KEY.Code.NO_KEY);

  // setup screen
  app = new UIApp();  
  app.showFps = false;
  app.showMemStats = false;
  app.enableDebugWindow = true;
  app.showLastDrawTick = false;
  app.init();

  /**
   * Demos that the user can test/see
   */
  var demoExamples = [
    {
      label: 'Text input example',
      keyCode: 7170,
      keyLabel: 'Ctrl+1',
      onClick: function() {
        app.showWindow('window2')
      }
    },
    {
      label: 'Ascii table',
      keyCode: 7426,
      keyLabel: 'Ctrl+2',
      onClick: function() {
        if (app.doesWindowExistsById('ascciDemo')) {
          app.showWindow('ascciDemo')
        } else {
          app.addWindow(new AsciiTableDemo());
        }
      }
    },
    {
      label: 'Dialog demo',
      keyCode: 7682,
      keyLabel: 'Ctrl+3',
      onClick: function() {
        if (app.doesWindowExistsById('dialogDemo')) {
          app.showWindow('dialogDemo')
        } else {
          app.addWindow(new DialogDemo());
        }
      }
    },
    {
      label: 'Scrollbar demo',
      keyCode: 7938,
      keyLabel: 'Ctrl+4',
      onClick: function() {
        if (app.doesWindowExistsById('scrollbarDemo')) {
          app.showWindow('scrollbarDemo')
        } else {
          app.addWindow(new ScrollbarDemo());
        }
      }
    },    
    {
      label: 'About dialog',
      onClick: function() {
        app.showAbout()
      }
    }
  ]

  /**
   * Build demo window
   */
  window1 = new UIWindow('window1', 'Example widgets')
  window1.isClosable = false  
  window1.menu = [
    {
      label: 'Examples',
      children: demoExamples,
    },
  ]  
  window1.addChildren(new UIText(10, 30, 'Here are list of of demos'))


  var buttonOffsetY = 50;
  demoExamples.forEach(function (item) {
    button = new UIButton(10, buttonOffsetY, item.label);
    button.setSize(230, 20);
    button.onClick = item.onClick
    buttonOffsetY = buttonOffsetY + 30  
    window1.addChildren(button)
  })

  window1.setSize(250, buttonOffsetY);
  window1.setPosition(-1, -1)

  app.addWindow(window1);
  
  /**
   * Create input example
   */
  window2 = new UIWindow('window2', 'Text input example')
  window2.setSize(300, 100);  
  window2.setPosition(-1, -1);
  window2.setVisible(false);
  window2.menu = [];

  // window2.addChildren(new UITextInput('Input value', 10, 30, 280, 20))
  window2.addChildren(new UITextInput('Here are list of supported widgets/controls', 10, 30, 280, 20))
  // window2.addChildren(new UITextInput('', 10, 30, 280, 20))
  window2.addChildren(new UIButton(10, 60, 'Focus switch test'))
  app.addWindow(window2);

  // just do some garbage collecting if needed
  Gc();
}

function Loop() {
  app.loop();

  // Some debug code.
  // TextXY(0, SizeY() - 10, "fps:" + GetFramerate(), EGA.WHITE);  
  // TextXY(0, SizeY() - 20, "memory:" + JSON.stringify(MemoryInfo()), EGA.WHITE);
  // TextXY(0, SizeY() - 30, "inputStr:" + inputStr, EGA.WHITE);
}

function Input(event) {
  
  var newEvent = JSON.parse(JSON.stringify(event));
  newEvent.keyCode = event.key >> 8;
  inputStr = JSON.stringify(newEvent);   

  // forcegarbage collecting if needed
  if (event.key === 1792) { // ctrl + alt + g
    Gc()
  }

  app.input(event);
}
