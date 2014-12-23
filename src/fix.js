/*global define */
define([
  'jquery',
  'templateAPI',
  'dataAPI'
], function ($, templateAPI, dataAPI) {
  'use strict';

  var app = null,
    appProto = {};

  //this method creates the base app object
  function fix(options) {
    if (app === null) {
      app = Object.create(appProto);
    }
    if (typeof options === 'object') {
      $.extend(app, options);
    }
    return app;
  }

  //here we set up the observer for controllers
  function setupObserver(observer) {
    if (typeof observer !== 'object') {
      return;
    }

    var evt,
      evtObj,
      selector;

    //It is recommended not to define anonymous functions in a loop
    //that's why we better define a callback builder to be use in the loop
    function callback(fn) {
      return function () {
        fn.apply(this, arguments);
      };
    }

    for (evt in observer) {
      if (observer.hasOwnProperty(evt)) {
        evtObj = observer[evt];
        if (typeof evtObj !== 'object') {
          console.warn('Invalid observer object in controller!');
          continue;
        }
        for (selector in evtObj) {
          if (evtObj.hasOwnProperty(selector) && $.isFunction(evtObj[selector])) {

            //It is recommended not to define anonymous functions in a loop
            $(document).on(evt, selector, callback(evtObj[selector]));

          }
        }

      }
    }
  }

  //using templateAPI we can set up any template engine we want
  appProto.template = templateAPI({
    type: 'hbs',
    dir: 'templates'
  });

  //here as far as we didn't have any specific model actions
  //model doesn't do a lot, it just sets up the dataAPI
  appProto.model = function model(models) {
    this.data = dataAPI({
      models: models
    });

    return this;
  };

  //we have implemented our views using handlenars
  appProto.view = function view(views) {
    this.views = views;

    return this;
  };

  //a lightweight controller api here helps developers
  //develop any number of controllers
  appProto.controller = function controller(ctrl) {
    var bindings = ctrl(this);

    //in the real world we could use a grunt task for conditional compilation
    //to prevent this part from getting built in the deploy mode
    //if (DEBUG) {
    if (typeof bindings !== 'object') {
      console.warn('A controller should return a bindings object.');
      return;
    }
    //}

    if ($.isFunction(bindings.lunch)) {
      $(document).on('lunch', bindings.lunch);
    }

    if (typeof bindings.observer === 'object') {
      setupObserver(bindings.observer);
    }

    return this;
  };

  //this method just sets up the view and renders it in a container using handlebars templates
  appProto.render = function (templateName, data, container, callback) {
    this.template.load(templateName, function (template) {
      var html = template(data);
      $(container).html(html);
      if ($.isFunction(callback)) {
        callback(html);
      }
    });
  };

  //this method helps developers load their views and pass parameters if needed
  appProto.loadView = function (name, container, params, callback) {
    var that = this;
    this.data.$({
      name: name,
      params: params,
      callback: function (data) {
        that.render(name, data, container, callback);
      }
    });
  };

  //this methis lunch the application using all the lunch methods implemented in controllers
  appProto.lunch = function lunch() {
    $(function () {
      $(document).trigger('lunch');
    });

    return this;
  };

  return fix;
});
