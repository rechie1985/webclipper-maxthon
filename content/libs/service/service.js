var Wiz_Context = {
	xmlUrl : 'http://service.wiz.cn/wizkm/xmlrpc',
	cookieUrl : 'http://service.wiz.cn/web',
	cookieName : 'wiz-clip-auth',
	cookie_category: 'wiz-all-category',
	cookie_category_time: 'wiz-category-stored-time',
	category_expireSec:  10 * 60,
	token : null,
	tab : null,
	user_id : null,
	isLogin: false
}

function onConnectListener(port) {
	console.log(port);
	var name = port.name;
	if (!name) {
		return;
	}
	switch (name) {
	case 'login':
		loginAjax(port.params);
		break;
	case 'retryClip':
		break;
	case 'requestCategory':
		break;
	case 'saveDocument':
		break;
	case 'checkLogin':
		break;
	case 'onkeydown':
		break;
	case 'requestToken':
		break;
	case 'logout':
		break;
 	}
}

function loginByCookies(cookie) {
	if (!cookie) {
		return;
	}
	var info = cookie;
	var split_count = info.indexOf('*md5');
	var loginParam = {};
	loginParam.client_type = 'web3';
	loginParam.api_version = 3;
	loginParam.user_id = info.substring(0, split_count);
	loginParam.password = info.substring(split_count + 1);
	loginAjax(loginParam);
}

function loginAjax(loginParam) {
	var loginError = function(err) {
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {'name': 'loginError', 'params': err});
	}
	var loginSuccess = function(responseJSON) {
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {'name': 'loginSuccess', 'params': responseJSON, 'hasNative': hasNativeClient()});
		wizRequestPreview();
		Wiz_Context.isLogin = true;
	}
	//缓存userid
	Wiz_Context.user_id = loginParam.user_id;
	console.log('login');
	xmlrpc(Wiz_Context.xmlUrl, 'accounts.clientLogin', [loginParam], loginSuccess, loginError);
}

function requestCategory(port) {
	var nativeCategoryStr = getNativeCagetory(Wiz_Context.user_id),
		localCategoryStr = getLocalCategory(),
		categoryStr = (nativeCategoryStr) ? (nativeCategoryStr) : (localCategoryStr);

	if (port) {
		//本地如果为获取到文件夹信息，则获取服务端的文件夹信息
		if (categoryStr) {
			port.postMessage(categoryStr);
		} else {
			portRequestCategoryAjax(port);
		}
	}
}

function getLocalCategory() {
	var localCategoryStr = localStorage[Wiz_Context.cookie_category],
		storedTimeStr = localStorage[Wiz_Context.cookie_category_time],
		storedTime = Date.parse(storedTimeStr),
		nowTime = new Date(),
		isOverTime = ((nowTime - storedTime) / 1000 >= Wiz_Context.category_expireSec);//是否过期
	if (isOverTime || !localCategoryStr || localCategoryStr.length < 1) {
		return "";
	} else {
		return localCategoryStr;
	}
}

//把服务端获取到的目录信息存放在localStorage中
//如果存放到cookie中，则会造成cookie过大，无法通过nginx
//保存时，需要记录当前保存的时间，下次取出的时候进行比较
//如果超出默认的时间，则自动清空，重新获取
function setLocalCategory(value) {
	var storedTime = (new Date()).toString();
	localStorage[Wiz_Context.cookie_category] = value;
	localStorage[Wiz_Context.cookie_category_time] = storedTime;
}

function getNativeCagetory(userid) {
	var client = getNativeClient(),
		categoryStr = null;
	if (client) {
		try {
			categoryStr = client.GetAllFolders(userid);
		} catch (err) {
		}
	}
	return categoryStr;
}

function portRequestCategoryAjax(port) {
	var params = {
		client_type : 'web3',
		api_version : 3,
		token : Wiz_Context.token
	};
	var callbackSuccess = function(responseJSON) {
		var categoryStr = responseJSON.categories;
		setLocalCategory(categoryStr);
		if (port) {
			port.postMessage(categoryStr);
		}
	}
	var callbackError = function(response) {
		if (port) {
			port.postMessage(false);
		}
	}
	xmlrpc(Wiz_Context.xmlUrl, 'category.getAll', [params], callbackSuccess, callbackError);
}

function bindKeyDownHandler(direction) {
	Wiz.Browser.sendRequest(Wiz.Constant.ListenType.CONTENT, {
		name : 'preview',
		op : 'keydown',
		opCmd : direction
	});
}

function wizPostDocument(docInfo) {
	//整理数据
	var regexp = /%20/g, 
		  title = docInfo.title, 
		  category = docInfo.category, 
		  comment = docInfo.comment, 
		  body = docInfo.params;
		  
	if (comment && comment.trim() != '') {
		body = comment + '<hr>' + body;
	}
	
	if (!category) {
		category = '/My Notes/';
	}
	
	var requestData = 'title=' + encodeURIComponent(title).replace(regexp,  '+') + '&token_guid=' + encodeURIComponent(Wiz_Context.token).replace(regexp,  '+') 
						+ '&body=' + encodeURIComponent(body).replace(regexp,  '+') + '&category=' + encodeURIComponent(category).replace(regexp,  '+');

	//发送给当前tab消息，显示剪辑结果					
	Wiz.Browser.sendRequest(Wiz_Context.tab.id, {name: 'sync', info: docInfo});
	
	var callbackSuccess = function(response) {
		var json = JSON.parse(response);
		if (json.return_code != 200) {
			console.error('sendError : ' + json.return_message);
			docInfo.errorMsg = json.return_message;
			
			Wiz.Browser.sendRequest(Wiz_Context.tab.id, {name: 'error' , info: docInfo});
			return;
		}
		console.log('success : saveDocument');
		
		Wiz.Browser.sendRequest(Wiz_Context.tab.id, {name: 'saved' , info: docInfo});
	}
	
	var callbackError = function(response) {
		var errorJSON = JSON.parse(response);
		docInfo.errorMsg = json.return_message;

		Wiz.Browser.sendRequest(Wiz_Context.tab.id, {name: 'error' , info: docInfo});

		console.error('callback error : ' + json.return_message);
	}
	console.log('post document info');
	$.ajax({
		type : 'POST',
		url : 'http://service.wiz.cn/wizkm/a/web/post?',
		data : requestData,
		success : callbackSuccess,
		error : callbackError
	});
}

function wizRequestPreview(op) {
	if (!op) {
		//默认为文章
		op = 'article';
	}
	try {
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.SERVICE, {name : 'preview', op : op});
		console.log('service wizRequestPreview start');
	} catch (err) {
		console.log('service wizRequestPreview start Error: ' + err);
	}
}

var authenticationErrorMsg = Wiz.Message.get('AuthenticationFailure');
function isLogin() {
	// if (Wiz_Context.token === null) {
	// 	alert(authenticationErrorMsg);
	// 	return false;
	// } else {
		return true;
	// }
}

/**
 * 获取本地客户端信息
 * @return {[本地客户端]} []
 */
function getNativeClient () {
	try {
		var nativeClient = document.getElementById('wiz-local-app'),
			version = nativeClient.Version;
		if (typeof version === 'undefined') {
			return null;
		}
		return nativeClient;
	} catch(err) {
		console.log('background.getNativeClient() Error : ' + err);
		return null;
	}
}

function hasNativeClient() {
	var nativeClient = getNativeClient();
	return (nativeClient === null) ? false : true;
}

function saveToNative(info) {
	var wizClient = this.getNativeClient();
	try {
		wizClient.Execute(info.params);
	} catch (err) {
		console.warn('background saveToNative Error : ' + err);
	}
	console.log('Saved To Native Client');
}

function wizSaveNativeContextMenuClick(info, tab) {
	Wiz_Context.tab = tab;
	var wizClient = this.getNativeClient();
	Wiz.Browser.sendRequest(tab.id, {
		name: 'preview',
		op: 'submit',
		info : { url: tab.url },
		type: 'native'
	});
}

function wizSavePageContextMenuClick(info, tab) {
	Wiz_Context.tab = tab;
	if (isLogin()) {
		info.title = tab.title;
		Wiz.Browser.sendRequest(tab.id, {
			name : 'preview',
			op : 'submit',
			info : info,
			type : 'fullPage'
		}, sendTabRequestCallbackByContextMenu);
	}
}

Wiz.Browser.addListener(Wiz.Constant.ListenType.SERVICE, onConnectListener);

//通过监听appEvent来向当前页面和popup发送消息
Wiz.maxthon.onAppEvent = function (obj) {
	if (!obj.action) {
		return;
	}
	var targetType = obj.action.type,
		actionType = obj.type;
	if ('panel' === targetType && 'ACTION_SHOW' === actionType && Wiz_Context.isLogin) {
		wizRequestPreview();
		Wiz.Browser.sendRequest(Wiz.Constant.ListenType.POPUP, {name: 'initClipPage', hasNative: hasNativeClient()});
	}
}