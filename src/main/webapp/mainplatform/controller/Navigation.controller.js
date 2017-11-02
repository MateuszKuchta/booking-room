sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/Fragment"
], function (BaseController, Fragment) {
    "use strict";
    return BaseController.extend("ecu.controller.Navigation", {
        onInit: function () {
            var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("navigation");
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data"); 
            }, this);
            
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

        onImagePress: function(oEvent) {
            // TODO
            // var url = "/ecu-web/ODataService.svc/GetSuppliersFromLast30Minutes?$format=json";
			// var oModelJs = new sap.ui.model.json.JSONModel(url);
			// this.getView().setModel(oModelJs, "roomInfo");

            // create popover
			if (!this._oPopoverImage) {
				this._oPopoverImage = sap.ui.xmlfragment("popoverNavConImage", "ecu.view.Popovers.PopoverImage", this);
				this.getView().addDependent(this._oPopoverImage);
			}
			
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopoverImage.openBy(oButton);
			});
        },

        onReservePress: function() {
            var oNavCon = sap.ui.core.Fragment.byId("popoverNavConImage", "navConImage");
			var oReserve = sap.ui.core.Fragment.byId("popoverNavConImage", "reserve");

			oNavCon.to(oReserve);
        },

        onFreeMeetingRooms: function() {

        },

        onPopNavBack: function (oEvent) {
			var oNavCon = sap.ui.core.Fragment.byId("popoverNavConImage", "navConImage");
			oNavCon.back();
        },
        
        //Rezerwacja z wykorzystaniem mapy
        onAcceptRoomReservation: function(oEvent) {
            this.getView().byId('imageOffice1-2').addStyleClass("redImage");
            this._oPopoverImage.close();
            var user = sap.ui.core.Fragment.byId("popoverNavConImage", "userData").getValue();
            var date = sap.ui.core.Fragment.byId("popoverNavConImage", "DTI1").getValue();
            var hourFrom = sap.ui.core.Fragment.byId("popoverNavConImage", "DTI2").getValue();
            var hourTo = sap.ui.core.Fragment.byId("popoverNavConImage", "DTI3").getValue();
            date = date.split(".");

            var dateToSendFrom = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourFrom + ":00Z";
            var dateToSendTo = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourTo + ":00Z";
            console.log(dateToSendFrom);
            console.log(dateToSendFrom);
        },

        onNavigationSystemPress: function(oEvent) {
            if (!this._oPopoverNavStart) {
				this._oPopoverNavStart = sap.ui.xmlfragment("popoverNavConNavStart", "ecu.view.Popovers.PopoverStartNavigation", this);
				this.getView().addDependent(this._oPopoverNavStart);
			}
			
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopoverNavStart.openBy(oButton);
            });
        },

        onNavigationStarted: function() {
            this.getView().byId('navigation1-1').addStyleClass("greenNav");
            this.getView().byId('navigation1-2').addStyleClass("greenNav");
            this.getView().byId('navigation1-3').addStyleClass("greenNav");
            this.getView().byId('navigation1-4').addStyleClass("greenNav");
            this.getView().byId('navigation1-5').addStyleClass("greenNav");
            this.getView().byId('navigation1-6').addStyleClass("greenNav");
            this.getView().byId('navigation1-8').addStyleClass("greenNav");
            this.getView().byId('navigation1-9').addStyleClass("greenNav");
            this.getView().byId('navigation1-10').addStyleClass("greenNav");
        },

        onImageNavButtonPress: function(oEvent) {
            if (!this._oPopoverFloor2) {
				this._oPopoverFloor2 = sap.ui.xmlfragment("popoverFloorButton2", "ecu.view.Popovers.PopoverFloorButton2", this);
				this.getView().addDependent(this._oPopoverFloor2);
			}

			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopoverFloor2.openBy(oButton);
			});
        },

        onFloorUp: function() {
            this.getRouter().navTo("Floor1");
        },

        onFloorDown: function() {
            sap.m.MessageToast.show("Brak pięter niżej");
        }
    });
});