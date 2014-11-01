/*!
 * module.js
 * Copyright (c) 2014 Mehran Hatami
 * Version: 1.0.0a
 * Released under the MIT License.
 *
 * Date: 2014-11-01
 */
(function (global) {
  var doc = global.document,
    objToString = Object.prototype.toString,
    dependencyTree = {},
    dependencies = {},
    options = {},
    files = {},
    baseFileInfo,
    baseUrl,
    installed = {},
    modules = {};

  function getFileInfo(url) {
    var info = files[url],
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
      files[url] = info;
    }
    return info;
  }

  baseFileInfo = getFileInfo(document.currentScript.src);
  baseUrl = document.currentScript.getAttribute('base') || baseFileInfo.filePath;

  function getUrl(moduleName) {
    var urlArgs = (typeof options.urlArgs === 'string') ?
      ('?' + options.urlArgs) :
      (typeof options.urlArgs === 'function') ? ('?' + options.urlArgs()) : '';

    return baseUrl + moduleName + '.js' + urlArgs;
  }

  function setDependencies(name, arr, fn) {
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
  }

  function updateDependencies(dpName) {
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
  }

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



  function getScript(url, callback) {
    var elem = doc.createElement('script');
    if (getScript.onerror === undefined) {
      getScript.onerror = function (e) {
        console.error('The module/script ' + e.target.src + ' is not accessible.');
      };
    }
    elem.onerror = getScript.onerror;
    if (typeof callback === 'function') {
      elem.addEventListener('load', function () {
        updateDependencies(url);
        callback();
      });
    }

    doc.head.appendChild(elem);
    elem.src = getUrl(url);
  }

  function getScripts(arr, callback) {
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
  }

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

  function define(arr, moduleDefinition) {
    rq(arr, moduleDefinition, true);
  }

  function require(arr, fn) {
    //passing "true" is a temporary fix not the final solution
    rq(arr, fn, true);
  }

  function expose(g) {
    g.define = define;
    g.require = require;
  }

  //Note: just in dev mode (browser cache disabled)
  options.urlArgs = function () {
    return 'cacheKey=' + (new Date()).getTime();
  };

  expose(global.fix);

}(this));
