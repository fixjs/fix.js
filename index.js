/*! FixJS v0.0.0 - MIT license */
(function () {

  var fix = require('./lib/fix.js'),
    FN = require('./lib/fn.js'),
    global = fix.ENV.g();

  var fnId = FN(function (x) {
    return FN(function (y) {
      return FN(function (z) {
        return x + y + z
      });
    });
  });

  console.log(FN.call(fnId, 10).call(11).call(6));

}());