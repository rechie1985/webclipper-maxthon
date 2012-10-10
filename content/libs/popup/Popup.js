'use strict';
window.onload = function () {


	var clipPageControl = new ClipPageControl(),
		loginControl = new LoginControl(),
		handlers = {
			'loginError': loginErrorHandler,
			'loginSuccess': loginSuccessHandler,
			'contentVeilShow': clipPageControl.showClipPage,
			'PageClipFailure': showPageClipFailure,
			'initClipPage': clipPageControl.showClipPage
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
			localStorage[Wiz.Constant.AUTH_COOKIE] = JSON.stringify({'auth': value, 'date': new Date()});
		}
	}

	function showByCookies(cookies) {

		if (cookies) {
			// Wiz.Browser.sendRequest(Wiz.Constant.ListenType.SERVICE, {'name': 'initRequest'});
				// clipPageControl.setNativeStatus(msg.hasNative);\
			//如果cookie有值，则直接显示剪辑页面
			clipPageControl.showClipPage();
		} else {
			PopupView.showLogin();
		}
	}


	function tabLoadedListener() {
		var a = localStorage[Wiz.Constant.AUTH_COOKIE];
		

		showByCookies(a.auth);
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