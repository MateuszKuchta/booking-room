sap.ui.define([
	 "sap/ui/base/Object"
], function(Object) {
	"use strict";
	return Object.extend("ecu.lib.oDate", {
constructor: function() {
	//niewiem czy tu coś powinno być ??
	this.date = new Date();
	this.mili = this.date.getTime();
	this.year = this.date.getFullYear();
	this.month = this.date.getMonth()+1;
	this.day = this.date.getDate();
	this.dayOfWeek = this.date.getDay();
},
getCurrentDate : function(){
	this.constructor();
	
	return this.convertToString(this.year,this.month,this.day);
},
getDateFromNow : function (days){
	this.getCurrentDate();
	this.mili = this.mili + (days* 86400000);
	var date = new Date(this.mili);
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	
	return this.convertToString(year,month,day);
},
getWeekBegin : function(){
	this.constructor();
	var day = this.dayOfWeek;
	return this.getDateFromNow(-(day-1));
},
getMonthBegin : function(){
	this.constructor();
	return this.convertToString(this.year,this.month,"01");
},
convertToString : function(year,month,day){
	return year+"-"+month+"-"+day;
}


    });
});