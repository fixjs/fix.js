fix.require(['testModule'], function (testModule) {

  var data = testModule();

  /*
   * NOTE:
   * Using this module system you have a completely safe scope
   * with your private data in it.
   * rules:
   *
   * - This might be more of a "how to" rather than a rule, but anyway, in order to use this system
   * the only script tags you should manually add to the page are:
   * - the initial script code, usually called "core" or "main" or whatever,
   * - and "module.js"
   * 
   * then you can add any of your modules without having them in a ordered list.
   *
   * - Module name should be unique, this might be considered as a restriction
   * but despite the fact that I don't think this is a valuable feature I have it in my backlog
   * 
   * Mehran Hatami
   */

  console.log(testModule().test().test2().test3().info);

  console.log(testModule().test().test4().info);

  //we don't need to do this, it is here just as a shortcut in console
  fix.testModule = testModule;

});
