'use strict';
window.onload = function () {


	var clipPageControl = new ClipPageControl(),
		loginControl = new LoginControl(),
		handlers = {
			'loginError': loginErrorHandler,
			'loginSuccess': loginSuccessHandler,
			'PageClipFailure': showPageClipFailure,
			'initClipPage': clipPageControl.showClipPage,
			'responsePageInfo': clipPageControl.initSubmitGroup,
			'responseCategory': clipPageControl.parseWizCategory
		};

	var isLogin = false;			//由于遨游3的特殊行，必须加isLogin参数来判断是否已经登陆过

	function showPageClipFailure() {
		var pageClipFailure = Wiz.Message.get('pageClipFailure');
		PopupView.showClipFailure(pageClipFailure);
	}

	function loginErrorHandler(err) {
		PopupView.showLoginError(err.params);
	}

	function loginSuccessHandler(response) {
		if (isLogin === false) {
			isLogin = true;
			$('#loginoff_div').hide();
		}
		if (!localStorage[Wiz.Constant.AUTH_COOKIE] && keep_passoword.checked) {

			var userId = $('#user_id').val();
			var password = 'md5.' + hex_md5($('#password').val());
			if (!userId || !password) {
				return;
			}
			var value = $('#user_id').val() + '*' + 'md5.' + hex_md5($('#password').val());
			localStorage[Wiz.Constant.AUTH_COOKIE] = value;
		}
	}

	function showByCookies(cookies) {

		if (cookies) {
			//有cookie，则直接显示
			wizRequestPreview();
		} else {
			PopupView.showLogin();
		}
	}


	function tabLoadedListener() {
		var authStr = localStorage[Wiz.Constant.AUTH_COOKIE];
		showByCookies(authStr);
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

	function wizRequestPreview(op) {
		if (!op) {
			//默认为文章
			op = 'article';
		}
		try {
			Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {name : 'preview', op : op});
			console.log('service wizRequestPreview start');
		} catch (err) {
			console.log('service wizRequestPreview start Error: ' + err);
		}
	}

	Wiz.maxthon.onAppEvent = function (obj) {
		if (!obj.action) {
			return;
		}
		console.log(obj);
		var targetType = obj.action.type,
			actionType = obj.type;
		var authStr = localStorage[Wiz.Constant.AUTH_COOKIE];
		if ('panel' === targetType && 'ACTION_SHOW' === actionType && authStr) {
			wizRequestPreview();
		}
	}
};