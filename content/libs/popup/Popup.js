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


	function showPageClipFailure() {
		var pageClipFailure = Wiz.Message.get('pageClipFailure');
		PopupView.showClipFailure(pageClipFailure);
	}

	function loginErrorHandler(err) {
		PopupView.showLoginError(err.params);
	}

	function loginSuccessHandler(response) {
		PopupView.showLoginDiv();
		if (!localStorage[Wiz.Constant.AUTH_COOKIE]) {

			var userId = $('#user_id').val();
			var password = 'md5.' + hex_md5($('#password').val());
			if (!userId || !password) {
				return;
			}
			var value = userId + '*' + 'md5.' + hex_md5(password);
			localStorage['wiz-clip-auth'] = userId;
			localStorage[Wiz.Constant.AUTH_COOKIE] = value;
		}

		//剪辑页面是否显示，如果未显示，需要显示
		//处理手动点击登陆按钮
		if (isClipPageVisibel()) {
			
		}
	}


	function isClipPageVisibel() {
		var visible = $('#wiz_clip_detail').is(':visible');
		return visible;
	}

	function showByCookies(cookies) {

		if (cookies) {
			//有cookie，则直接显示
			wizRequestPreview();
			clipPageControl.showClipPage();
		} else {
			PopupView.showLogin();
		}
	}


	function tabLoadedListener() {
		var authStr = localStorage[Wiz.Constant.AUTH_COOKIE];
		showByCookies(authStr);
	}

	function wizPopupInitialize() {
		console.log('Popup wizPopupInitialize()');
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
	
	//只有在浏览器打开后，初次点击触发panel事件时，会触发
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
		var state = Wiz.WindowManager.getState();
		console.log('state: ' + state);
		if ('panel' === targetType && 'ACTION_SHOW' === actionType && authStr && 'active' === state) {
			//TODO 应该判断当前页面是否已经加载完成，如果未加载完成，需要循环调用（增加超时时间）
			wizRequestPreview();
		}
	}
	//监听 onBrowserEvent来处理当前页面的信息,主要获取页面是否加载完成，以便显示剪辑信息
	Wiz.maxthon.browser.onBrowserEvent = function( obj ){
		console.log('Wiz.maxthon.browser.onBrowserEvent');
		console.log(obj);
	}
};