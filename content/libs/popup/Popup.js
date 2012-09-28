// 'use strict';
var mainUrl = 'http://service.wiz.cn/web';
window.onload = function() {

	function showByCookies(cookies) {
		if (cookies) {
			var port = chrome.extension.connect({
				name : 'initRequest'
			});
			port.onMessage.addListener(function (msg) {
				if (msg.login == false) {
					loginControl.autoLogin(cookies);
				} else {
					$('#wiz_login').hide();
				}
				clipPageControl.setNativeStatus(msg.hasNative);
			});

		} else {
			PopupView.showLogin();
			
			loginControl.initCreateAccountLink();
		}
	}


	function tabLoadedListener() {
		Cookie.getCookies(cookieUrl, cookieName, showByCookies, true);
	}

	function wizPopupInitialize() {
		tabLoadedListener();
	}

	function initPopupPage() {
		$('#waiting-label').html(Wiz.Message.get('popup_wating'));

		//login page
		$('#user_id_tip').html(Wiz.Message.get('user_id_tip'));
		$('#password_tip').html(Wiz.Message.get('password_tip'));
		$('#keep_password_tip').html(Wiz.Message.get('keep_password_tip'));
		$('#login_button').html('&nbsp;' + Wiz.Message.get('login_msg') + '&nbsp;');

		//note info page
		$('#note_title_tip').html(Wiz.Message.get('note_title_tip'));
		$('#category_tip').html(Wiz.Message.get('category_tip'));
		// $('#tag_tip').html(Wiz.Message.get('tag_tip'));
		// $('#tag_input').html(Wiz.Message.get('tag_input'));
		//submit type
		$('#article').html(Wiz.Message.get('article_save'));
		$('#fullPage').html(Wiz.Message.get('fullpage_save'));
		$('#selection').html(Wiz.Message.get('select_save'));
		$('#url').html(Wiz.Message.get('url_save'));
		$('#native').html(Wiz.Message.get('save_more'));
		//comment area
		$('#comment_tip').html(Wiz.Message.get('comment_tip'));
		$('#comment-info').attr('placeholder', Wiz.Message.get('add_comment'));

		$('#save_to_native').html(Wiz.Message.get('save_to_native'));
		$('#save_to_server').html(Wiz.Message.get('save_to_server'));

		//默认文件夹
		$('#category_info').html('/' + Wiz.Message.get('MyNotes') + '/').attr('location', '/My Notes/');
	}

	initPopupPage();
	var clipPageControl = new ClipPageControl();
	var loginControl = new LoginControl();
	
	//保证popup页面和preview页面同时关闭
	// chrome.extension.connect({
	// 	name : 'popupClosed'
	// });

	wizPopupInitialize();
}