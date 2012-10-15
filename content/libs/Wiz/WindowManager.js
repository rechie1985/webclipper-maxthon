Wiz.WindowManager = (function () {
	var panelName = 'wiz_clipper_panel';			//修改def.json中action.panel.name时，要相应修改该值
	var action = Wiz.maxthon.getActionByName(panelName);
    return {
		close: function () {
		    action.hide();
		}
    }
})()