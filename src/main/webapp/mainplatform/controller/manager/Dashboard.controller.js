sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
   /* "./utilities", */
    "sap/ui/core/routing/History",
    'ecu/lib/QueryGenerator',
    'sap/viz/ui5/controls/common/feeds/FeedItem',
    'ecu/controller/manager/TileRadial',
    'ecu/lib/oDate',
    'sap/m/MessageToast'
    ], function(BaseController, MessageBox,/* Utilities, */ History,QueryGenerator,FeedItem,TileRadial,oDate,MessageToast,) {
    "use strict";
    return BaseController.extend("ecu.controller.manager.Dashboard", {
page : null,
view : null,
_onColumnChartSelectData: function (oEvent) {
            		
		var oSource = oEvent.getSource();
		
		return new Promise(function(fnResolve) {
		    var aSelectedDataPoints = oSource.getSelectedDataPoints().dataPoints;
		    var oBindingContext;
		    if (aSelectedDataPoints) {
		        oBindingContext = aSelectedDataPoints[aSelectedDataPoints.length - 1].context;
		    }
		
		    this.doNavigate("Page2", oBindingContext, fnResolve
		    );
		}.bind(this)).catch(function (err) { if (err !== undefined) { MessageBox.error(err.message); }});
		
        },
doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
            		
		var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
		var oModel = (oBindingContext) ? oBindingContext.getModel() : null;
		
		var sEntityNameSet;
		if (sPath !== null && sPath !== "") {
		    if (sPath.substring(0, 1) === "/") {
		        sPath = sPath.substring(1);
		    }
		    sEntityNameSet = sPath.split("(")[0];
		}
		var sNavigationPropertyName;
		var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;
		
		if (sEntityNameSet !== null) {
		    sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
		}
		if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
		    if (sNavigationPropertyName === "") {
		        this.oRouter.navTo(sRouteName, {
		            context: sPath,
		            masterContext: sMasterContext
		        }, false);
		    } else {
		        oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
		            if (bindingContext) {
		                sPath = bindingContext.getPath();
		                if (sPath.substring(0, 1) === "/") {
		                    sPath = sPath.substring(1);
		                }
		            }
		            else {
		                sPath = "undefined";
		            }
		
		            // If the navigation is a 1-n, sPath would be "undefined" as
					// this is not supported in Build
		            if (sPath === "undefined") {
		                this.oRouter.navTo(sRouteName);
		            } else {
		                this.oRouter.navTo(sRouteName, {
		                    context: sPath,
		                    masterContext: sMasterContext
		                }, false);
		            }
		        }.bind(this));
		    }
		} else {
		    this.oRouter.navTo(sRouteName);
		}
		
		if (typeof fnPromiseResolve === "function") {
		    fnPromiseResolve();
		}
        },
onInit: function () {
	
	this.getView().setModel(new sap.ui.model.json.JSONModel("model/Menu.json"));
	
	this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
    
	
		this.page = this.getView().byId("page");
		this.SPtiles();
		
},
handleRouteMatched: function () {
	this.view = this.getOwnerComponent().getRouter();
	sessionStorage.setItem('key', this.view);
},
readData: function (where,groupby,orderby){
		var view = this.getView();
		var oDataURL = "/ecu-web/ODataService.svc";
		var oModel = new sap.ui.model.json.JSONModel();
		var oData = new sap.ui.model.odata.v2.ODataModel({
			serviceUrl: oDataURL
		});
		oData.read("/GetSales?",{
			urlParameters:{
				"Where":where,
				"GroupBy":groupby,
				"OrderBy":orderby
			},
			success : function (oData,response) {	
                oModel.setData(oData);
                console.info(oData);
                },
            error : function(oError){
            	console.info(oError);
            },
            uniqIndex: function(oModel){
            	console.info(oModel);
            }
		});
		
		return oModel;
		},
initChart: function(date_f,date_t,gradation,isDate,businessUnit,region){
			
		var view = this.getView();		   	
		// generowanie zapytania
		var qg = new QueryGenerator(date_f,date_t,gradation,isDate,businessUnit,region);
		view.setModel(this.readData(qg.Where,qg.GroupBy,qg.OrderBy),"Data");	

		// wykres
		var oVizFrame = new sap.viz.ui5.controls.VizFrame({
            'width': '100%',
            'height': '180px',
            'uiConfig' : {
            'applicationSet': 'fiori'
            }
        });
		// oVizFrame.setModel(this.readData(qg.Where,qg.GroupBy,qg.OrderBy),"Data");
		var oDataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [{
                name: "xAxis",
                value: "{Name}"
            }],
            measures: [{
                name: "Plan Sale",
                value: '{PlanSale}'
            },
            {
            	name: "Actual Sale",
                value: '{ActualSale}'
            }
            ],
            data: {
                path: "Data>/results"
            }
        });
		
        oVizFrame.setDataset(oDataset);
        oVizFrame.setVizType("column");
        oVizFrame.setVizProperties(
        		{
                    timeAxis: {
           
                        title: {
                            visible: false
                        }
                    },
                    plotArea: {
                        window: {
                            start: "firstDataPoint",
                            end: "lastDataPoint"
                        }
                    },
                    valueAxis: {
                        title: {
                            visible: false
                        }
                    },
                    title: {
                        visible: false
                    },
                    legend: {
                        visible: false
                    }
                }
        );
		
		var oDateSimpleForm = this.getView().byId("vizChar");
		oDateSimpleForm.removeAllContent();
		var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			'uid' : "valueAxis",
			'type' : "Measure",
			'values' : ["Plan Sale","Actual Sale"]
        });
		var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
			'uid' : "categoryAxis",
			'type' : "Dimension",
			'values' : ["xAxis"]
        });
        oVizFrame.addFeed(feedValueAxis);
        oVizFrame.addFeed(feedCategoryAxis);
        oDateSimpleForm.addContent(oVizFrame);		
		},
SPtiles : function(){
	var odate = new oDate();
	var page = this.getView().byId("page");
	//zapytania dla kafelek
	var qg_yesterday = new QueryGenerator(odate.getDateFromNow(-1),odate.getDateFromNow(0),0,true,null,null);
	var qg_week = new QueryGenerator(odate.getWeekBegin(),odate.getDateFromNow(0),1,true,null,null);
	var qg_month = new QueryGenerator(odate.getMonthBegin(),odate.getDateFromNow(0),2,true,null,null);
	//pobieranie funkcji do wnętrza obiektu
	window.oThis = this;
	//kafelki
	var tile_yesterday = new TileRadial();
	var tile_week = new TileRadial();
	var tile_month = new TileRadial();
	
	this.dataRead("page",qg_yesterday,tile_yesterday,"Yesterday");
	this.dataRead("page",qg_week,tile_week,"Week");
	this.dataRead("page",qg_month,tile_month,"Month");
	

	},
oThis:null,
dataRead : function(idViewElemnt,queryGenerator,tile,tileTitle){
	var element = this.getView().byId(idViewElemnt);
	
	var oDataURL = "/ecu-web/ODataService.svc";
	var oData = new sap.ui.model.odata.v2.ODataModel({
		serviceUrl: oDataURL
	});
	window.oThis = this;
	
	console.info(tileTitle + ":" + queryGenerator.Where);
	oData.read("/GetSales?",{
		urlParameters:{
			"Where":queryGenerator.Where,
			"GroupBy":queryGenerator.GroupBy,
			"OrderBy":queryGenerator.OrderBy
		},
		success : function (oData,response) {	
            console.info(oData);
            
            tile.setData(false,tileTitle,"Sales Plan",oData.results[0].Name,oData.results[0].PlanSale,oData.results[0].ActualSale);
            tile.setRoute(window.oThis.getOwnerComponent().getRouter());
            tile.attachPress(function(){
            	tile.route.navTo("Tiles_1",{arg1:tileTitle});
            });
            element.addContent(tile.getTile());
            },
        error : function(oError){
        	console.info(oError);
        },
        uniqIndex: function(oModel){
        	console.info(oModel);
        }
        
	});

	},
	navToSettings : function(){
		this.getOwnerComponent().getRouter().navTo("dashboardSettings");
	},
	handleSelectionChange: function(oEvent) {
		var changedItem = oEvent.getParameter("changedItem");
		var isSelected = oEvent.getParameter("selected");

		var state = "Selected";
		if (!isSelected) {
			state = "Deselected";
		}

		MessageToast.show("Event 'selectionChange': " + state + " '" + changedItem.getText() + "'", {
			width: "auto"
		});
	},
	handleSelectionFinish: function(oEvent) {
		var selectedItems = oEvent.getParameter("selectedItems");
		var messageText = "Event 'selectionFinished': [";

		for (var i = 0; i < selectedItems.length; i++) {
			messageText += "'" + selectedItems[i].getText() + "'";
			if (i != selectedItems.length - 1) {
				messageText += ",";
			}
		}

		messageText += "]";

		MessageToast.show(messageText, {
			width: "auto"
		});
	}
	
});
}, /* bExport= */true);
