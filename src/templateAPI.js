/*global define */
define(['jquery', 'handlebars'], function ($, hbs) {
  'use strict';

  var storage = navigator.storage || navigator.alsPolyfillStorage,
    storageIsProbablyFull = false,
    Handlebars = hbs.default,
    loaders = {},
    loaderProto = {
      templates: {}
    };

  function invoke(fn, arg) {
    if ($.isFunction(fn)) {
      fn(arg);
    }
  }

  function getProperty(value) {
    return {
      writable: true,
      configurable: true,
      value: value
    };
  }

  function createLoader(options) {
    var propertiesObject = {},
      prop,
      loader;

    if (typeof options.type !== 'string') {
      options.type = 'hbs';
    }
    if (typeof options.dir !== 'string') {
      options.dir = 'templates/';
    }

    for (prop in options) {
      if (options.hasOwnProperty(prop)) {
        propertiesObject[prop] = getProperty(options[prop]);
      }
    }

    loader = Object.create(loaderProto, propertiesObject);

    loaders[options.type] = loader;

    return loader;
  }

  function templateAPI(options) {
    if (typeof options === 'string') {

      return createLoader({
        type: options
      });

    }

    if (typeof options === 'object') {

      return createLoader(options);

    }

    console.error('Invalid options parameter.');
    return null;
  }


  loaderProto.load = function load(templateName, callback, onerror) {
    var that = this,
      templateUrl = this.dir + '/' + templateName + '.' + this.type;

    if (this.templates[templateName]) {
      setImmediate(callback, this.templates[templateName]);
      return;
    }

    function returnTemplate(source) {
      if (typeof source !== 'string') {
        console.error('Invalid source as template', 'loaderProto.load:returnTemplate', 85);
        return;
      }

      var template = null;
      try {
        template = Handlebars.compile(source);
        that.templates[templateName] = template;
      } catch (exp) {
        console.error('Invalid template:' + exp);
        storage.delete(templateUrl);
        invoke(onerror, exp);
        return;
      }
      invoke(callback, template);
    }

    function getTemplate() {
      $.get(templateUrl).then(function (value) {
        if (storageIsProbablyFull) {
          returnTemplate(value);
        } else {
          storage.set(templateUrl, value).then(function () {
            returnTemplate(value);
          }, function (e) {
            console.warn('template can not be saved in the storage' + e);
            storageIsProbablyFull = true;
          });
        }
      }, onerror);
    }

    storage.get(templateUrl).then(function (value) {
      if (typeof value === 'string') {
        returnTemplate(value);
      } else {
        getTemplate();
      }
    }, getTemplate);
  };

  window.templateAPI = templateAPI;

  return templateAPI;
});
