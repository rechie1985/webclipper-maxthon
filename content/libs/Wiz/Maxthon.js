'use strict';
Wiz.Maxthon = function () {
	var that = window.external.mxGetRuntime();
	//that.locale、that.storage可以直接调用
	that.browser = getApiObj(Wiz.Maxthon.BROWSER);

	function getApiObj(name) {
		try {
			var obj = that.create(name);
			return obj;
		} catch (err) {
			//TODO
		}
	}

	return that;
};

Wiz.Maxthon.BROWSER = 'mx.browser'; 