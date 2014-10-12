/*! fix.js v0.0.1 - MIT license */
(function (ENV) {

  function fix() {}

  function fixRequire(name) {
    console.log('fixRequire is called in order to manage:' + name + ' as a dependency!');
    return {};
  }

  function manageDefineArgs(dependencies, moduleDefinition, exModule) {
    var options = {};

    if (arguments.length === 1) {
      /**
       *
       *define(moduleDefinition:Function)
       *
       */
      if (typeof dependencies !== 'function') {
        return false;
      }
      options.moduleDefinition = dependencies;
      options.dependencies = [];

      if (ENV.isNode()) {
        options.exModule = (this === fix) ? (exModule || null) : module;
      } else {
        options.exModule = null;
      }
    } else if (arguments.length === 2) {
      if (Array.isArray(dependencies) || typeof dependencies === 'string') {

        /**
         *
         *define(['dependency1', 'dependency2'], moduleDefinition:Function)
         *define(dependency1', moduleDefinition:Function)
         *
         */
        if (typeof moduleDefinition !== 'function') {
          return false;
        }

        options.exModule = null;

      } else {

        /**
         *define(moduleDefinition:Function, module:Object)
         */
        if (typeof dependencies !== 'function' ||
          typeof moduleDefinition !== 'object') {
          return false;
        }

        options.exModule = moduleDefinition;
        options.moduleDefinition = dependencies;
        options.dependencies = [];

      }
    } else if (arguments.length === 3) {

      /**
       *Defult:
       *expose(['dependency1', 'dependency2'], moduleDefinition:Function, module:Object)
       *expose('dependency1', moduleDefinition:Function, module:Object)
       *
       */
      if (!(Array.isArray(dependencies) || typeof dependencies === 'string') ||
        typeof moduleDefinition !== 'function' ||
        (typeof exModule !== 'object' || !exModule)) {
        return false;
      }
    }

    if (typeof options.moduleDefinition !== 'function') {
      return false;
    }

    return options;
  }

  function invokeModuleDefinition(dependencies, moduleDefinition) {
    var i = 0,
      len,
      args,
      moduleObj,
      requireFN = fixRequire;

    if (isNode()) {
      requireFN = require;
    }

    if (Array.isArray(dependencies)) {
      args = [];
      len = dependencies.length;
      for (; i < len; i += 1) {
        args.push(requireFN(dependencies[i]));
      }
      return moduleDefinition.apply(undefined, args);
    }

    return moduleDefinition(requireFN(dependencies));
  }

  function fixDefine(dependencies, moduleDefinition, exModule) {
    //create couple of different method overrides
    var options = manageDefineArgs.apply(this, arguments);
    if (!options) {
      console.error('Invalid input parameter!');
      return;
    }
    dependencies = options.dependencies;
    moduleDefinition = options.moduleDefinition;
    exModule = options.exModule;

    //Actual code of the function
    var name,
      i = 0,
      len,
      args,
      moduleObj;

    name = (typeof moduleDefinition.name === 'string' && moduleDefinition.name) || null;

    if (ENV.isNode() && typeof exModule === 'object' && exModule) {

      moduleObj = invokeModuleDefinition(dependencies, moduleDefinition);

      if (name) {
        exModule.exports[name] = moduleObj;
      } else {
        exModule.exports = moduleObj;
      }

    } else if (typeof define === 'function' && define.amd) {
      // amd anonymous module registration
      define(dependencies, moduleDefinition);

    } else {

      moduleObj = invokeModuleDefinition(dependencies, moduleDefinition);

      if (name) {
        // expose as a global object
        global[name] = moduleObj;
      }
    }
  }

  fix.ENV = ENV;
  fix.define = fixDefine;
  fix.version = '0.0.1';

  fixDefine('./../bower_components/lodash/dist/lodash', function (_) {
    return fix;
  });

  //fix is getting global now!!!!!!
  ENV.g('fix', fix);
  //fix just got global now!!!!!!

}(

  (function (that) {
    function isNode() {
      if (typeof isNode._isnode === 'undefined') {
        isNode._isnode = (typeof GLOBAL !== 'undefined' && Object.prototype.toString.call(GLOBAL) === '[object global]');
      }
      return isNode._isnode;
    }

    function isBrowser() {
      if (typeof isBrowser._isbrowser === 'undefined') {
        isBrowser._isbrowser = (typeof window === 'undefined' && Object.prototype.toString.call(window) === '[object global]');
      }
      return isBrowser._isbrowser;
    }

    function ifElse(isBrowserFN, isNodeFN) {
      ifIsBrowser(isBrowserFN);
      ifIsNode(isNodeFN);
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

    function g(key, value) {
      if (typeof key === 'string') {
        if (typeof value !== 'undefined') {
          g()[key] = value;
        } else {
          return g()[key] = value;
        }
      } else {
        if (typeof g._global === 'undefined') {
          if (isNode()) {
            g._global = GLOBAL;
          } else if (typeof window !== 'undefined') {
            g._global = window;
          } else {
            console.warn('There seems to be a suspicious problem with respect to the base JavaScript environment');
            g._global = that;
          }
        }
        return g._global;
      }
    }

    return {
      isNode: isNode,
      g: g
    };

  }(this))

));