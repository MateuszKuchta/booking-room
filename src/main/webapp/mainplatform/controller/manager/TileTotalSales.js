sap.ui.define([
	 "sap/ui/base/Object",
	 "sap/suite/ui/microchart/LineMicroChart",
	 'ecu/lib/oDate',
	 'ecu/lib/QueryGenerator',
	 "ecu/controller/manager/SaleFormatter",
], function(Object,LineMicroChart,oDate,QueryGenerator,SaleFormatter) {
	"use strict";
	return Object.extend("ecu.controller.manager.TileTotalSales", {
		header:null,
		saleplan:null,
		actualsale:null,
		value:null,
		constructor : function(header,route,isDate,arg,bu){
			this.customTile = new sap.m.CustomTile();
			this.customTile.addStyleClass("myCustomTile");
			this.gt = new sap.m.GenericTile({
				frameType:"OneByOne",
				press : function(){
					route.navTo("totalSales",{groupby:arg,chartType:0});
				}
			});
			this.gt.setHeader(header);
			this.tileContent = new sap.m.TileContent();
			this.microChart = new LineMicroChart({
				showPoints:true,
				size:"S"
			});
			this.isDate = isDate;
			this.route = route;
			this.oData(this.header,this.value,this.gt,this.tileContent,this.microChart,isDate,arg,bu);
			
		},
		query : function(isDate,arg,bu){
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
					getMonthGapStart
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
				if (isDate) {
					qg = new QueryGenerator(odate.getMonthGapStart(6),
							odate.getMonthGapStop(), 2, true, null,
							null);	
				} else if (bu === undefined) {
					qg = new QueryGenerator(odate.getMonthBegin(),
							odate.getMonthEnd(), 2, false, null,
							null);
				} else {
					qg = new QueryGenerator(odate.getMonthBegin(),
							odate.getMonthEnd(), 2, false,
							bu, null);
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
		oData : function(header,value,tile,tileContent,microChart,isDate,arg,bu){
			
			var queryGenerator = this.query(isDate,arg,bu);
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
		            var gap = -25;
		            console.info(oData.results.length);
		            console.info(queryGenerator.Where);
		            for (var i=0;i < oData.results.length;i++){
		            	gap = gap + 25;
		            	
		            	microChart.addPoint(
		            			new sap.suite.ui.microchart.LineMicroChartPoint({
		            				x:gap,
		            				y:parseInt(oData.results[i].ActualSale)
		            			}));
		            }
		            /*microChart.setLeftBottomLabel(queryGenerator.date_f);
		            microChart.setRightBottomLabel(queryGenerator.date_t);*/
		            
		            microChart.setLeftTopLabel(
		            		f.format(oData.results[0].ActualSale));
		            microChart.setRightTopLabel(
		            		f.format(oData.results[4].ActualSale));
		            
		            tileContent.setFooter(queryGenerator.date_f +
		            		"   :   " +
		            		queryGenerator.date_t);
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
		}
	});
});