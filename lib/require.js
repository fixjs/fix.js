/*
 * this file provides the core piece in our module system
 */
(function (global) {
  var
    objToString = Object.prototype.toString,
    getScript,
    getUrl,
    define,

    getScriptRecursive,
    getScriptsParallel,
    getScripts,

    fxRequire,

    isNode = (typeof GLOBAL !== 'undefined') &&
    (objToString.call(GLOBAL) === '[object global]'),

    getFileInfo = (function () {
      var names = {};
      return function getFileInfo(url) {
        var info = names[url],
          ind;
        if (typeof info !== 'object') {
          info = {};

          ind = url.indexOf('#');
          if (-1 < ind) {
            info.hash = url.substring(ind);
            url = url.substring(0, ind);
          }

          ind = url.indexOf('?');
          if (-1 < ind) {
            info.search = url.substring(ind);
            url = url.substring(0, ind);
          }

          info.fileName = url.substring(url.lastIndexOf("/") + 1);
          ind = info.fileName.lastIndexOf('.');
          if (-1 < ind) {
            info.ext = info.fileName.substring(ind);
            info.fileName = info.fileName.substring(0, ind);
          }
          info.filePath = url.substring(0, url.lastIndexOf("/") + 1);
          names[url] = info;
        }
        return info;
      };
    }()),

    baseFileInfo = getFileInfo(document.currentScript.src),
    baseUrl = document.currentScript.getAttribute('base') || baseFileInfo.filePath,

    installed = {},
    modules = {};

  if (isNode) {

    console.log('NodeJS');

    getUrl = function (moduleName) {
      //TODO: implement it for Node
      console.warn('Not implemented yet');
      return './' + moduleName;
    };

    fxRequire = function (url, callback) {
      var args;

      if (typeof callback === 'function') {
        args = [],
          i,
          len;

        if (objToString.call(url) === '[object Array]') {
          i = 0;
          len = url.length;

          while ((++i) < len) {
            args.push(require(getUrl(url[i])));
          }
        } else {
          args.push(require(getUrl(url)));
        }

        var callCallback = (function (args) {
          return function () {
            callback.apply(undefined, args);
          };
        }(args));

        setTimeout(callCallback, 0);

      } else {
        require(getUrl(url));
      }
    };

    define = function define() {
      //define code
      fxRequire.apply(undefined, arguments);
    };

  } else {

    getUrl = function (moduleName) {
      return baseUrl + moduleName + '.js';
    };

    getScript = (function (doc) {
      var head;

      function onerror(e) {
        console.error('The script ' + e.target.src +
          ' is not accessible.');
      }

      return function getScript(url, callback) {
        var elem = doc.createElement('script'),
          beforeCurrentScript = arguments[2];

        elem.onerror = onerror;
        if (typeof callback === 'function') {
          elem.addEventListener('load', function () {
            callback();
          });
        }

        doc.head.appendChild(elem);
        elem.src = getUrl(url);
      };

    }(global.document));

    getScriptRecursive = function getScriptRecursive(arr, i, callback) {
      if (i < arr.length) {
        getScript(arr[i], function () {
          i += 1;
          getScriptRecursive(arr, i, callback);
        });
      } else {
        callback();
      }
    };

    getScriptsParallel = function getScriptsParallel(arr, callback) {
      var i = -1,
        len = arr.length,
        loaded = 0;

      function pCallback() {
        loaded += 1;
        if (loaded === len) {
          callback();
        }
      }

      while ((++i) < len) {
        getScript(arr[i], pCallback);
      }
    };

    getScripts = function getScripts(array, parallel, callback) {
      if (typeof parallel === 'function') {
        callback = parallel;
        parallel = true;
      }
      if (!array.length) {
        callback();
        return;
      }
      if (!parallel) {
        getScriptRecursive(array, 0, callback);
      } else {
        getScriptsParallel(array, callback);
      }
    };

    define = function define(arr, moduleDefinition) {
      var moduleInfo = getFileInfo(document.currentScript.src),
        name = moduleInfo.fileName;

      getScripts(arr, function () {
        var args = [],
          i = 0,
          len = arr.length;

        while ((++i) < len) {
          args.push(modules[arr[i]]);
        }

        installed[name] = true;
        //alert('192: execute module ' + name);
        modules[name] = moduleDefinition.apply(undefined, args);
      });
    };

    fxRequire = function require(arr, fn) {
      getScripts(arr, false, function () {
        var args = [],
          i = 0,
          len = arr.length;
        for (; i < len; i += 1) {
          args.push(modules[arr[i]]);
        }
        fn.apply(undefined, args);
      });
    };
  }

  function exposeModuleSystem() {

  }

  if (isNode) {



  } else {

    global.baseUrl = baseUrl;

    global._initRequire = function (g) {
      g.define = define;
      g.require = fxRequire;
    };

  }

}(this));
