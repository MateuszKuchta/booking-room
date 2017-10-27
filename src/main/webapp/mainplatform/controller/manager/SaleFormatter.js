sap.ui.define(["sap/ui/core/mvc/Controller"],
	function (Controller) {
		"use strict";
 
	return Controller.extend("ecu.controller.manager.SaleFormatter", {
		format: function(value,pattern) {
			var ivalue = parseFloat(value);
			var tran;
			if (ivalue > 999 && ivalue < 1000000){
				tran = ivalue/1000;
				return tran.toFixed(1).toString() + "K";
			}
			if (ivalue > 999999 && ivalue < 1000000000){
				tran = ivalue/1000000;
				return tran.toFixed(1).toString() + "M";
			}
		}
	});
});