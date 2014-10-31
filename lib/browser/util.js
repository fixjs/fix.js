fix.define(['../util.js'], function (util) {

  var doc = window.document;

  function onerror(e) {
    console.error('The script ' + e.target.src +
      ' is not accessible.');
  }

  function getScript(url, callback) {
    var elem = doc.createElement('script');

    elem.onerror = onerror;
    if (typeof callback === 'function') {
      elem.addEventListener('load', function () {
        callback();
      });
    }

    doc.head.appendChild(elem);
    elem.src = url;
  }

  function getScriptRecursive(arr, i, callback) {
    if (i < arr.length) {
      getScript(arr[i], function () {
        i += 1;
        getScriptRecursive(arr, i, callback);
      });
    } else {
      callback();
    }
  }

  util.getScript = getScript;
  util.getScriptRecursive = getScriptRecursive;

}, module);
