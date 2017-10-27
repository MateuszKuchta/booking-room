sap.ui.define([
	"ecu/controller/BaseController"
], function (BaseController) {
	"use strict";
	return BaseController.extend("ecu.controller.manager.DashboardSettings",{
		onInit: function() {
			
			var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("salesPlane"); //wskazać stronę w routingu
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data");
            }, this);
            var menuList = this.getView().byId("ItemsST");
			// set explored app's demo model on this sample
			//this.getView().setModel(new sap.ui.model.json.JSONModel("model/Tree.json"),"Dupa");
			var model = this.getOwnerComponent().getModel("Menu");
			console.info(model);
			menuList.setModel(model);
			menuList.setListBindingPath("Menu>/menu");
			var oTree = this.getView().byId("ItemsST").getList();
			oTree.setMode("MultiSelect");
            
            /*var oTree = this.getView().byId("ItemsST").getList();
			//oTree.setMode("MultiSelect");
			oTree.attachEvent("evn",function(){
				console.info("Klik");
			});*/
		},
        onNavBack: function (oEvent) {
            var oHistory, sPreviousHash, oRouter;
            if (this._oData && this._oData.fromTarget) {
                this.getRouter().getTargets().display(this._oData.fromTarget);
                delete this._oData.fromTarget;
                return;
            }
            BaseController.prototype.onNavBack.apply(this, arguments);
        },
		onSelect: function(){
			console.info("Klik");
		}
	});
});
