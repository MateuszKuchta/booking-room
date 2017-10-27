sap.ui.define([
	 "sap/ui/base/Object",
	 "sap/suite/ui/microchart/ColumnMicroChart",
	 'ecu/lib/oDate',
	 'ecu/lib/QueryGenerator',
	 "ecu/controller/manager/SaleFormatter",
], function(Object,ColumnMicroChart,oDate,QueryGenerator,SaleFormatter) {
	"use strict";
	return Object.extend("ecu.controller.manager.TileColumnSales", {
		header:null,
		saleplan:null,
		actualsale:null,
		value:null,
		constructor : function(header,route,isDate,arg,bu){
			this.customTile = new sap.m.CustomTile();
			this.customTile.addStyleClass("myCustomTile");
			this.gt = new sap.m.GenericTile({
				press : function(){
					route.navTo("totalSales",{groupby:arg,chartType:1});
				}
			});
			this.gt.setHeader(header);
			this.tileContent = new sap.m.TileContent();
			this.microChart = new ColumnMicroChart({
				showPoints:true,
				size:"L"
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
					qg = new QueryGenerator(odate.getMonthGapStart(5),
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
		            for (var i=0;i < oData.results.length;i++){

		            	microChart.addColumn(
		            			new sap.suite.ui.microchart.ColumnMicroChartData({
		            				color:sap.m.ValueColor.Good,
		            				label:oData.results[i].Name,
		            				value:parseFloat(oData.results[i].ActualSale)
		            			}));
		            }
		            microChart.setLeftTopLabel(new sap.suite.ui.microchart.ColumnMicroChartLabel({
		            	label:f.format(oData.results[0].ActualSale)
		            }));
		            microChart.setRightTopLabel(new sap.suite.ui.microchart.ColumnMicroChartLabel({
		            	label:f.format(oData.results[3].ActualSale)
		            }));
		            tileContent.setFooter(queryGenerator.date_f +
		            		"  :  " +
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