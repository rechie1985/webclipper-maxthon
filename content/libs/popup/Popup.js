'use strict';
window.onload = function () {


	var clipPageControl = new ClipPageControl(),
		loginControl = new LoginControl(),
		handlers = {
			'loginError': loginErrorHandler,
			'loginSuccess': clipPageControl.showClipPage,//loginSuccessHandler,
			'contentVeilShow': clipPageControl.showClipPage,
			'PageClipFailure': showPageClipFailure
		};

	function showPageClipFailure() {
		var pageClipFailure = Wiz.Message.get('pageClipFailure');
		PopupView.showClipFailure(pageClipFailure);
	}

	function loginErrorHandler(err) {
		PopupView.showLoginError(err.params);
	}

	function loginSuccessHandler(response) {
		if (keep_passoword.checked) {
			$('#loginoff_div').hide();
			var value = $('#user_id').val() + '*' + $('#password').val();
		}
		console.log('Popup loginSuccessHandler sendRequest');
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
	
	//保证popup页面和preview页面同时关闭
	// chrome.extension.connect({
	// 	name : 'popupClosed'
	// });

	wizPopupInitialize();
};