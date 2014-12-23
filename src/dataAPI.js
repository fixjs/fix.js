/*global define */
define(['jquery'], function ($) {
  'use strict';

  var apiProto = {};

  function baseUrlMapper(name) {
    return 'data/' + name + '.json';
  }

  function getJSON(options) {
    var urlMapper;
    if (!$.isFunction(options.urlMapper)) {
      urlMapper = baseUrlMapper;
    }

    //NOTE:
    //There is a missing part here, which is related to passing params
    //As far as this is not a real server communication we don't pass around params
    //But in the real world we would definitely need to pass parameters like productId

    return $.getJSON(urlMapper(options.name)).then(function (value) {
      if ($.isFunction(options.callback)) {
        options.callback(value);
      }
    }, options.onerror);
  }

  //this is the main dataAPI method exposed for developers to use
  apiProto.$ = function api$(options) {
    if (!$.isFunction(options.urlMapper)) {
      options.urlMapper = (this.options && this.options.urlMapper);
    }
    return getJSON(options);
  };

  var jsonAPI = function (options) {
    var api = Object.create(apiProto),
      i = 0,
      len,
      makeHelper;

    if ($.isArray(options.models)) {

      makeHelper = function makeHelper(name) {
        api[name] = function (options) {
          options.name = name;
          return this.$(options);
        };
      };

      for (len = options.models.length; i < len; i += 1) {
        makeHelper(String(options.models[i]));
      }
    }

    return api;
  };

  return jsonAPI;
});
