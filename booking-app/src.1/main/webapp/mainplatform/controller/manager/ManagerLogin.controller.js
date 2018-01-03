sap.ui.define(
	[
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
	],
	function(Controller, JSONModel,MessageToast){
		"use strict";
		return Controller.extend("ecu.controller.manager.ManagerLogin", {
			
			onInit : function(){

			},
			login : function(){
				var login = this.getView().byId("_iLogin").getValue();
				var pass = this.getView().byId("_iPass").getValue();
				
				if (this.testAuthentication(login,pass)){
					this.naviToManagerPanel();
				} else {
					MessageToast.show("Brak dostępu");
				}
				

			},
			naviToManagerPanel: function(){
        		var oRoute = sap.ui.core.UIComponent.getRouterFor(this);
        		oRoute.navTo("managerPanel");
			},
			testAuthentication : function(login, pass){
				var auth;
				var oUser = {
					user: {
						login: "mstanowski",
						pass: "1234"
					}
				};
				var oModel = new JSONModel(oUser);
				this.getView().setModel(oModel);
				
				var uLogin = oModel.getProperty("/user/login");
				var uPass = oModel.getProperty("/user/pass");
				
				if (login === uLogin && pass === uPass){
					auth = true;
				} else {
					auth = false;
				}
				return auth;
			}
			
		});
	}, true);