sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel"
], function(UIComponent, JSONModel, ResourceModel) {
	"use strict";
	return UIComponent.extend("ecu.Component", {
		metadata: {
			manifest: "json"
		},

        init: function () {
            // call the init function of the parent
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(new sap.ui.model.json.JSONModel("model/Tree.json"),"Menu");

            
            // create the views based on the url/hash
            this.getRouter().initialize();
		},
		
		fullWidth: true
	});
});