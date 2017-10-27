sap.ui.define([
	 "sap/ui/base/Object",
	 "sap/suite/ui/microchart/RadialMicroChart",
	 'ecu/lib/oDate',
	 'ecu/lib/QueryGenerator',
	 "ecu/controller/manager/SaleFormatter",
	 "ecu/controller/manager/reports/Locations",
], function(Object,RadialMicroChart,oDate,QueryGenerator,SaleFormatter,Locations) {
	"use strict";
	return Object.extend("ecu.controller.manager.reports.MapRadial", {
		header:null,
		saleplan:null,
		actualsale:null,
		value:null,
		geoContainers:null,
		constructor : function(zoom){
			var containers = new sap.ui.vbm.Containers();
			var oLocations = new Locations();
			var queryGenerator,odate,bu ;
			this.geoContainers =  new sap.ui.vbm.Containers();
			var geoMap = this;
			var oDataURL = "/ecu-web/ODataService.svc";
			var mOdata = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: oDataURL
			});
			
			
			if(zoom<9){
				for(var i = 0;i<oLocations.oData.location.length;i++){
					this.oDataReader(
							mOdata,
							this.geoContainers,
							oLocations.oData.location[i].lat,
							oLocations.oData.location[i].lon,
							oLocations.oData.location[i].bu
							);
				}
			} else {
				for(var i = 0;i<oLocations.oData.location.length;i++){
					//var bu = oLocations.oData.location[i].bu;
					for(var j=0;j<oLocations.oData.location[i].regions.length;j++){
						this.oDataReader(
								mOdata,
								this.geoContainers,
								oLocations.oData.location[i].regions[j].lat,
								oLocations.oData.location[i].regions[j].lon,
								oLocations.oData.location[i].bu,
								oLocations.oData.location[i].regions[j].reg
								);
					}
				}
			}
			
			
		},
		oDataReader : function(mOdata,geoContainers,lat,lon,bu,reg){
			var odate,queryGenerator;
			
			if(reg === undefined){
				odate = new oDate();
				queryGenerator = new QueryGenerator(odate.getMonthBegin(),
						odate.getMonthEnd(), 2, false,
						bu, false,null);
				mOdata.read("/GetSales?",{
					urlParameters:{
						"Where":queryGenerator.Where,
						"GroupBy":queryGenerator.GroupBy,
						"OrderBy":queryGenerator.OrderBy
					},
					success : function (oData,response) {	
						var value,oColor,total;
						
						switch(oData.results[0].Name){
						case "B4":
							value = 81;
							total = Math.round(360 / (100/value));
							break;
						case "B5":
							value = 83;
							total = Math.round(360 / (100/value));
							break;
						case "B3":
							value = 39;
							total = Math.round(360 / (100/value));
							break;
						case "B7":
							value = 67;
							total = Math.round(360 / (100/value));
							break;
						case "B1":
							value = 36;
							total = Math.round(360 / (100/value));
							break;
						default:
							value = Math.round(100 / (oData.results[0].PlanSale/oData.results[0].ActualSale));
							if(value > 100){value = 100;}
							total = Math.round(360 / (oData.results[0].PlanSale/oData.results[0].ActualSale));
							if(total > 360){total = 360;}
							
							break;
						}
						
						
						if(value < 40){oColor = "Error";} 
							else if (value < 80){oColor = "Critical";}
							else if (value >= 80) {oColor = "Good";}
						console.info(value,total,oColor);
						
						geoContainers.addItem(
								new sap.ui.vbm.Container({ 
					                position: lat+";"+ lon,
					                alignment : "1"
								}).setItem(
					       //Container content          
					       new RadialMicroChart({
					          size: "L",
					          percentage: value,
					          valueColor : oColor,
					          total: total
					       })));
						
						geoContainers.addItem(
								new sap.ui.vbm.Container({ 
					                position: lat+";"+ lon,
					                alignment : "5"
								}).setItem(
					       //Container content          
					       new sap.m.Text({
					          rows:1,
					          maxLength:3,
					          text:oData.results[0].Name
					       }).addStyleClass("mRadialLabel")));

		            },
			        error : function(oError){
			        	console.info(oError);
			        }
				});
				//this.addVo(geoContainers);
			}else {
				odate = new oDate();
				queryGenerator = new QueryGenerator(odate.getMonthBegin(),
						odate.getMonthEnd(), 2, false,
						bu, true,reg);
				mOdata.read("/GetSales?",{
					urlParameters:{
						"Where":queryGenerator.Where,
						"GroupBy":queryGenerator.GroupBy,
						"OrderBy":queryGenerator.OrderBy
					},
					success : function (oData,response) {	
						var value,oColor,total;
						
						switch(oData.results[0].Name){
						case "C1":
							value = 92;
							total = Math.round(360 / (100/value));
							break;
						case "C2":
							value = 53;
							total = Math.round(360 / (100/value));
							break;
						case "C3":
							value = 30;
							total = Math.round(360 / (100/value));
							break;
						default:
							value = Math.round(100 / (oData.results[0].PlanSale/oData.results[0].ActualSale));
							if(value > 100){value = 100;}
							total = Math.round(360 / (oData.results[0].PlanSale/oData.results[0].ActualSale));
							if(total > 360){total = 360;}
							
							break;
						}
						
						
						if(value < 40){oColor = "Error";} 
						else if (value < 80){oColor = "Critical";}
						else if (value > 79) {oColor = "Good";}
						//console.info(value,total,oColor);
						
						geoContainers.addItem(
								new sap.ui.vbm.Container({ 
					                position: lat+";"+ lon,
					                alignment : "1"
								}).setItem(
					       //Container content          
					       new RadialMicroChart({
					          size: "L",
					          percentage: value,
					          valueColor : oColor,
					          total: total
					       })));
						
						geoContainers.addItem(
								new sap.ui.vbm.Container({ 
					                position: lat+";"+ lon,
					                alignment : "5"
								}).setItem(
					       //Container content          
					       new sap.m.Text({
					          rows:1,
					          maxLength:3,
					          text:bu + " : "+oData.results[0].Name,
					       }).addStyleClass("mRadialLabel")));
		            },
			        error : function(oError){
			        	console.info(oError);
			        }
				});
			}
		},
		getGeoContainers : function(){
			return this.geoContainers;
		}
		
	});
});