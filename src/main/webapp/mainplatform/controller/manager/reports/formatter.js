sap.ui.define([], function () {
	"use strict";
	return {
		salesValue: function (value) {
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
	};
});