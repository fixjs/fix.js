fix.define(['test'], function (test) {
  
  console.log('MODULES: testModule');

  var data = {
    info: 'Test Module',
    test: test
  };

  return function () {
    return data;
  };

});
