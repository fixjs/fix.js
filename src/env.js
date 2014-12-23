(function () {
  var global = (function () {
    return this;
  }());

  function isNode() {
    if (typeof isNode._isnode === 'undefined') {
      isNode._isnode = (typeof GLOBAL !== 'undefined' && Object.prototype
        .toString.call(GLOBAL) === '[object global]');
    }
    return isNode._isnode;
  }

  function isBrowser() {
    if (typeof isBrowser._isbrowser === 'undefined') {
      isBrowser._isbrowser = (typeof window === 'undefined' && Object.prototype
        .toString.call(window) === '[object global]');
    }
    return isBrowser._isbrowser;
  }

  function ifIsNode(fn, thisArg) {
    var args;
    if (isNode()) {
      args = Array.prototype.slice.call(arguments, 2);
      fn.apply(thisArg, args);
    }
  }

  function ifIsBrowser(fn, thisArg) {
    var args;
    if (isBrowser()) {
      args = Array.prototype.slice.call(arguments, 2);
      fn.apply(thisArg, args);
    }
  }

  function ifBrowserElse(isBrowserFN, isNodeFN) {
    ifIsBrowser(isBrowserFN);
    ifIsNode(isNodeFN);
  }

  function ifNodeElse(isNodeFN, isBrowserFN) {
    ifIsNode(isNodeFN);
    ifIsBrowser(isBrowserFN);
  }

  function g(key, value) {
    if (typeof key === 'string') {
      if (typeof value !== 'undefined') {
        g()[key] = value;
      } else {
        return g()[key];
      }
    } else {
      if (typeof g._global === 'undefined') {
        if (isNode()) {
          g._global = GLOBAL;
        } else if (typeof window !== 'undefined') {
          g._global = window;
        } else {
          console.warn(
            'There seems to be a suspicious problem with respect to the base JavaScript environment'
          );
          g._global = global;
        }
      }
      return g._global;
    }
  }

  return {
    isNode: isNode,
    isBrowser: isBrowser,
    ifIsNode: ifIsNode,
    ifIsBrowser: ifIsBrowser,
    ifBrowserElse: ifBrowserElse,
    ifNodeElse: ifNodeElse,
    g: g,
    global: g
  };

}());
