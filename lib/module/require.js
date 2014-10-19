/*
 * this file provides the core piece in our module system
 */
(function (global) {
  var getScript,
    isNode = (typeof GLOBAL !== 'undefined') &&
    (Object.prototype.toString.call(GLOBAL) === '[object global]');

  if (isNode) {

    console.log('NodeJS');

    getScript = function (url, callback) {

      if (typeof callback === 'function') {

        var callCallback = (function (moduleObj) {
          return function () {
            callback.call(undefined, moduleObj);
          };
        }(require('./' + url)));

        setTimeout(callCallback, 0);

      } else {
        require('./' + url);
      }

    };

  } else {

    getScript = (function (doc) {
      var head;

      function onerror(e) {
        console.error('The script ' + e.target.src +
          ' is not accessible.');
      }

      return function getScript(url, callback) {
        var elem = doc.createElement('script'),
          beforeCurrentScript = arguments[2];

        elem.type = 'text/javascript';
        elem.onerror = onerror;
        if (typeof callback === 'function') {
          //elem.onload = callback;
          elem.addEventListener('load', callback);
        }

        //TODO: specify the exact difference here between these two approach
        if (arguments.length === 3 && !!beforeCurrentScript) {
          doc.currentScript.parentNode.insertBefore(elem, doc.currentScript);
        } else {
          if (typeof head === 'undefined') {
            head = doc.head || doc.getElementsByTagName('head')[0];
          }
          head.appendChild(elem);
        }
        elem.src = url;
      };

    }(global.document));
  }

  global.getScript = getScript;
}(this));
