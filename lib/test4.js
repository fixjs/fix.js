fix.define([], function () {
  
  console.log('MODULES: test4');

  var data = {
    info: 'Congratulation This is another branch in the dependency chain!!'
  };

  return function () {
    return data;
  };

});