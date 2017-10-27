sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/Fragment"
], function (BaseController, Fragment) {
    "use strict";
    return BaseController.extend("ecu.controller.Floor3", {
        onInit: function () {
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.handleRouteMatched, this);

            var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("floor3");
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data");
            }, this);

            var url = "/ecu-web/ODataService.svc/Employees?$format=json";
            var oModelJs = new sap.ui.model.json.JSONModel(url);
            this.getView().setModel(oModelJs, "searchFieldModel");
            this.oSF = this.getView().byId("searchField");
            window.it3 = this;
        },

        handleRouteMatched: function () {
            var i = 0;
            if (window.sessionStorage.getItem('onResizeMap') == "Up") {
                this.onResizeMapUp();
            } else if (window.sessionStorage.getItem('onResizeMap') == "Down") {
                this.onResizeMapDown();
            }

            var jsonStatusModel = new sap.ui.model.json.JSONModel();
            var json = '{ "status" : [' +
                '{ "IsFree":"Show reservations"}]}';
            var obj = JSON.parse(json);
            jsonStatusModel.setData(obj);

            this.getView().setModel(jsonStatusModel, "ActualReservationStatus");
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

        onImageNavButtonPress: function (oEvent) {
            if (!this._oPopoverFloor3) {
                this._oPopoverFloor3 = sap.ui.xmlfragment("popoverFloorButton3", "ecu.view.Popovers.PopoverFloorButton3", this);
                this.getView().addDependent(this._oPopoverFloor3);
            }

            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._oPopoverFloor3.openBy(oButton);
            });
        },

        onFloorUp: function () {
            sap.m.MessageToast.show("No more floors");
        },

        onFloorDown: function () {
            this.getRouter().navTo("Floor2");
        },

        //Zmiana rozmiaru dla wszystkich obrazków, skalując wartość największego z nich, tj. mapy
        onResizeMap: function () {
            if (this.getView().byId('mapId').hasStyleClass("resizeMapDown")) {
                this.onResizeMapUp();
            } else if (this.getView().byId('mapId').hasStyleClass("resizeMapUp")) {
                this.onResizeMapDown();
            }
        },

        onResizeMapUp: function () {
            window.setTimeout(resizeOffice, 500);
            sap.ui.core.BusyIndicator.show(200);
            window.it3 = this;

            function resizeOffice() {
                window.it3.byId('mapId').removeStyleClass("resizeMapDown");
                window.it3.byId('mapId').addStyleClass("resizeMapUp");
                sap.ui.core.BusyIndicator.hide();
            }
            window.sessionStorage.setItem('onResizeMap', "Up");
        },

        onResizeMapDown: function () {
            window.setTimeout(resizeOffice, 500);
            sap.ui.core.BusyIndicator.show(200);
            window.it3 = this;

            function resizeOffice() {
                window.it3.byId('mapId').removeStyleClass("resizeMapUp");
                window.it3.byId('mapId').addStyleClass("resizeMapDown");
                sap.ui.core.BusyIndicator.hide();
            }
            window.sessionStorage.setItem('onResizeMap', "Down");
        },

        it: null,
        onSearch: function (oEvent) {
            var item = oEvent.getSource().getValue();
            if (item == "") {
                var i = 1;
                for (i = 1; i < 4; i++)
                    this.getView().byId("imageOffice1-" + i).removeStyleClass("pulse");
                return;
            }

            var defaultRoom = item.split(" | ");
            if (defaultRoom[1] > 3)
                return;

            var url_room_details = "/ecu-web/ODataService.svc/Rooms(" + defaultRoom[1] + "L)?$format=json";
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_room_details), "roomOnSearch");

            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            window.it = this;
            oModel.read("/Rooms(" + defaultRoom[1] + "L)?", {
                success: function (oData, response) {

                    sessionStorage.setItem('searchFloor' + oData.Level, defaultRoom[1]);
                    if (oData.Level != 3)
                        window.it.getRouter().navTo("Floor" + oData.Level);
                }
            });

        },

        onNavToMainPage: function() {
            this.getRouter().navTo("NewApp");
        },

        onDropDownToolbar: function () {
            var rejectBtn = this.getView().byId("toolbar3");
            if(rejectBtn.getVisible()) {
                rejectBtn.setVisible(false);
            } else {
                rejectBtn.setVisible(true);
            }

        }
    });
});

