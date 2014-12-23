define(['global'],function (global) {

  function XHR() {
    var xhr;
    if (global.ActiveXObject) {
      try {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        console.log(e.message);
        xhr = null;
      }
    } else {
      xhr = new XMLHttpRequest();
    }

    return xhr;
  }

});
