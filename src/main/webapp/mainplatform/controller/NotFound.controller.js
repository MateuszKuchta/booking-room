sap.ui.define([
	"ecu/controller/BaseController"
], function (BaseController) {
	"use strict";
	return BaseController.extend("ecu.controller.NotFound", {
		onInit: function () {
			var oRouter, oTarget;
			oRouter = this.getRouter();
			oTarget = oRouter.getTarget("notFound");
			oTarget.attachDisplay(function (oEvent) {
				this._oData = oEvent.getParameter("data");
			}, this);
		},

		onNavBack : function (oEvent){
			var oHistory, sPreviousHash, oRouter;
			if (this._oData && this._oData.fromTarget) {
				this.getRouter().getTargets().display(this._oData.fromTarget);
				delete this._oData.fromTarget;
				return;
			}
			BaseController.prototype.onNavBack.apply(this, arguments);
		}
	});
});