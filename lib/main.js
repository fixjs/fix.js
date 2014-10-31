
var fix = {};
window.fix = fix;
exposeModuleSystem(fix);

fix.config({
	urlArgs: function(){
		return 'cacheKey=' + (new Date()).getTime();
	}
});

fix.require(['testModule'], function (testModule) {

  var data = testModule();

  console.log(data.test().test2().test3().info);

});
