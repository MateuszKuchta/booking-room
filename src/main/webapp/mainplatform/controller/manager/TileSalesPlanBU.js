sap.ui.define([
	 "sap/ui/base/Object",
	 "sap/suite/ui/microchart/RadialMicroChart",
	 'ecu/lib/oDate',
	 'ecu/lib/QueryGenerator',
	 "ecu/controller/manager/SaleFormatter",
], function(Object,RadialMicroChart,oDate,QueryGenerator,SaleFormatter) {
	"use strict";
	return Object.extend("ecu.controller.manager.TileSalesPlanBU", {
		header:null,
		saleplan:null,
		actualsale:null,
		value:null,
		constructor : function(header,route,isDate,arg,destination,bu,isRegon){
			this.customTile = new sap.m.CustomTile();
			this.customTile.addStyleClass("myCustomTile");
			
			
			this.gt = new sap.m.GenericTile({
				press : function(){
					route.navTo(destination,{arg1:arg,arg2:bu});
				}
			});
			
			this.gt.setHeader(header);
			this.tileContent = new sap.m.TileContent();
			this.microChart = new RadialMicroChart();
			this.isDate = isDate;
			this.route = route;
			this.oData(this.header,this.value,this.gt,this.tileContent,this.microChart,isDate,arg,bu,isRegon);
			
		},
		query : function(isDate,arg,bu,isRegon){
			var odate = new oDate();
			var qg;
			switch (arg) {
			case "Yesterday":
				if (this.isDate) {
					qg = new QueryGenerator(odate.getDateFromNow(-1),
							odate.getDateFromNow(0), 0, true, null,
							null);
				} else if (bu === undefined) {
					qg = new QueryGenerator(odate.getDateFromNow(-1),
							odate.getDateFromNow(0), 0, false, null,
							null);
				} else {
					qg = new QueryGenerator(odate.getDateFromNow(-1),
							odate.getDateFromNow(0), 0, false,
							bu, null);
				}
				break;
			case "Week":
				if (isDate) {
					qg = new QueryGenerator(odate.getWeekBegin(), odate
							.getWeekEnd(), 1, true, null, null);
					console.info(qg.Where);
					console.info(qg.GroupBy);
					console.info(qg.OrderBy);
				} else if (bu === undefined) {
					qg = new QueryGenerator(odate.getWeekBegin(), odate
							.getDateFromNow(0), 1, false, null, null);
				} else {
					qg = new QueryGenerator(odate.getWeekBegin(), odate
							.getDateFromNow(0), 1, false,
							bu, null);
				}
				break;
			case "Month":
				console.info(   " isDate:" +isDate + " bu:" + bu + " reg:" + isRegon);
				if (isDate) {
					qg = new QueryGenerator(odate.getMonthBegin(),
							odate.getMonthEnd(), 2, true, null,
							null);
					
				} else if (bu !== undefined && isRegon === false) {
					qg = new QueryGenerator(odate.getMonthBegin(),
							odate.getMonthEnd(), 2, false, bu,
							isRegon);
				} else if (bu !== undefined && isRegon === true){
					qg = new QueryGenerator(odate.getMonthBegin(),
							odate.getMonthEnd(), 2, false,
							bu, isRegon);
				}
				break;
			case "Year":
				if (isDate) {
					qg = new QueryGenerator(odate.getYearBegin(),
							odate.getYearEnd(), 4, true, null,
							null);
					
				} else if (bu === undefined) {
					qg = new QueryGenerator(odate.getYearBegin(),
							odate.getYearEnd(), 4, false, null,
							null);
				} else {
					qg = new QueryGenerator(odate.getYearBegin(),
							odate.getYearEnd(), 4, false,
							bu, null);
				}
				break;
			}
			
			return qg;
		},
		oData : function(header,value,tile,tileContent,microChart,isDate,arg,bu,isRegion){
			console.info(isDate,arg,bu,isRegion);
			var queryGenerator = this.query(isDate,arg,bu,isRegion);
			var oDataURL = "/ecu-web/ODataService.svc";
			var oData = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: oDataURL
			});
			
			oData.read("/GetSales?",{
				urlParameters:{
					"Where":queryGenerator.Where,
					"GroupBy":queryGenerator.GroupBy,
					"OrderBy":queryGenerator.OrderBy
				},
				success : function (oData,response) {	
		            var color;
		            var f = new SaleFormatter();
		            
		            value = 100 / (oData.results[0].PlanSale/oData.results[0].ActualSale);
		            tile.setSubheader(oData.results[0].Name);		            
		            
		            tileContent.setFooter("P./A. " +
		            		f.format(oData.results[0].PlanSale) +
		            		"/" +
		            		f.format(oData.results[0].ActualSale));
		            microChart.setPercentage(Math.round(value));
		            if(value < 40){color = "Error";} 
					else if (value < 80){color = "Critical";}
					else if (value > 79) {color = "Good";}
					
		            microChart.setValueColor(color);
		            tileContent.setFooterColor(color);
		            },
		        error : function(oError){
		        	console.info(oError);
		        }
			});
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