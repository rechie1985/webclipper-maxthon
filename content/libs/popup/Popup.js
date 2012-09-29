'use strict';
var mainUrl = 'http://service.wiz.cn/web';
window.onload = function () {

	function showByCookies(cookies) {
		if (cookies) {
			Wiz.Browser.sendRequest(Wiz.Constant.ListenType.SERVICE, {'name': 'initRequest'});
				// clipPageControl.setNativeStatus(msg.hasNative);
		} else {
			PopupView.showLogin();
			// loginControl.initCreateAccountLink();
		}
	}


	function tabLoadedListener() {
		Cookie.getCookies(cookieName, showByCookies);
	}

	function wizPopupInitialize() {
		tabLoadedListener();
	}

	

	PopupView.initPopupPage();
	// var clipPageControl = new ClipPageControl();
	var loginControl = new LoginControl();
	
	//保证popup页面和preview页面同时关闭
	// chrome.extension.connect({
	// 	name : 'popupClosed'
	// });

	wizPopupInitialize();
	Wiz.Message.get('app.title');
};