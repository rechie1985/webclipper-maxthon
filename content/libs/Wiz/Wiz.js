if (typeof Wiz === 'undefined') {
	'use strict';
	var Wiz = {
		_maxthon = null
	};

	Wiz.getMaxthonAppRt = function () {
		if (!this._maxthon) {
			this._maxthon = new Wiz.Maxthon();
		}
		return this._maxthon;
	};
}