fix.define(['test2', 'test4'], function (test2, test4) {

  console.log('MODULES: test');

  var data = {
    info: 'Test',
    test2: test2,
    test4: test4
  };

  return function () {
    return data;
  };

});
