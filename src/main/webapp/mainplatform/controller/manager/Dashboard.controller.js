sap.ui.define(["ecu/controller/BaseController",
    'ecu/controller/manager/TileSalesPlan',
    'ecu/controller/manager/TileSalesPlanBU',
    'ecu/controller/manager/TileTotalSales',
    'ecu/controller/manager/TileColumnSales',
    ], function(BaseController,TileSalesPlan,TileSalesPlanBU,TileTotalSales,TileColumnSales) {
    "use strict";
    return BaseController.extend("ecu.controller.manager.Dashboard", {
page : null,
view : null,
onInit: function () {
	//przycisk powrotu : mechanizm 
	var oRouter, oTarget;
    oRouter = this.getRouter();
    oTarget = oRouter.getTarget("dashboard"); //wskazać stronę w routingu
    oTarget.attachDisplay(function (oEvent) {
        this._oData = oEvent.getParameter("data");
    }, this);
	//przycisk powrotu
	
	this.getView().setModel(new sap.ui.model.json.JSONModel("model/Menu.json"));
	this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
},
//przycisk powrotu : akcja
onNavBack: function (oEvent) {
    var oHistory, sPreviousHash, oRouter;
    if (this._oData && this._oData.fromTarget) {
        this.getRouter().getTargets().display(this._oData.fromTarget);
        delete this._oData.fromTarget;
        return;
    }
    BaseController.prototype.onNavBack.apply(this, arguments);
},
handleRouteMatched: function () {
	this.handleSelectionFinish();
	var model = this.getOwnerComponent().getModel("Menu");
	console.info(model);
},
navToSettings : function(){
	this.getOwnerComponent().getRouter().navTo("dashboardSettings");
},
handleSelectionFinish: function(oEvent) {
	var selectedItems ;
	var mTileContainer = this.getView().byId("tileContener");
	mTileContainer.destroyTiles();
	
	if (oEvent === undefined){
		var multiCombo = this.getView().byId("multiCombo");
		selectedItems = multiCombo.getSelectedItems();
	} else {
		selectedItems = oEvent.getParameter("selectedItems");
	}
	
	for (var i = 0; i < selectedItems.length; i++) {
		if (selectedItems.length !== 0) {
			switch (selectedItems[i].getKey()){
			case "spyesterday":
				mTileContainer.addTile(new TileSalesPlan(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Yesterday",
						false).getTile());
				break;
			case "spweek":
				mTileContainer.addTile(new TileSalesPlan(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Week",
						false).getTile());
				break;
			case "spmonth":
				mTileContainer.addTile(new TileSalesPlan(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Month",
						false).getTile());
				break;
			case "spyear":
				mTileContainer.addTile(new TileSalesPlan(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Year",
						false).getTile());
				break;
			case "spmonthbu":
				mTileContainer.addTile(new TileSalesPlan(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Month",
						true).getTile());
				break;
			case "spmonthbm":
				mTileContainer.addTile(new TileSalesPlan(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Month",
						true,
						undefined,
						true).getTile());
				break;
			case "tsmonth":
				mTileContainer.addTile(new TileTotalSales(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Month").getTile());
				break;
			case "tsmonthb":
				mTileContainer.addTile(new TileColumnSales(
						selectedItems[i].getText(),
						this.getOwnerComponent().getRouter(),
						true,
						"Month").getTile());
				break;
			
			}
		
					
		}
	}
}});
}, /* bExport= */true);
