sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function (Controller) {
	"use strict";
	var Controller = Controller.extend("ecu.controller.manager.DashboardSettings",{
		onInit: function() {
			// set explored app's demo model on this sample
			this.getView().setModel(new sap.ui.model.json.JSONModel("model/Tree.json"));
			var oTree = this.getView().byId("ItemsST").getList();
			oTree.setMode("MultiSelect");
			oTree.attachEvent("evn",function(){
				console.info("Klik");
			})
		},
		onSelect: function(){
			console.info("Klik");
		}
	});
});
