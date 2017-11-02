sap.ui.define([
	'sap/ui/core/mvc/Controller',
    'ecu/lib/QueryGenerator',
    'ecu/lib/oDate',
    'ecu/controller/manager/TilesSPCreator'
], function (Controller,QueryGenerator,oDate,TilesSPCreator) {
	"use strict";
	var Controller = Controller.extend("ecu.controller.manager.reports.Tiles_1",{
		onInit : function(){
		    this.mTileContainer = new sap.m.TileContainer("tiles");
		    this.getView().byId("page").addContent(this.mTileContainer);
			
			this.getOwnerComponent().getRouter().getRoute("Tiles_1").attachPatternMatched(this._onRouteMatched, this);
			var i18nModel = new sap.ui.model.resource.ResourceModel({
		    	 bundleName: "ecu.i18n.i18n"
		     });
		    this.getView().setModel(i18nModel, "i18n");

		},
		_onRouteMatched: function(oEvent) {
		    //console.info(oEvent);
		    var args = oEvent.getParameter("arguments");
		    var tspc = new TilesSPCreator(this.mTileContainer,this.getOwnerComponent().getRouter());
		    tspc.generate(false,args);
		}
	});
});