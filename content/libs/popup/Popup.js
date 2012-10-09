'use strict';
window.onload = function () {

	var handlers = {
		'loginError': loginErrorHandler,
		'loginSuccess': loginSuccessHandler
	},
		isAutoLogin = false;

	function loginErrorHandler(err) {
		PopupView.showLoginError(err.params);
	}

	function loginSuccessHandler(response) {
		if (keep_passoword.checked) {
			$('#loginoff_div').hide();
			var value = $('#user_id').val() + '*' + $('#password').val();
		}
		if (!isAutoLogin) {
			//自动登陆不需要再次设置token
			Cookie.setCookies(Wiz.Constant.Default.AUTH_COOKIE, value, Wiz.Constant.Default.TOKEN_EXPIRE_SEC);
		}
	}

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
		Cookie.getCookies(Wiz.Constant.Default.AUTH_COOKIE, showByCookies);
	}

	function wizPopupInitialize() {
		tabLoadedListener();
	}


	//监听service和content页面发送过来的请求
	function popupListener(info) {
		if (info && info.name) {
			handlers[info.name](info);
		}
	}
	Wiz.Browser.addListener(Wiz.Constant.ListenType.POPUP, popupListener);
	

	PopupView.initPopupPage();
	// var clipPageControl = new ClipPageControl();
	var loginControl = new LoginControl();
	
	//保证popup页面和preview页面同时关闭
	// chrome.extension.connect({
	// 	name : 'popupClosed'
	// });

	wizPopupInitialize();
};