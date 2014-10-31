fix.define([], function () {
  
  console.log('MODULES: test3');

  var data = {
    info: 'Congratulation This is the most inner module in the dependency chain!!'
  };

  return function () {
    return data;
  };

});
