sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/Fragment"
], function (BaseController, Fragment) {
    "use strict";
    return BaseController.extend("ecu.controller.Floor2", {
        onInit: function () {
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.handleRouteMatched, this);

            var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("floor1");
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data");
            }, this);

            var url = "/ecu-web/ODataService.svc/Employees?$format=json";
            var oModelJs = new sap.ui.model.json.JSONModel(url);
            this.getView().setModel(oModelJs, "searchFieldModel");
            this.oSF = this.getView().byId("searchField");
            window.it2=null;
        },

        handleRouteMatched: function () {
            var i = 0;
            if (window.sessionStorage.getItem('food')) {
                this.getView().byId("foodId").addStyleClass("pulse");
            }
            if (window.sessionStorage.getItem('onResizeMap') == "Up") {
                this.onResizeMapUp();
            } else if (window.sessionStorage.getItem('onResizeMap') == "Down") {
                this.onResizeMapDown();
            }
            window.sessionStorage.removeItem('food')
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
            if (!this._oPopoverFloor2) {
                this._oPopoverFloor2 = sap.ui.xmlfragment("popoverFloorButton2", "ecu.view.Popovers.PopoverFloorButton2", this);
                this.getView().addDependent(this._oPopoverFloor2);
            }

            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._oPopoverFloor2.openBy(oButton);
            });
        },

        onFloorUp: function () {
            this.getRouter().navTo("Floor3");
        },

        onFloorDown: function () {
            this.getRouter().navTo("Floor1");
        },

        //Zmiana rozmiaru dla wszystkich obrazków, skalując wartość największego z nich, tj. mapy
        onResizeMap: function () {
            if (this.getView().byId('mapId2').hasStyleClass("resizeMapDown")) {
                this.onResizeMapUp();
            } else if (this.getView().byId('mapId2').hasStyleClass("resizeMapUp")) {
                this.onResizeMapDown();
            }
        },

        onResizeMapUp: function () {
            window.setTimeout(resizeOffice, 500);
            sap.ui.core.BusyIndicator.show(200);
            window.it2 = this;

            function resizeOffice() {
                window.it2.byId('mapId2').removeStyleClass("resizeMapDown");
                window.it2.byId('mapId2').addStyleClass("resizeMapUp");
                window.it2.byId('foodId').removeStyleClass("foodResizeDown");
                window.it2.byId('foodId').addStyleClass("foodResizeUp");
                $(".foodResizeUp").css({
                    'height': 80 + 'px',
                    'top': 240 + 'px'
                });
                sap.ui.core.BusyIndicator.hide();
            }
            window.sessionStorage.setItem('onResizeMap', "Up");
        },
        onResizeMapDown: function () {
            var i = 0;
            window.setTimeout(resizeOffice, 500);
            sap.ui.core.BusyIndicator.show(200);
            window.it2 = this;

            function resizeOffice() {
                while (i++ < 2) {
                    if (window.it2.getView().byId('mapId2') != undefined) {
                        window.it2.getView().byId('mapId2').removeStyleClass("resizeMapUp");
                        window.it2.getView().byId('mapId2').addStyleClass("resizeMapDown");
                        window.it2.getView().byId('foodId').removeStyleClass("foodResizeUp");
                        window.it2.getView().byId('foodId').addStyleClass("foodResizeDown");

                        $(".foodResizeDown").css({
                            'height': ($(".floorImage2").height() * 75 / 1000 + 'px'),
                            'top': ($(".floorImage2").height() * 230 / 1000 + 'px')
                        });
                    }
                }
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
            if (defaultRoom[0] > 3)
                return;

            var url_room_details = "/ecu-web/ODataService.svc/Rooms(" + defaultRoom[0] + "L)?$format=json";
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_room_details), "roomOnSearch");

            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            window.it = this;
            oModel.read("/Rooms(" + defaultRoom[0] + "L)?", {
                success: function (oData, response) {

                    sessionStorage.setItem('searchFloor' + oData.Level, defaultRoom[0]);
                    if (oData.Level != 2)
                        window.it.getRouter().navTo("Floor" + oData.Level);
                }
            });

        },

        onSuggest: function (oEvent) {
            var value = oEvent.getParameter("suggestValue");
            var filters = [];
            if (value) {
                filters = [
                    new sap.ui.model.Filter([
                        new sap.ui.model.Filter("FirstName", function (sText) {
                            return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        }),
                        new sap.ui.model.Filter("SurName", function (sText) {
                            return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        }),
                        new sap.ui.model.Filter("DefaultRoomNumber", function (sText) {
                            return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        }),
                        new sap.ui.model.Filter("CurrentRoomNumber", function (sText) {
                            return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        })
                    ], false)
                ];
            }

            this.oSF.getBinding("suggestionItems").filter(filters);
            this.oSF.suggest();
        },

        onFoodPulsePress: function () {
            this.getView().byId("foodId").removeStyleClass("pulse");
        },

        onNavToMainPage: function() {
            this.getRouter().navTo("NewApp");
        },

        onDropDownToolbar: function () {
            var rejectBtn = this.getView().byId("toolbar2");
            if(rejectBtn.getVisible()) {
                rejectBtn.setVisible(false);
            } else {
                rejectBtn.setVisible(true);
            }

        }
    });
});