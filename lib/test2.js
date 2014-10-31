fix.define(['test3'], function (test3) {

  console.log('MODULES: test2');

  var data = {
    info: 'Test2',
    test3: test3
  };

  return function () {
    return data;
  };

});
