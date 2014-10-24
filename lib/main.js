(function (global) {

  global.fix = {};

  global._initRequire(fix);

  fix.require(['test'], function (testModule) {
    
    console.log(testModule());

  });

}(this));
