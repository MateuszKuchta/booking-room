sap.ui.define(
	[
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	'ecu/lib/Salesplan'
	],
	function(Controller,JSONModel,MessageToast,Salesplan){
		"use strict";
		return Controller.extend("ecu.controller.manager.ManagerPanel", {
			onInit:function(){
				
				//etykiety (dla tłumaczeń)
		         var i18nModel = new sap.ui.model.resource.ResourceModel({
		        	 bundleName: "ecu.i18n.i18n"
		         });
		         this.getView().setModel(i18nModel, "i18n");
		         var oLabels = this.getView().getModel("i18n");
		         var tPlane = oLabels.getProperty("plan");
		         var tFor = oLabels.getProperty("for");
				
				//inicjowanie elementów widoku
				var dayGT = this.getView().byId("dailyPlan");
				var dayNC = this.getView().byId("dailyPlanValue");
				var targetValue = this.getView().byId("targetValue");
				var actualValue = this.getView().byId("actualValue");
				var goodValue = this.getView().byId("goodValue");
				var criticalValue = this.getView().byId("criticalValue");
				var quarterPlan = this.getView().byId("quarterPlan");
				
				//dane z oDaty narazie na konkretny dzień
				/*TODO: odświeżanie danych z oDaty*/
				var oDataURL = "/ecu-web/ODataService.svc";
				var uPlan = new sap.ui.model.json.JSONModel();
				var oDayPlan = new sap.ui.model.odata.v2.ODataModel({
					serviceUrl: oDataURL
				});

				//dane dla kafelka dzienny plan sprzedaży
				var datenow = "2017-09-09";
				oDayPlan.read("/GetSales?",{
					urlParameters:{
						"Where" : "'s.day ='"+datenow+"''",
						"GroupBy" : "'s.day'",
						"OrderBy" : "'s.day'"
					},
					success : function (oData,response) {
	                    var planSale = parseInt(oData.results["0"].PlanSale);
	                    var actualSale = parseInt(oData.results["0"].ActualSale);
	                    var done = 100 / (planSale/actualSale);
	                    
	                    dayGT.setSubheader(tPlane + parseInt(oData.results["0"].PlanSale) + " zł");
	                    dayNC.setValue(done);
	                    (done < 90) ? dayNC.setValueColor("Critical") : dayNC.setValueColor("Good");
	                    
	                },
	                error : function(oError){
	                	console.info("Error");
	                }
				});
				
				this.getView().setModel(mDayPlan,"DayPlan");
				this.getView().setModel(uPlan,"Plan");
				
				//dane dla kafelka aktualny kwartał
				var date = new Date();
				var firstDay = this.convertDate(new Date(date.getFullYear(), date.getMonth()+1, 1));
				var lastDay = this.convertDate(new Date(date.getFullYear(), date.getMonth() + 2, 1));
				
				var mQuarterPlan = new sap.ui.model.json.JSONModel();
				var oQuarterPlan = new sap.ui.model.odata.v2.ODataModel({
					serviceUrl: oDataURL
				});
				var mDayPlan = new sap.ui.model.json.JSONModel();
				oQuarterPlan.read("/GetSales?",{
					urlParameters:{
						"Where" : "'s.date BETWEEN '"+firstDay+"' AND '"+lastDay+"''",
						"GroupBy" : "'s.quarter'",
						"OrderBy" : "'s.quarter'"
					},
					success : function (oData,response) {
						var i = oData.results.length;
						var quarterSalePlan = parseInt(oData.results[i-1].PlanSale);
						var quarterActualSale = parseInt(oData.results[i-1].ActualSale);
						var quarterName = oData.results[i-1].Name.split("-");
						console.info(oData.results[i-1].Name);
						
						quarterPlan.setSubheader(tFor + " Q: " +quarterName[1]);
						targetValue.setTargetValue(quarterSalePlan);
						goodValue.setValue(quarterSalePlan);
						actualValue.setValue(quarterActualSale);
						criticalValue.setValue(quarterSalePlan * 0.9);
	                },
	                error : function(oError){
	                	console.info("Error");
	                }
				});
			

			},
			naviToSalesPlane: function(oEvent){
        		var rGroupBy = oEvent.getParameter("id");
				//var oRoute = sap.ui.core.UIComponent.getRouterFor(this);
				this.getOwnerComponent().getRouter().navTo("salesPlane",{groupby:rGroupBy});
			},
	   		convertDate:function(date){
	   			var year = date.getFullYear();
				var month = date.getMonth();
				var day = date.getDate();
				
				return year+"-"+month+"-"+day;
	   		}
			
        });
	}
);