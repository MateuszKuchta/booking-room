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
getWeekEnd : function(){
	this.constructor();
	var toEnd = 6 - this.dayOfWeek;
	return this.getDateFromNow(toEnd); 
},
getMonthBegin : function(){
	this.constructor();
	return this.convertToString(this.year,this.month,"01");
},
getMonthEnd : function(){
	this.constructor();
	var date = new Date(this.year,this.month,0);
	return this.convertToString(date.getFullYear(),date.getMonth()+1,date.getDate());
},
getMonthGapStart : function (month){
	this.constructor();
	var check = this.month - month;
	var date;
	if(check < 0){
		date = new Date(this.year-1,12+check,1);
	} else {
		date = new Date(this.year,check,1);
	}
	return this.convertToString(date.getFullYear(),date.getMonth()+1,date.getDate());
},
getMonthGapStop : function (){
	this.constructor();
	var check = this.month - 1;
	var date;
	if(check < 0){
		date = new Date(this.year-1,12,1);
	} else {
		date = new Date(this.year,check,0);
	}
	return this.convertToString(date.getFullYear(),date.getMonth()+1,date.getDate());
},
getYearBegin : function(){
	this.constructor();
	return this.convertToString(this.year,"01","01");
},
getYearEnd : function(){
	this.constructor();
	return this.convertToString(this.year,"12","31");
},
convertToString : function(year,month,day){
	return year+"-"+month+"-"+day;
}


    });
});