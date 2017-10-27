sap.ui.define([
	"ecu/controller/BaseController",
    'ecu/lib/QueryGenerator',
    'ecu/lib/oDate',
    'ecu/controller/manager/TileSalesBUR'
], function (BaseController,QueryGenerator,oDate,TileSalesPlanBUR) {
	"use strict";
	return BaseController.extend("ecu.controller.manager.reports.Tiles_2",{
		onInit : function(){
			
			var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("Tiles_2"); //wskazać stronę w routingu
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data");
            }, this);
			
			this.getOwnerComponent().getRouter().getRoute("Tiles_2").attachPatternMatched(this._onRouteMatched, this);
			var i18nModel = new sap.ui.model.resource.ResourceModel({
		    	 bundleName: "ecu.i18n.i18n"
		     });
		    this.getView().setModel(i18nModel, "i18n");

		},
        onNavBack: function (oEvent) {
            var oHistory, sPreviousHash, oRouter;
            if (this._oData && this._oData.fromTarget) {
                this.getRouter().getTargets().display(this._oData.fromTarget);
                delete this._oData.fromTarget;
                return;
            }
            BaseController.prototype.onNavBack.apply(this, arguments);
        },
		_onRouteMatched: function(oEvent) {
			var tilesContener = this.getView().byId("tileContener");
			tilesContener.destroyTiles();
			
			var args = oEvent.getParameter("arguments");
		    //var args = oEvent.getParameter("arguments");
	
		    this.oData(tilesContener,
		    		this.getOwnerComponent().getRouter(),
		    		false,
		    		args.arg1,
		    		args.arg2,
		    		true);
		    
		},
		query : function(isDate,arg,bu,isRegion){
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
					qg = new QueryGenerator(odate.getMonthBegin(),
							odate.getMonthEnd(), 2, true, null,
							null);
					
				} else {
					qg = new QueryGenerator(odate.getMonthBegin(),
							odate.getMonthEnd(), 2, false,
							bu, isRegion);
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
		oData : function(tilesContener,route,isDate,arg,bu,isRegion){
			var queryGenerator = this.query(isDate,arg,bu,isRegion);
			var oDataURL = "/ecu-web/ODataService.svc";
			var oData = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: oDataURL
			});
			console.info(queryGenerator.Where+"&"+queryGenerator.GroupBy+"&"+queryGenerator.OrderBy);
			oData.read("/GetSales?",{
				urlParameters:{
					"Where":queryGenerator.Where,
					"GroupBy":queryGenerator.GroupBy,
					"OrderBy":queryGenerator.OrderBy
				},
				success : function (oData,response) {	
		            for(var i=0;i<oData.results.length;i++){
		            	console.info(oData.results);
		            	tilesContener.addTile(
		            			new TileSalesPlanBUR(
		            					oData.results[i].Name,
		            					arg,
		            					oData.results[i].PlanSale,
		            					oData.results[i].ActualSale,
		            					route,
		            					undefined,
		        						"Month",
		        						bu).getTile()	
			            			);
		            }
	            },
		        error : function(oError){
		        	console.info(oError);
		        }
			});
		}
	});
});