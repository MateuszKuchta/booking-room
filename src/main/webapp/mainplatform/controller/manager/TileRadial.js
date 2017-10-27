sap.ui.define([
	 "sap/ui/base/Object",
	 "sap/suite/ui/microchart/RadialMicroChart",
], function(Object,RadialMicroChart) {
	"use strict";
	return Object.extend("ecu.controller.manager.TileRadial", {
		header:null,
		subheader:null,
		footer:null,
		value:null,
		gt:null,
		oThis:null,
		gradation:null,
		isDate:null,
		nr:null,
		customTile:null,
		constructor : function(nr){
			this.customTile = new sap.m.CustomTile();
			this.customTile.addStyleClass("myCustomTile");
			this.gt = new sap.m.GenericTile();

		},
		setData: function(isDate,title,subtitle,footer,planSale,actualSale) {			
			this.header = title;
			this.subheader = subtitle;
			this.footer = footer;
			this.value = 100 / (planSale / actualSale);
			//this.gradation = gradation;
			this.isDate = isDate;
			
			
		},
		getTile : function (){
			this.gt.setHeader(this.header);
			this.gt.setSubheader(this.subheader);
			this.gt.addStyleClass("sapUiTinyMarginBegin sapUiTinyMarginTop tileLayout ");
			this.gt.addTileContent(this.microChart(this.value));
			
			this.customTile.setContent(this.gt);
			return this.customTile;
			//return this.gt;
		},
		microChart : function(value){
			var color;
			var tc = new sap.m.TileContent({
				unit : "%"
			});
			tc.setFooter(this.footer);
			var mcr = new RadialMicroChart();
			
			var v = value;
			
			
			mcr.setPercentage(Math.round(this.value));
			
			if(value < 40){color = "Error";} 
			else if (value < 80){color = "Critical";} 
			else if (value >= 80) {color = "Good";}
			
			mcr.setValueColor(color);
			tc.setFooterColor(color);
			
			tc.setContent(mcr);
			return tc;
		},
		attachPress : function(fAction){
			this.gt.attachPress(fAction);
		},
		setRoute : function(route){
			this.route = route;
		}
	});
});