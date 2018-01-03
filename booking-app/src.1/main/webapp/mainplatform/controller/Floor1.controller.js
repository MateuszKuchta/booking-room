sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/Fragment"
], function (BaseController, Fragment) {
    "use strict";
    return BaseController.extend("ecu.controller.Floor1", {
        onInit: function () {


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
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
            window.it1 = null;

        },

        handleRouteMatched: function () {
            var i = 0;
            if (window.sessionStorage.getItem('onResizeMap') == "Up") {
                this.onResizeMapUp();
            } else if (window.sessionStorage.getItem('onResizeMap') == "Down") {
                this.onResizeMapDown();
            }

            for (i = 1; i <= 3; i++) {
                this.getView().byId("imageOffice1-" + i).removeStyleClass("greenImage");
                this.getView().byId("imageOffice1-" + i).removeStyleClass("redImage");
                this.getView().byId("imageOffice1-" + i).removeStyleClass("pulse");
            }

            if (window.sessionStorage.getItem('searchFloor1')) {
                this.getView().byId("imageOffice1-" + window.sessionStorage.getItem('searchFloor1')).addStyleClass("pulse");
            }
            window.sessionStorage.removeItem('searchFloor1');

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

        //Popover z kontrolką wyświetlającą możliwości zmiany rozmiaru mapy, zmiany piętra
        onImageNavButtonPress: function (oEvent) {
            if (!this._oPopoverFloor) {
                this._oPopoverFloor = sap.ui.xmlfragment("popoverFloorButton", "ecu.view.Popovers.PopoverFloorButton", this);
                this.getView().addDependent(this._oPopoverFloor);
            }

            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._oPopoverFloor.openBy(oButton);
            });
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
            var i = 0;
            window.setTimeout(resizeOffice, 500);
            sap.ui.core.BusyIndicator.show(200);

            window.it1 = this;

            function resizeOffice() {
                while (i++ < 2) {
                    if (window.it1.getView().byId('mapId') != undefined) {
                        window.it1.byId('mapId').removeStyleClass("resizeMapDown");
                        window.it1.byId('mapId').addStyleClass("resizeMapUp");
                        window.it1.byId('imageOffice1-1').removeStyleClass("officeResizeDown1-1");
                        window.it1.byId('imageOffice1-1').addStyleClass("officeResizeUp1-1");
                        window.it1.byId('imageOffice1-2').removeStyleClass("officeResizeDown1-2");
                        window.it1.byId('imageOffice1-2').addStyleClass("officeResizeUp1-2");
                        window.it1.byId('imageOffice1-3').removeStyleClass("officeResizeDown1-3");
                        window.it1.byId('imageOffice1-3').addStyleClass("officeResizeUp1-3");

                        $(".officeResizeUp1-1").css({
                            'height': 185 + 'px',
                            'top': 224 + 'px'
                        });

                        $(".officeResizeUp1-2").css({
                            'height': 93 + 'px',
                            'top': 224 + 'px'
                        });

                        $(".officeResizeUp1-3").css({
                            'height': 65 + 'px',
                            'top': 615 + 'px'
                        });
                    }
                    sap.ui.core.BusyIndicator.hide();
                }
                window.sessionStorage.setItem('onResizeMap', "Up");
            }
        },

        onResizeMapDown: function () {
            var i = 0;
            window.setTimeout(resizeOffice, 500);
            sap.ui.core.BusyIndicator.show(200);
            window.it1 = this;

            function resizeOffice() {
                while (i++ < 2) {
                    if (window.it1.getView().byId('mapId') != undefined) {
                        window.it1.getView().byId('mapId').removeStyleClass("resizeMapUp");
                        window.it1.getView().byId('mapId').addStyleClass("resizeMapDown");
                        window.it1.getView().byId('imageOffice1-1').removeStyleClass("officeResizeUp1-1");
                        window.it1.getView().byId('imageOffice1-1').addStyleClass("officeResizeDown1-1");
                        window.it1.getView().byId('imageOffice1-2').removeStyleClass("officeResizeUp1-2");
                        window.it1.getView().byId('imageOffice1-2').addStyleClass("officeResizeDown1-2");
                        window.it1.getView().byId('imageOffice1-3').removeStyleClass("officeResizeUp1-3");
                        window.it1.getView().byId('imageOffice1-3').addStyleClass("officeResizeDown1-3");
                        $(".officeResizeDown1-1").css({
                            'height': ($(".floorImage").height() * 182 / 1000 + 'px'),
                            'top': ($(".floorImage").height() * 218 / 1000 + 'px')
                        });

                        $(".officeResizeDown1-2").css({
                            'height': ($(".floorImage").height() * 91 / 1000 + 'px'),
                            'top': ($(".floorImage").height() * 218 / 1000 + 'px')
                        });

                        $(".officeResizeDown1-3").css({
                            'height': ($(".floorImage").height() * 63 / 1000 + 'px'),
                            'top': ($(".floorImage").height() * 603 / 1000 + 'px')
                        });
                    }
                }
                sap.ui.core.BusyIndicator.hide();
            }
            window.sessionStorage.setItem('onResizeMap', "Down");

        },

        onFloorUp: function () {
            this.getRouter().navTo("Floor2");
        },

        onFloorDown: function () {
            sap.m.MessageToast.show("No more floors");
        },

        readData: function (roomNumber) {

            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            var jsonModel = new sap.ui.model.json.JSONModel();
            var smth = "";

            oModel.read("/GetClosestReservation?", {
                urlParameters: {
                    "RoomNumber": roomNumber,
                },
                success: function (oData, response) {
                    smth = oData.ReservationTime;
                    jsonModel.setData(oData);
                }
            });

            oModel.attachRequestCompleted(function () {
                return jsonModel.oData.ReservationTime;
            });


        },

        view: null,
        onShowStatus: function (oEvent) {
            window.view = this.getView();
            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            var jsonModel = new sap.ui.model.json.JSONModel();
            var jsonStatusModel = new sap.ui.model.json.JSONModel();

            oModel.read("/GetClosestReservation?", {
                urlParameters: {
                    "RoomNumber": "1",
                },
                success: function (oData, response) {
                    jsonModel.setData(oData);
                    var reservationTime = jsonModel.oData.ReservationTime;
                    reservationTime = reservationTime.split(" - ");
                    var roomId = "imageOffice1-1";
                    addStyleColors(1, roomId, reservationTime[0], reservationTime[1]);
                }
            });

            oModel.read("/GetClosestReservation?", {
                urlParameters: {
                    "RoomNumber": "2",
                },
                success: function (oData, response) {
                    jsonModel.setData(oData);
                    var reservationTime = jsonModel.oData.ReservationTime;
                    reservationTime = reservationTime.split(" - ");
                    var roomId = "imageOffice1-2";
                    addStyleColors(2, roomId, reservationTime[0], reservationTime[1]);
                }
            });

            oModel.read("/GetClosestReservation?", {
                urlParameters: {
                    "RoomNumber": "3",
                },
                success: function (oData, response) {
                    jsonModel.setData(oData);
                    var reservationTime = jsonModel.oData.ReservationTime;
                    reservationTime = reservationTime.split(" - ");
                    var roomId = "imageOffice1-3";
                    addStyleColors(3, roomId, reservationTime[0], reservationTime[1]);
                }
            });

            function addStyleColors(model, roomId, reservationTime, reservationTimeSecond) {

                var actualTime = new Date().toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: "numeric",
                    minute: "numeric"
                });

                if (!window.view.byId(roomId).hasStyleClass("redImage") && !window.view.byId(roomId).hasStyleClass("greenImage")) {
                    if ((Date.parse('01/01/2011 ' + reservationTime + ':00') <= Date.parse('01/01/2011 ' + actualTime + ':00')) &&
                        (Date.parse('01/01/2011 ' + reservationTimeSecond + ':00') > Date.parse('01/01/2011 ' + actualTime + ':00'))) {
                        window.view.byId(roomId).addStyleClass("redImage");
                    } else if (Date.parse('01/01/2011 ' + reservationTime + ':00') > Date.parse('01/01/2011 ' + actualTime + ':00')) {
                        window.view.byId(roomId).addStyleClass("greenImage");
                    }
                } else {
                    window.view.byId(roomId).removeStyleClass("greenImage");
                    window.view.byId(roomId).removeStyleClass("redImage");
                }
            }

            var json = '{ "status" : [' +
                '{ "IsFree":" "}]}';
            var obj = JSON.parse(json);
            jsonStatusModel.setData(obj);

            if (window.view.byId("imageOffice1-1").hasStyleClass("greenImage") || window.view.byId("imageOffice1-1").hasStyleClass("redImage")) {
                jsonStatusModel.oData.status["0"].IsFree = "Show reservations";
            } else {
                jsonStatusModel.oData.status["0"].IsFree = "Hide reservations";
            }
            window.view.setModel(jsonStatusModel, "ActualReservationStatus");

        },
        this: null,
        onFreeOrBusyRoom: function (number) {
            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            var jsonModel = new sap.ui.model.json.JSONModel();

            window.this = this;
            oModel.read("/GetClosestReservation?", {
                urlParameters: {
                    "RoomNumber": number,
                },
                success: function (oData, response) {
                    var date = new Date();
                    var actual_time = date.getTime();

                    jsonModel.setData(oData);
                    var reservationTime = jsonModel.oData.ReservationTime;
                    reservationTime = reservationTime.split(" - ");

                    var start_hm = reservationTime[0].split(":");
                    var end_hm = reservationTime[1].split(":");
                    var start_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), start_hm[0], start_hm[1], date.getSeconds()).getTime();
                    var end_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), end_hm[0], end_hm[1], date.getSeconds()).getTime();

                    console.log(number);

                    var json = '{ "status" : [' +
                        '{ "IsFree":" "}]}';
                    var obj = JSON.parse(json);
                    jsonModel.setData(obj);
                    
                    if (start_time < actual_time && end_time > actual_time) {
                        jsonModel.oData.status["0"].IsFree = "In use";
                    } else {
                        jsonModel.oData.status["0"].IsFree = "Available";
                    }

                    window.this.getView().setModel(jsonModel, "ActualStatus");
                }
            });
        },

        //Popover z informacją o pokoju
        onImageOfficePress1: function (oEvent) {

            var url_room_details = "/ecu-web/ODataService.svc/Rooms(1L)?$format=json";
            var url_reservation_details = "/ecu-web/ODataService.svc/GetClosestReservation?RoomNumber=1&$format=json";

            this.getView().setModel(new sap.ui.model.json.JSONModel(url_room_details), "room1");
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_details), "reservation1");

            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            this.onFreeOrBusyRoom(1);
            oModel.read("/Rooms(1L)?", {
                success: function (oData, response) {
                    var roomName = oData.Name;
                }
            });

            if (!this._oPopoverRoom1_1) {
                this._oPopoverRoom1_1 = sap.ui.xmlfragment("popoverRoom1-1", "ecu.view.Popovers.Floor1.PopoverRoom1", this);
                this.getView().addDependent(this._oPopoverRoom1_1);
            }

            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._oPopoverRoom1_1.openBy(oButton);
            });
        },

        onImageOfficePress2: function (oEvent) {

            var url_room_details = "/ecu-web/ODataService.svc/Rooms(2L)?$format=json";
            var url_reservation_details = "/ecu-web/ODataService.svc/GetClosestReservation?RoomNumber=2&$format=json";

            this.getView().setModel(new sap.ui.model.json.JSONModel(url_room_details), "room2");
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_details), "reservation2");
            this.onFreeOrBusyRoom(2);
            if (!this._oPopoverRoom1_2) {
                this._oPopoverRoom1_2 = sap.ui.xmlfragment("popoverRoom1-2", "ecu.view.Popovers.Floor1.PopoverRoom2", this);
                this.getView().addDependent(this._oPopoverRoom1_2);
            }

            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._oPopoverRoom1_2.openBy(oButton);
            });
        },

        onImageOfficePress3: function (oEvent) {

            var url_room_details = "/ecu-web/ODataService.svc/Rooms(3L)?$format=json";
            var url_reservation_details = "/ecu-web/ODataService.svc/GetClosestReservation?RoomNumber=3&$format=json";

            this.getView().setModel(new sap.ui.model.json.JSONModel(url_room_details), "room3");
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_details), "reservation3");
            this.onFreeOrBusyRoom(3);
            if (!this._oPopoverRoom1_3) {
                this._oPopoverRoom1_3 = sap.ui.xmlfragment("popoverRoom1-3", "ecu.view.Popovers.Floor1.PopoverRoom3", this);
                this.getView().addDependent(this._oPopoverRoom1_3);
            }

            var oButton = oEvent.getSource();
            jQuery.sap.delayedCall(0, this, function () {
                this._oPopoverRoom1_3.openBy(oButton);
            });
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

            var level = "";
            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            window.it = this;
            oModel.read("/Rooms(" + defaultRoom[0] + "L)?", {
                success: function (oData, response) {

                    sessionStorage.setItem('searchFloor' + oData.Level, defaultRoom[0]);
                    if (oData.Level != 1)
                        window.it.getRouter().navTo("Floor" + oData.Level);
                }
            });

            var roomId = "imageOffice1-" + defaultRoom[0];
            this.getView().byId(roomId).addStyleClass("pulse");

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
                        new sap.ui.model.Filter("SurNames", function (sText) {
                            return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        }),
                        new sap.ui.model.Filter("DefaultRoomNumber", function (sText) {
                            return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        })
                        // new sap.ui.model.Filter("CurrentRoomNumber", function (sText) {
                        //     return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        // })
                    ], false)
                ];
            }

            this.oSF.getBinding("suggestionItems").filter(filters);
            this.oSF.suggest();
        },

        onReservePress1: function () {
            var oNavCon = sap.ui.core.Fragment.byId("popoverRoom1-1", "navRoom1-1");
            var oReserve = sap.ui.core.Fragment.byId("popoverRoom1-1", "roomDetail1");

            oNavCon.to(oReserve);
        },

        onReservePress2: function () {
            var oNavCon = sap.ui.core.Fragment.byId("popoverRoom1-2", "navRoom1-2");
            var oReserve = sap.ui.core.Fragment.byId("popoverRoom1-2", "roomDetail2");

            oNavCon.to(oReserve);
        },

        onReservePress3: function () {
            var oNavCon = sap.ui.core.Fragment.byId("popoverRoom1-3", "navRoom1-3");
            var oReserve = sap.ui.core.Fragment.byId("popoverRoom1-3", "roomDetail3");

            oNavCon.to(oReserve);
        },

        onAcceptRoomReservation: function (oEvent) {

            var data = oEvent.getSource().getText();
            data = data.split(" ");
            var room = data[3];

            var id = "popoverRoom1-" + room;

            var userId = "1";
            var date = sap.ui.core.Fragment.byId(id, "DTI1").getValue();
            var hourFrom = sap.ui.core.Fragment.byId(id, "DTI2").getValue();
            var hourTo = sap.ui.core.Fragment.byId(id, "DTI3").getValue();
            date = date.split(".");

            var dateToSendFrom = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourFrom + ":00";
            var dateToSendTo = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourTo + ":00";

            if (dateToSendFrom && dateToSendTo) {
                if (checkTime(date, hourFrom)) {
                    $.get({
                        url: "/ecu-web/ODataService.svc/BookRoom?RoomNumber=" + room + "&From=datetime'" + dateToSendFrom + "'&To=datetime'" + dateToSendTo + "'&EmployeeId=24",
                        success: function (response) {
                            if (response) {
                                sap.m.MessageToast.show("Added!");
                            }
                        },
                        error: function (response) {
                            sap.m.MessageToast.show("Error with connecting to the server");
                        }
                    });
                    if (this._oPopoverRoom1_1)
                        this._oPopoverRoom1_1.close();
                    else if (this._oPopoverRoom1_2)
                        this._oPopoverRoom1_2.close();
                    else if (this._oPopoverRoom1_3)
                        this._oPopoverRoom1_3.close();
                } else {
                    sap.m.MessageToast.show("Are u sure date is correct?");
                }
            } else {
                sap.m.MessageToast.show("All of inputs are valid?");
            }

        },

        onPopReservationBack1: function () {
            var oNavCon = sap.ui.core.Fragment.byId("popoverRoom1-1", "navRoom1-1");
            oNavCon.back();
        },

        onPopReservationBack2: function () {
            var oNavCon = sap.ui.core.Fragment.byId("popoverRoom1-2", "navRoom1-2");
            oNavCon.back();
        },

        onPopReservationBack3: function () {
            var oNavCon = sap.ui.core.Fragment.byId("popoverRoom1-3", "navRoom1-3");
            oNavCon.back();
        },

        onNavToMainPage: function () {
            this.getRouter().navTo("NewApp");
        },

        onDropDownToolbar: function () {
            var rejectBtn = this.getView().byId("toolbar");
            if (rejectBtn.getVisible()) {
                rejectBtn.setVisible(false);
            } else {
                rejectBtn.setVisible(true);
            }

        }
    });

    function checkTime(date, hourFrom) {
        var today = new Date();
        hourFrom = hourFrom.split(":");

        if (today.getFullYear() >= date[2] && today.getMonth() + 1 >= date[1] && today.getDate() >= date[0]) {
            if (date[0] == today.getDate()) {
                if (hourFrom[0] == today.getHours()) {
                    if (hourFrom[1] > today.getMinutes()) {
                        return true;
                    }
                } else if (hourFrom[0] > today.getHours()) {
                    return true
                }
            } else if (date[0] > today.getDate()) {
                return true;
            }
        }
        return false;
    }
});