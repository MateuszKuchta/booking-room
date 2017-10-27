sap.ui.define([
	 "sap/ui/base/Object",
    'ecu/lib/QueryGenerator',
    'ecu/lib/oDate',
	 'ecu/controller/manager/SaleFormatter',
	 'sap/suite/ui/microchart/ColumnMicroChart'
], function(Object,QueryGenerator,oDate,SaleFormatter,ColumnMicroChart) {
	"use strict";
	return Object.extend("ecu.controller.manager.reports.CirclesGenerator", {
		geoCircles : null,
		spots:null,
		legend:null,
		containers:null,
		Locations:null,
		constructor : function(Locations,gradation){
			
			this.spots = new sap.ui.vbm.Spots();
			
			this.Locations = Locations;
			
		},
		query : function(gradation,bu,region){
			var odate = new oDate();
			var qg;
			switch (gradation) {
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
					qg = new QueryGenerator(odate.getWeekBegin(), odate
							.getDateFromNow(0), 1, false,
							bu, true,region);
				
				break;
			case "Month":
				qg = new QueryGenerator(odate.getMonthBegin(),
						odate.getMonthEnd(), 2, false,
						bu, true,region);
				
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
		oData : function(goeCircles,spots,geoContainers,gradation,bu,region,oColor,lat,lon){
			var queryGenerator = this.query(gradation,bu,region);
			var f = new SaleFormatter();
			//console.info(queryGenerator.Where);
			
			var oDataURL = "/ecu-web/ODataService.svc";
			var oData = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: oDataURL
			});
			//console.info(queryGenerator.Where+"&"+queryGenerator.GroupBy+"&"+queryGenerator.OrderBy);
			oData.read("/GetSales?",{
				urlParameters:{
					"Where":queryGenerator.Where,
					"GroupBy":queryGenerator.GroupBy,
					"OrderBy":queryGenerator.OrderBy
				},
				success : function (oData,response) {	
					
					if (goeCircles !== null){
						spots.addItem(new sap.ui.vbm.Spot({
							text : f.format(oData.results[0].ActualSale)+" zł",
							position : lat + ";" + lon,
							contentColor:"rgb(0,0,0)",
							contentSize:"10",
							contentOffset:"0;30",
							icon:"sap-icon://activity-individual",
							type : "Success",
							tooltip :  bu + " - " +oData.results[0].Name
						}));

						goeCircles.addItem(new sap.ui.vbm.Circle({
			    			position : lat + ";" + lon,
			    			radius : parseInt(oData.results[0].ActualSale)/10000,
			    			color : oColor,
			    			colorBorder : "rgba(0,0,0,0.8)",
			    			
			    		}));
					} else {
						spots.addItem(new sap.ui.vbm.Spot({
	
							position : lat + ";" + lon,
							contentColor:"rgb(0,0,0)",
							contentSize:"10",
							contentOffset:"0;30",
							icon:"sap-icon://activity-individual",
							type : "Success",
							tooltip :  bu + " - " +oData.results[0].Name
						}));
						
						geoContainers.addItem(
								new sap.ui.vbm.Container({ 
					                position: lat + ";" + lon, 
					                alignment : "8",
					                defineClass : function(){
					                	return "mapContainer";}
					                	
								}).setItem(
					       //Container content          
					       new ColumnMicroChart({
					          size: "XS",
					          leftBottomLabel: 
					        	  new sap.suite.ui.microchart.ColumnMicroChartLabel({
					        		  label: "Plan"
					        	  }
				        	  ),
				        	  rightBottomLabel: 
					        	  new sap.suite.ui.microchart.ColumnMicroChartLabel({
					        		  label: "Actual"
					        	  }),
				        	  leftTopLabel: 
					        	  new sap.suite.ui.microchart.ColumnMicroChartLabel({
					        		  label: f.format(oData.results[0].PlanSale)
					        	  }
				        	  ),
				        	  rightTopLabel: 
					        	  new sap.suite.ui.microchart.ColumnMicroChartLabel({
					        		  label: f.format(oData.results[0].ActualSale)
					        	  }),
					          columns: [ 
					          new sap.suite.ui.microchart.ColumnMicroChartData({
					             value : parseInt(oData.results[0].PlanSale),
					             color: "Good",
					          }),
					          new sap.suite.ui.microchart.ColumnMicroChartData({
						             value : parseInt(oData.results[0].ActualSale),
						             color: "Critical",
						             label : "Actual Sale"
						          })]
					       })));
					}
					
	            },
		        error : function(oError){
		        	console.info(oError);
		        }
			});
		},
		getGeoCircles : function(){
			this.geoCircles = new sap.ui.vbm.Circles();
			var oLocations = this.Locations;
			
			
			for(var i = 0;i<oLocations.oData.location.length;i++){
				var oColor = oLocations.oData.location[i].color;
				var bu = oLocations.oData.location[i].bu;
				
				
				
				for(var j=0;j<oLocations.oData.location[i].regions.length;j++){
					this.oData(
							this.geoCircles,
							this.spots,
							null,
							"Month",
							bu,
							oLocations.oData.location[i].regions[j].reg,
							oColor,
							oLocations.oData.location[i].regions[j].lat,
							oLocations.oData.location[i].regions[j].lon);
				}
			}
			
			return this.geoCircles;
		},
		getSpots : function(){
			return this.spots;
		},
		getLegend : function(){
			var legend = new sap.ui.vbm.Legend();
			var oLocations = this.Locations;
			
			for(var i = 0;i<oLocations.oData.location.length;i++){
				var oColor = oLocations.oData.location[i].color;
				var bu = oLocations.oData.location[i].bu;
				
				legend.addItem(new sap.ui.vbm.LegendItem({
					color : oColor,
					text : bu,
					location : oLocations.oData.location[i].lon + ";"+ oLocations.oData.location[i].lan
				}));
				this.legend = legend;
			}
			return legend;
		},
		getColumn:function(){
			var containers = new sap.ui.vbm.Containers();
			var oLocations = this.Locations;
			//var test({ function(){console.info("click");}})
			
			
			for(var i = 0;i<oLocations.oData.location.length;i++){
				var oColor = oLocations.oData.location[i].color;
				var bu = oLocations.oData.location[i].bu;
				

				
				for(var j=0;j<oLocations.oData.location[i].regions.length;j++){
					this.oData(
							null,
							this.spots,
							containers,
							"Month",
							bu,
							oLocations.oData.location[i].regions[j].reg,
							oColor,
							oLocations.oData.location[i].regions[j].lat,
							oLocations.oData.location[i].regions[j].lon);
				}
			}
			
			return containers;
			
		},
		test : function(event){
			console.info(event.getSource());
		}
		
		
	});
});