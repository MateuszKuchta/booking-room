sap.ui.define([
	'sap/ui/core/mvc/Controller',
    'ecu/lib/QueryGenerator',
    'ecu/lib/oDate',
    'ecu/controller/manager/TilesSPCreator'
], function (Controller,QueryGenerator,oDate,TilesSPCreator) {
	"use strict";
	var Controller = Controller.extend("ecu.controller.manager.reports.Tiles_2",{
		onInit : function(){
		    this.mTileContainer = new sap.m.TileContainer("tiles_2");
		    this.getView().byId("page").addContent(this.mTileContainer);
			
			this.getOwnerComponent().getRouter().getRoute("Tiles_2").attachPatternMatched(this._onRouteMatched, this);
			var i18nModel = new sap.ui.model.resource.ResourceModel({
		    	 bundleName: "ecu.i18n.i18n"
		     });
		    this.getView().setModel(i18nModel, "i18n");

		},
		_onRouteMatched: function(oEvent) {
		    
		    var arg = oEvent.getParameter("arguments");
		    console.info(arg);
		    var tspc = new TilesSPCreator(this.mTileContainer);
		    tspc.generate(false,arg);
		}
	});
});