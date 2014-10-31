fix.define(['test2'], function (test2) {

  console.log('MODULES: test');

  var data = {
    info: 'Test',
    test2: test2
  };

  return function () {
    return data;
  };

});
