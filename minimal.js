Include('./ui/uiapp.js');

function Setup() {
  inputStr = ''
  SetFramerate(60);
  MouseShowCursor(true);
  MouseSetCursorMode(1);
  SetExitKey(KEY.Code.KEY_F12);

  // setup screen
  app = new UIApp();  
  app.init();

  // create basic window
  window1 = new UIWindow('example', 'Example window')
  window1.isClosable = false  

  app.addWindow(window1);
}

function Loop() {
  app.loop();
}

function Input(event) {
  app.input(event);
}
