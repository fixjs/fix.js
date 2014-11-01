/*
 * this file provides the core piece in our module system
 */
(function (global) {
  var
    objToString = Object.prototype.toString,

    define,
    fxRequire,

    getUrl,
    getScript,
    getScripts,

    //private stuff
    dependencyTree = {},
    dependencies = {},

    setDependencies,
    updateDependencies,

    isNode = (typeof GLOBAL !== 'undefined') &&
    (objToString.call(GLOBAL) === '[object global]'),

    options = {},

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

          info.fileName = url.substring(url.lastIndexOf('/') + 1);
          ind = info.fileName.lastIndexOf('.');
          if (-1 < ind) {
            info.ext = info.fileName.substring(ind);
            info.fileName = info.fileName.substring(0, ind);
          }
          info.filePath = url.substring(0, url.lastIndexOf('/') + 1);
          names[url] = info;
        }
        return info;
      };
    }()),

    baseFileInfo = getFileInfo(document.currentScript.src),
    baseUrl = document.currentScript.getAttribute('base') || baseFileInfo.filePath,

    installed = {},
    modules = {};

  //temporary shortcuts to be used in the console
  global._installed = installed;
  global._modules = modules;

  global._dependencyTree = dependencyTree;
  global._dependencies = dependencies;

  if (isNode) {

    console.log('NodeJS');

    getUrl = function (moduleName) {
      //TODO: implement it for Node
      console.warn('Not implemented yet');
      return './' + moduleName;
    };

    fxRequire = function (url, callback) {
      var args,
        i,
        len;

      if (typeof callback === 'function') {
        args = [];
        if (objToString.call(url) === '[object Array]') {
          i = 0;
          len = url.length;

          for (; i < len; i += 1) {
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
      var urlArgs = (typeof options.urlArgs === 'string') ?
        ('?' + options.urlArgs) :
        (typeof options.urlArgs === 'function') ?
        ('?' + options.urlArgs()) :
        '';

      return baseUrl + moduleName + '.js' + urlArgs;
    };

    setDependencies = function (name, arr, fn) {
      var i = 0,
        len = arr.length,
        dpNode,
        dpName;

      for (; i < len; i += 1) {
        dpName = arr[i];
        dpNode = dependencies[dpName];
        if (typeof dpNode !== 'object') {
          dpNode = {
            loaded: false,
            usedIn: []
          };
          dependencies[dpName] = dpNode;
        }
        dpNode.usedIn.push({
          name: name,
          callback: fn
        });
      }
    };

    updateDependencies = function (dpName) {
      var dpNode = dependencies[dpName],
        i = 0,
        len,
        moduleInfo,
        dpNodes;

      if (typeof dpNode !== 'object') {
        return;
      }

      dpNode.loaded = true;

      i = 0;
      len = dpNode.usedIn.length;

      for (; i < len; i += 1) {
        moduleInfo = dpNode.usedIn[i];
        dpNodes = dependencyTree[moduleInfo.name];

        //ind = Object.keys(dpNodes).indexOf(dpName);

        if (dpNodes && dpNodes[dpName] === false) {
          dpNodes[dpName] = true;
        }

        if (checkIfFullyLoaded(moduleInfo.name)) {
          moduleInfo.callback();
          updateDependencies(moduleInfo.name);
        }
      }
    };

    function checkIfFullyLoaded(moduleName) {
      var dpNodes = dependencyTree[moduleName];
      if (typeof dpNodes !== 'object') {
        return true;
      }
      var keys = Object.keys(dpNodes),
        i = 0,
        len = keys.length,
        dpName;

      for (; i < len; i += 1) {
        dpName = keys[i];

        if (dpNodes[dpName] === false) {
          return false;
        }

        if (!checkIfFullyLoaded(dpName)) {
          return false;
        }
      }

      return true;
    }

    global.checkIfFullyLoaded = checkIfFullyLoaded;
    global.updateDependencies = updateDependencies;

    getScript = (function (doc) {

      function onerror(e) {
        console.error('The script ' + e.target.src +
          ' is not accessible.');
      }

      return function getScript(url, callback) {
        var elem = doc.createElement('script');

        elem.onerror = onerror;
        if (typeof callback === 'function') {
          elem.addEventListener('load', function () {

            // debugger;
            updateDependencies(url);
            callback();
          });
        }

        doc.head.appendChild(elem);
        elem.src = getUrl(url);
      };

    }(global.document));

    getScripts = function getScripts(arr, callback) {
      if (!arr.length) {
        callback();
        return;
      }

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

    function getDPNodes(arr) {
      var dpNodes = {},
        i = 0,
        len = arr.length;

      for (; i < len; i += 1) {
        dpNodes[arr[i]] = false;
      }
      return dpNodes;
    }

    function rq(arr, fn, moduleDefine) {
      var fnArgs = [],
        moduleInfo = getFileInfo(document.currentScript.src),
        name = moduleInfo.fileName,
        arrHasData = (objToString.call(arr) === '[object Array]' && arr.length);

      if (!moduleDefine && !arrHasData) {
        console.error('Invalid input parameter to require a module');
        return;
      }

      if (typeof arr === 'function') {
        fn = arr;
        arr = null;
      } else if (typeof arr === 'string') {
        arr = [arr];
      }

      if (typeof fn !== 'function') {
        console.error('Invalid input parameter to require a module');
        return;
      }

      function installModule() {
        installed[name] = true;
        modules[name] = fn.apply(undefined, fnArgs);
      }

      if (moduleDefine && (!arr || !arr.length)) {
        installModule();
        return;
      }

      dependencyTree[name] = getDPNodes(arr);

      setDependencies(name, arr, (function (arr) {
        return function () {
          var i = 0,
            len = arr.length;

          for (; i < len; i += 1) {
            fnArgs.push(modules[arr[i]]);
          }
          if (moduleDefine) {
            installModule();
          }
        };
      }(arr)));

      getScripts(arr, function () {
        //No need to do anything here so far
      });
    }

    define = function define(arr, moduleDefinition) {
      rq(arr, moduleDefinition, true);
    };

    fxRequire = function require(arr, fn) {
      rq(arr, fn, true);
    };
  }

  function config(cnfOptions) {
    if (typeof cnfOptions !== 'object') {
      return;
    }
    var keys = Object.keys(cnfOptions),
      i = 0,
      len = keys.length,
      key;
    for (; i < len; i += 1) {
      key = keys[i];
      options[key] = cnfOptions[key];
    }
  }

  function exposeModuleSystem(g) {
    g.define = define;
    g.require = fxRequire;
    g.config = config;
    g.options = options;
  }

  if (isNode) {
    module.exports = exposeModuleSystem;
  } else {
    global.exposeModuleSystem = exposeModuleSystem;
  }

}(this));
