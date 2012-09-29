'use strict';
Wiz.Browser = {
	sendRequest : function(type, param) {
		Wiz.maxthon.post(type, param);
	},
	addListener: function(type, listenner) {
		Wiz.maxthon.listen(type, listenner);
	}
}