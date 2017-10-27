sap.ui.define([
	 "sap/ui/base/Object",
	 "sap/suite/ui/microchart/RadialMicroChart",
	 'ecu/lib/oDate',
	 'ecu/lib/QueryGenerator',
	 "ecu/controller/manager/SaleFormatter",
], function(Object,RadialMicroChart,oDate,QueryGenerator,SaleFormatter) {
	"use strict";
	return Object.extend("ecu.controller.manager.TileSalesPlanBUR", {
		header:null,
		saleplan:null,
		actualsale:null,
		value:null,
		constructor : function(header,subheader,planeSales,actualSales,route,destination,arg,bu){
			this.customTile = new sap.m.CustomTile();
			this.customTile.addStyleClass("myCustomTile");
			
			if (destination !== undefined){
				this.gt = new sap.m.GenericTile({
					press : function(){
						route.navTo(destination,{arg1:arg,arg2:bu});
					}
				});
			} else {
				this.gt = new sap.m.GenericTile({
					press : function(){
						route.navTo("map",{bu:bu});
					}
				});
			}
			
			
			this.gt.setHeader(header);
			this.tileContent = new sap.m.TileContent();
			this.microChart = new RadialMicroChart();
			
			this.setData(this.gt,this.microChart,this.tileContent,planeSales,actualSales,subheader);
		},
		setData : function(tile,microChart,tileContent,planeSale,actualSale,subheader){
			var color;
            var f = new SaleFormatter();
            console.info(planeSale,actualSale);
            var value = 100 / (planeSale/actualSale);
            tile.setSubheader(subheader);		            
            
            tileContent.setFooter("P./A. " +
            		f.format(planeSale) +
            		"/" +
            		f.format(actualSale));
            microChart.setPercentage(Math.round(value));
            if(value < 60){color = "Error";} 
			else if (value < 70){color = "Critical";}
			else if (value >= 70) {color = "Good";}
			
            microChart.setValueColor(color);
            tileContent.setFooterColor(color);
            
		},
		setChart : function(tileContent,microChart){
			
			tileContent.setContent(microChart);
			return tileContent;
		},
		getTile : function (){
			this.gt.addTileContent(this.setChart(this.tileContent,this.microChart));
			this.customTile.setContent(this.gt);
			return this.customTile;
		},
		lastOne : function(){
			
		}
	});
});