sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/Fragment"
], function (BaseController, Fragment) {
    "use strict";
    return BaseController.extend("ecu.controller.RoomDetails", {
        thisRD: null,
        onInit: function () {
            // this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            // this._oRouter.attachRouteMatched(this.handleRouteMatched, this);

            var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("roomDetails");
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data");
            }, this);

            this.updateStatus();
            var oLabel = this.getView().byId("oClock");
            var result = this.GetClock();

            oLabel.setText(result);
            var that = this;
            setInterval(function () {
                var result = that.GetClock();
                oLabel.setText(result);
            }, 1000);
            this.getView().byId("quickReservationHBox").setVisible(false);
            this.getView().setModel(new sap.ui.model.json.JSONModel("/room-reservation/users"), "reservationDetailsPeople");
        },

        GetClock: function () {
            var tday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
            var d = new Date();
            var nhour = d.getHours(),
                nday = d.getDay(),
                nmin = d.getMinutes(),
                nsec = d.getSeconds();

            if (nmin <= 9) nmin = "0" + nmin;
            if (nsec <= 9) nsec = "0" + nsec;
            var result = tday[nday] + ", " + nhour + ":" + nmin + ":" + nsec + "";

            if (nsec == "00") {
                this.updateStatus();
            }

            return result;
        },

        addReservationText: function (data) {
            var jsonModel = new sap.ui.model.json.JSONModel();
            var jsonMainHeader = new sap.ui.model.json.JSONModel();

            if (data != "0") {
                var json = { 
                    "value": [{
                        "subject": {},
                        "reservationTime": {},
                        "attendees": []
                    }]
                };

                for (var i = 0; i < data.value.length; i++) {
                    //var start = new Date(data.value[i].start.dateTime).getTime();
                    var start_dt_apple = data.value[i].start.dateTime.split("T");
                    var start_date_apple = start_dt_apple[0].split("-");
                    var start_time_apple = start_dt_apple[1].split(":");
                    var start = new Date(start_date_apple[0], (start_date_apple[1] - 1), start_date_apple[2], start_time_apple[0], start_time_apple[1], "00", "00").getTime();

                    //var end = new Date(data.value[i].end.dateTime).getTime();
                    var end_dt_apple = data.value[i].end.dateTime.split("T");
                    var end_date_apple = end_dt_apple[0].split("-");
                    var end_time_apple = end_dt_apple[1].split(":");
                    var end = new Date(end_date_apple[0], (end_date_apple[1] - 1), end_date_apple[2], end_time_apple[0], end_time_apple[1], "00", "00").getTime();

                    var nhour_start = new Date(start).getHours(),
                        nmin_start = new Date(start).getMinutes(),
                        nhour_end = new Date(end).getHours(),
                        nmin_end = new Date(end).getMinutes();
                    if (nhour_start <= 9) nhour_start = "0" + nhour_start;
                    if (nmin_start <= 9) nmin_start = "0" + nmin_start;
                    if (nhour_end <= 9) nhour_end = "0" + nhour_end;
                    if (nmin_end <= 9) nmin_end = "0" + nmin_end;

                    if (i == 0) {
                        if (start > new Date().getTime()) {
                            var time = "until " + nhour_start + ":" + nmin_start;
                            var jsonMainHour = '{ "time" : [' +
                                '{ "mainTime":"' + time + '" }]}';
                        } else {
                            var jsonMainHour = '{ "time" : [' +
                                '{ "mainTime":"' + nhour_start + ":" + nmin_start + "-" + nhour_end + ":" + nmin_end + '" }]}';
                        }
                        var obj = JSON.parse(jsonMainHour);
                        jsonMainHeader.setData(obj);
                        this.getView().setModel(jsonMainHeader, "reservationTimeHeader");
                    } else {
                        json.value.push({ 
                            "subject": {},
                            "reservationTime": {},
                            "startDateTime": {},
                            "endDateTime": {},
                            "attendees": []
                        });
                    }

                    json.value[i].subject = data.value[i].subject;
                    json.value[i].reservationTime = nhour_start + ":" + nmin_start + "-" + nhour_end + ":" + nmin_end;
                    json.value[i].startDateTime = new Date(data.value[i].start.dateTime);
                    json.value[i].endDateTime = new Date(data.value[i].end.dateTime);

                    for (var j = 0; j < data.value[i].attendees.length; j++) {
                        json.value[i].attendees.push({
                            name: data.value[i].attendees[j].emailAddress.name,
                            address: data.value[i].attendees[j].emailAddress.address
                        });
                    }
                }
                jsonModel.setData(json);
                this.getView().setModel(jsonModel, "reservationTime");
            } else {
                var d = new Date();
                var dateFrom = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.toLocaleTimeString();
                var dateTo = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1) + "T" + d.toLocaleTimeString();
                var url_reservation_next_all = "/room-reservation/getUserEvents?userEmail=ecroom1@itutil.com"
                this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_next_all), "reservationTime");
                var time = "";
                var jsonMainHour = '{ "time" : [' +
                    '{ "mainTime":"' + time + '" }]}';

                var obj = JSON.parse(jsonMainHour);
                jsonMainHeader.setData(obj);
                this.getView().setModel(jsonMainHeader, "reservationTimeHeader");
            }
            console.log(jsonModel);
        },

        getAjax: function (myUrl) {
            var myData = null;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                async: false,
                url: myUrl,
                dataType: "json",
                success: function (data) {
                    myData = data;
                }
            });
            console.log(myData);
            return myData;
        },


        addFirstValues: function (data, start, end) {
            window.thisRD = this;
            var jsonStatusModel = new sap.ui.model.json.JSONModel;
            var jsonMainHeader = new sap.ui.model.json.JSONModel();
            var json = '{ "status" : [' +
                '{ "CurrentOrUse":" " , "ProgressBar":"0" , "CurrentOrNext": " "}]}';
            var obj = JSON.parse(json);
            jsonStatusModel.setData(obj);

            if (allRooms[i].displayName == "EC Room 1") {
                if (data.value.length != 0) {
                    window.thisRD.newReservationStartTime = start;

                    window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("freeRoom");
                    window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("almostFreeRoom");
                    window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("inUserRoom");
                    if (start <= new Data().getTime()) {

                        window.thisRD.getView().byId("roomDetailsImage").addStyleClass("inUseRoom");
                        window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_end-now.png");

                        var maxCounterTime = end - start;
                        var currentCounterTime = end - new Data().getTime();
                        var progressBarCounter = 100 - Math.round((100 * currentCounterTime) / maxCounterTime).toFixed(2);

                        jsonStatusModel.oData.status["0"].CurrentOrUse = "In use";
                        jsonStatusModel.oData.status["0"].ProgressBar = progressBarCounter;
                        jsonStatusModel.oData.status["0"].CurrentOrNext = "Current";

                        sessionStorage.removeItem('updateStatus');
                        if (window.thisRD.getView().byId("quickReservationHBox").getVisible())
                            window.thisRD.onQuickReservation(0);
                    } else {
                        var checkIfLessThan15 = start - actual;
                        if (window.thisRD.getView().byId("quickReservationHBox").getVisible())
                            window.thisRD.onQuickReservation(0);
                        if (new Date(checkIfLessThan15).getMinutes() <= 15) {
                            window.thisRD.getView().byId("roomDetailsImage").addStyleClass("almostFreeRoom");
                            window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_quick-booking-orange.png");
                        } else {
                            window.thisRD.getView().byId("roomDetailsImage").addStyleClass("freeRoom");
                            window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_quick-booking.png");
                        }
                        jsonStatusModel.oData.status["0"].CurrentOrUse = "Available";
                        jsonStatusModel.oData.status["0"].ProgressBar = "0";
                        jsonStatusModel.oData.status["0"].CurrentOrNext = "Next";
                    }
                } else {
                    jsonStatusModel.oData.status["0"].CurrentOrUse = "Available";
                    jsonStatusModel.oData.status["0"].ProgressBar = "0";
                    jsonStatusModel.oData.status["0"].CurrentOrNext = "No reservations";

                    window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("inUseRoom");
                    window.thisRD.getView().byId("roomDetailsImage").addStyleClass("freeRoom");
                    window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_quick-booking.png");

                    var time = "";
                    var jsonMainHour = '{ "time" : [' +
                        '{ "mainTime":"' + time + '" }]}';

                    var obj = JSON.parse(jsonMainHour);
                    jsonMainHeader.setData(obj);
                    this.getView().setModel(jsonMainHeader, "reservationTimeHeader");
                }

                window.thisRD.getView().setModel(jsonStatusModel, "ActualStatus");
            }
        },

        updateStatus: function () {
            var d = new Date();

            this.getView().setModel(new sap.ui.model.json.JSONModel("/room-reservation/freeRooms"), "reservationDetailsFindAnother");

            var allRooms = this.getAjax("/room-reservation/freeRooms");
            var jsonModel = new sap.ui.model.json.JSONModel;
            var jsonMainHeader = new sap.ui.model.json.JSONModel();
            window.thisRD = this;

            var json = {
                "dataModel": [{
                    "roommail": {},
                    "value": [{
                        "subject": {},
                        "reservationTime": {},
                        "attendees": []
                    }]
                }]
            };
            console.log(json);
            console.log("allrooms.length: " + allRooms.length);
            for (var i = 0; i < allRooms.length; i++) {
                console.log(allRooms[i].userPrincipalName);

                var data = this.getAjax("/room-reservation/getUserEvents?userEmail=" + allRooms[i].userPrincipalName);
                console.log(json.dataModel);
                console.log("i: "+ i);
                json.dataModel[i].roommail = allRooms[i].userPrincipalName;
                
                if (allRooms.length != 0) {
                    console.log(data.value.length);
                    for (var j = 0; j < data.value.length; j++) {
                        console.log("j: " + j);
                        var start_dt_apple = data.value[j].start.dateTime.split("T");
                        var start_date_apple = start_dt_apple[0].split("-");
                        var start_time_apple = start_dt_apple[1].split(":");
                        var start = new Date(start_date_apple[0], (start_date_apple[1] - 1), start_date_apple[2], start_time_apple[0], start_time_apple[1], "00", "00").getTime();

                        var end_dt_apple = data.value[j].end.dateTime.split("T");
                        var end_date_apple = end_dt_apple[0].split("-");
                        var end_time_apple = end_dt_apple[1].split(":");
                        var end = new Date(end_date_apple[0], (end_date_apple[1] - 1), end_date_apple[2], end_time_apple[0], end_time_apple[1], "00", "00").getTime();

                        var nhour_start = new Date(start).getHours(),
                            nmin_start = new Date(start).getMinutes(),
                            nhour_end = new Date(end).getHours(),
                            nmin_end = new Date(end).getMinutes();
                        if (nhour_start <= 9) nhour_start = "0" + nhour_start;
                        if (nmin_start <= 9) nmin_start = "0" + nmin_start;
                        if (nhour_end <= 9) nhour_end = "0" + nhour_end;
                        if (nmin_end <= 9) nmin_end = "0" + nmin_end;

                        if (j == 0 && allRooms[i].displayName == "EC ROOM 1")
                            this.addFirstValues(data, start, end);

                        if (j == 0) {
                            if (start > new Date().getTime()) {
                                var time = "until " + nhour_start + ":" + nmin_start;
                                var jsonMainHour = '{ "time" : [' +
                                    '{ "mainTime":"' + time + '" }]}';
                            } else {
                                var jsonMainHour = '{ "time" : [' +
                                    '{ "mainTime":"' + nhour_start + ":" + nmin_start + "-" + nhour_end + ":" + nmin_end + '" }]}';
                            }
                            var obj = JSON.parse(jsonMainHour);
                            jsonMainHeader.setData(obj);
                            this.getView().setModel(jsonMainHeader, "reservationTimeHeader");
                        } else {
                            json.dataModel[i].value.push({ 
                                "subject": {},
                                "reservationTime": {},
                                "startDateTime": {},
                                "endDateTime": {},
                                "attendees": []
                            });
                        }

                        json.dataModel[i].value[j].subject = data.value[j].subject;
                        json.dataModel[i].value[j].reservationTime = nhour_start + ":" + nmin_start + "-" + nhour_end + ":" + nmin_end;
                        json.dataModel[i].value[j].startDateTime = new Date(data.value[j].start.dateTime);
                        json.dataModel[i].value[j].endDateTime = new Date(data.value[j].end.dateTime);

                        for (var k = 0; k < data.value[j].attendees.length; k++) {
                            json.dataModel[i].value[j].attendees.push({
                                name: data.dataModel[i].value[j].attendees[k].emailAddress.name,
                                address: data.dataModel[i].value[j].attendees[k].emailAddress.address
                            });
                        }
                    }
                    jsonModel.setData(json);
                    this.getView().setModel(jsonModel, "reservationTime");
                }
            }
            console.log(jsonModel);
        },

        onRoomDetailsPeopleOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("roomDetailsTablePeople");

            rejectBtn.setVisible(true);
            this.getView().byId("peopleImage").setSrc("./resources/images/detailsPeopleWhite.png");
            this.getView().byId("peopleText").addStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTableAll").setVisible(false);
            this.getView().byId("calendarImage").setSrc("./resources/images/detailsCalendarGray.png");
            this.getView().byId("calendarText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTableFindAnother").setVisible(false);
            this.getView().byId("findAnotherImage").setSrc("./resources/images/detailsFindAnotherGray.png");
            this.getView().byId("findAnotherText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("detailsHBox").setVisible(false);
            this.getView().byId("openReservationImage").setSrc("./resources/images/detailsOpenReservationGray.png");
            this.getView().byId("openReservationText").removeStyleClass("roomDisplayChangeTextColor");
        },

        onRoomDetailsFindOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("roomDetailsTableFindAnother");

            rejectBtn.setVisible(true);
            this.getView().byId("findAnotherImage").setSrc("./resources/images/detailsFindAnotherWhite.png");
            this.getView().byId("findAnotherText").addStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTableAll").setVisible(false);
            this.getView().byId("calendarImage").setSrc("./resources/images/detailsCalendarGray.png");
            this.getView().byId("calendarText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTablePeople").setVisible(false);
            this.getView().byId("peopleImage").setSrc("./resources/images/detailsPeopleGray.png");
            this.getView().byId("peopleText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("detailsHBox").setVisible(false);
            this.getView().byId("openReservationImage").setSrc("./resources/images/detailsOpenReservationGray.png");
            this.getView().byId("openReservationText").removeStyleClass("roomDisplayChangeTextColor");
        },

        onRoomDetailsAddOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("detailsHBox");

            rejectBtn.setVisible(true);
            this.getView().byId("openReservationImage").setSrc("./resources/images/detailsOpenReservationWhite.png");
            this.getView().byId("openReservationText").addStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTableAll").setVisible(false);
            this.getView().byId("calendarImage").setSrc("./resources/images/detailsCalendarGray.png");
            this.getView().byId("calendarText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTablePeople").setVisible(false);
            this.getView().byId("peopleImage").setSrc("./resources/images/detailsPeopleGray.png");
            this.getView().byId("peopleText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTableFindAnother").setVisible(false);
            this.getView().byId("findAnotherImage").setSrc("./resources/images/detailsFindAnotherGray.png");
            this.getView().byId("findAnotherText").removeStyleClass("roomDisplayChangeTextColor");
        },

        onRoomDetailsCalendarOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("roomDetailsTableAll");


            //if(this.getView().byId("roomDetailsTableAll").getVisible()) {
            rejectBtn.setVisible(true);
            //}
            this.getView().byId("calendarImage").setSrc("./resources/images/detailsCalendarWhite.png");
            this.getView().byId("calendarText").addStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTableFindAnother").setVisible(false);
            this.getView().byId("findAnotherImage").setSrc("./resources/images/detailsFindAnotherGray.png");
            this.getView().byId("findAnotherText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("roomDetailsTablePeople").setVisible(false);
            this.getView().byId("peopleImage").setSrc("./resources/images/detailsPeopleGray.png");
            this.getView().byId("peopleText").removeStyleClass("roomDisplayChangeTextColor");

            this.getView().byId("detailsHBox").setVisible(false);
            this.getView().byId("openReservationImage").setSrc("./resources/images/detailsOpenReservationGray.png");
            this.getView().byId("openReservationText").removeStyleClass("roomDisplayChangeTextColor");
        },

        onRoomDetailsAddReservation: function () {
            var date = this.getView().byId("DTI1").getValue();
            var hourFrom = this.getView().byId("DTI2").getValue();
            var hourTo = this.getView().byId("DTI3").getValue();
            var organizer = this.getView().byId("DTI4").getValue();
            date = date.split(".");
            var d = new Date();

            var fromDateTime = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourFrom + ":00";
            var toDateTime = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourTo + ":00";

            hourFrom = hourFrom.split(":");
            hourTo = hourTo.split(":");

            var dateToSendFrom = new Date(date[2], (date[1] - 1), date[0], hourFrom[0], hourFrom[1], "00", "00");
            var dateToSendTo = new Date(date[2], (date[1] - 1), date[0], hourTo[0], hourTo[1], "00", "00");

            dateToSendFrom = dateToSendFrom.getTime();
            dateToSendTo = dateToSendTo.getTime();
            var actualTime = new Date().getTime();

            var mail = "";
            if (organizer) {
                var fullName = organizer.split(" ");
                mail = fullName[0].toLowerCase() + "." + fullName[1].toLowerCase() + "@itutil.com";
            }

            thisRD = this;
            var json = { 
                "subject": "Conference meeting",
                 "start": {   
                    "dateTime": fromDateTime,
                       "timeZone": "Europe/Warsaw" 
                },
                 "end": {   
                    "dateTime": toDateTime,
                       "timeZone": "Europe/Warsaw" 
                },
                 "location": {
                    "displayName": "ecroom1@itutil.com",
                    "locationType": "ConferenceRoom"
                },
                "attendees": [{
                    "emailAddress": {
                        "address": mail,
                        "name": organizer
                    },
                    "type": "optional"
                }, {
                    "emailAddress": {
                        "address": "mateusz.kuchta@itutil.com",
                        "name": "Mateusz Kuchta"
                    },
                    "type": "optional"
                }, {
                    "emailAddress": {
                        "address": "piotr.matosek@itutil.com",
                        "name": "Piotr Matosek"
                    },
                    "type": "optional"
                }, {
                    "emailAddress": {
                        "address": "kamil.szopa@itutil.com",
                        "name": "Kamil Szopa"
                    },
                    "type": "optional"
                }, {
                    "emailAddress": {
                        "address": "marcin.stanowski@itutil.com",
                        "name": "Marcin Stanowski"
                    },
                    "type": "optional"
                }, {
                    "emailAddress": {
                        "address": "ecroom1@itutil.com",
                        "name": "ecu room 1"
                    },
                    "type": "required"   
                } ]
            };

            var json = JSON.stringify(json);
            if ((dateToSendFrom && dateToSendTo && organizer) && (dateToSendTo > dateToSendFrom) && (dateToSendFrom >= actualTime)) {
                $.ajax({
                    type: "POST",
                    url: "/room-reservation/event",
                    data: json,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data) {
                            sap.m.MessageToast.show("Added!");
                            thisRD.getView().byId("DTI4").setValue("");
                            thisRD.getView().byId("DTI1").setValue("");
                            thisRD.getView().byId("DTI2").setValue("");
                            thisRD.getView().byId("DTI3").setValue("");
                            thisRD.updateStatus();
                        } else {
                            // sap.m.MessageToast.show("Room already in use");
                        }
                    },
                    failure: function (errMsg) {
                        sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });
            } else {
                sap.m.MessageToast.show("All of inputs are valid?");
            }
        },

        onProjectorPress: function () {

            if (this.getView().byId("projectorImage").getSrc() === "./resources/images/projectorImageGray.png") {
                this.getView().byId("projectorImage").setSrc("./resources/images/projectorImageWhite.png")
            } else {
                this.getView().byId("projectorImage").setSrc("./resources/images/projectorImageGray.png")
            }
        },

        onCookiePress: function () {

            if (this.getView().byId("cookiesImage").getSrc() === "./resources/images/cookiesImageGray.png") {
                this.getView().byId("cookiesImage").setSrc("./resources/images/cookiesImageWhite.png")
            } else {
                this.getView().byId("cookiesImage").setSrc("./resources/images/cookiesImageGray.png")
            }
        },

        onCoffeePress: function () {

            if (this.getView().byId("coffeeImage").getSrc() === "./resources/images/coffeeImageGray.png") {
                this.getView().byId("coffeeImage").setSrc("./resources/images/coffeeImageWhite.png")
            } else {
                this.getView().byId("coffeeImage").setSrc("./resources/images/coffeeImageGray.png")
            }
        },

        onPearPress: function () {

            if (this.getView().byId("pearImage").getSrc() === "./resources/images/pearImageGray.png") {
                this.getView().byId("pearImage").setSrc("./resources/images/pearImageWhite.png")
            } else {
                this.getView().byId("pearImage").setSrc("./resources/images/pearImageGray.png")
            }
        },

        onSelectDialogPress: function (oEvent) {
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("dialogChooseExtra", "ecu.view.Dialogs.Dialog", this);

            }

            var bMultiSelect = !!oEvent.getSource().data("multi");
            this._oDialog.setMultiSelect(bMultiSelect);

            var bRemember = !!oEvent.getSource().data("remember");
            this._oDialog.setRememberSelections(bRemember);

            this._oDialog.open();
        },

        handleClose: function (oEvent) {
            var aContexts = oEvent.getParameter("selectedContexts");
            var arr = new Array();
            var enums = {
                0: {
                    "image": "projectorImage",
                    "name": "Projector"
                },
                1: {
                    "image": "cookiesImage",
                    "name": "Cookies"
                },
                2: {
                    "image": "coffeeImage",
                    "name": "Coffee"
                },
                3: {
                    "image": "pearImage",
                    "name": "Fruits"
                }
            }

            for (var i = 0; i < 4; i++) {

                if (oEvent.mParameters.selectedItems[i] !== undefined) {
                    for (var j = 0; j < 4; j++) {
                        if (oEvent.mParameters.selectedItems[i].mProperties.title === enums[j].name) {
                            this.getView().byId(enums[j].image).setSrc("./resources/images/" + enums[j].image + "White.png");
                            arr.push(j);
                        }
                    }
                }
            }
            for (var i = 0; i < 4; i++) {
                if (arr.indexOf(i) == -1) {
                    this.getView().byId(enums[i].image).setSrc("./resources/images/" + enums[i].image + "Gray.png");
                }
            }
        },

        onEndNowAndQuickRes: function () {
            if (this.getView().byId("endNowAndQuickRes").getSrc() === "./resources/images/button_quick-booking.png") {
                this.onQuickReservation(0);
            } else if (this.getView().byId("endNowAndQuickRes").getSrc() === "./resources/images/button_quick-booking-orange.png") {
                var minutes = this.newReservationStartTime - new Date().getTime();
                minutes = new Date(minutes).getMinutes();
                this.onQuickReservation(minutes);
            } else {

                window.thisRD = this;
                $.get({
                    url: "/room-reservation/deleteCurrentEvent?roomEmail=ecroom1@itutil.com",
                    success: function (data) {
                        thisRD.updateStatus();
                    },
                    error: function (errMsg) {
                        sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });
                sap.m.MessageToast.show("Conference has ended!");
            }
        },


        onQuickReservation: function (minutes) {

            var i = 1;
            if (minutes != 0) {
                var date = new Date();
                date.setSeconds(date.getSeconds() + 1);
                var nhour = date.getHours(),
                    nmin = date.getMinutes(),
                    nsec = date.getSeconds();

                if (nhour <= 9) nhour = "0" + nhour;
                if (nmin <= 9) nmin = "0" + nmin;
                if (nsec <= 9) nsec = "0" + nsec;
                var fromDateTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" + nhour + ":" + nmin + ":" + nsec;

                date.setMinutes(date.getMinutes() + minutes);
                nhour = date.getHours();
                nmin = date.getMinutes();
                if (nhour <= 9) nhour = "0" + nhour;
                if (nmin <= 9) nmin = "0" + nmin;

                var toDateTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "T" + nhour + ":" + nmin + ":00";
                var json = { 
                    "subject": "Conference meeting",
                     "start": {   
                        "dateTime": fromDateTime,
                           "timeZone": "Europe/Warsaw" 
                    },
                     "end": {   
                        "dateTime": toDateTime,
                           "timeZone": "Europe/Warsaw" 
                    },
                     "location": {
                        "displayName": "ecroom1@itutil.com",
                        "locationType": "ConferenceRoom"
                    },
                    "attendees": [{
                        "emailAddress": {
                            "address": "mateusz.kuchta@itutil.com",
                            "name": "Mateusz Kuchta"
                        },
                        "type": "optional"
                    }, {
                        "emailAddress": {
                            "address": "piotr.matosek@itutil.com",
                            "name": "Piotr Matosek"
                        },
                        "type": "optional"
                    }, {
                        "emailAddress": {
                            "address": "kamil.szopa@itutil.com",
                            "name": "Kamil Szopa"
                        },
                        "type": "optional"
                    }, {
                        "emailAddress": {
                            "address": "marcin.stanowski@itutil.com",
                            "name": "Marcin Stanowski"
                        },
                        "type": "optional"
                    }, {
                        "emailAddress": {
                            "address": "ecroom1@itutil.com",
                            "name": "ecu room 1"
                        },
                        "type": "required"   
                    } ]
                };

                var json = JSON.stringify(json);
                sessionStorage.setItem('updateStatus', 'true');
                $.ajax({
                    type: "POST",
                    url: "/room-reservation/event",
                    data: json,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        //if (data) {
                        sap.ui.core.BusyIndicator.show();
                        thisRD.getView().byId("DTI4").setValue("");
                        thisRD.getView().byId("DTI1").setValue("");
                        thisRD.getView().byId("DTI2").setValue("");
                        thisRD.getView().byId("DTI3").setValue("");
                        sap.m.MessageToast.show("Booked for " + minutes + " minutes");
                        thisRD.updateStatus();
                        //} else {
                        // sap.m.MessageToast.show("Room already in use");
                        //}
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (errMsg) {
                        sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });

            }
            if (minutes > 15 || minutes < 1) {
                if (this.getView().byId("quickReservationHBox").getVisible()) {
                    this.getView().byId("quickReservationHBox").setVisible(false);

                    this.getView().byId("roomDetailsTableClosest").setVisible(true);
                    this.getView().byId("progressBar").setVisible(true);
                } else {
                    this.getView().byId("quickReservationHBox").setVisible(true);

                    this.getView().byId("roomDetailsTableClosest").setVisible(false);
                    this.getView().byId("progressBar").setVisible(false);
                }
            }

        },

        onImageQuickRes1: function () {
            this.onQuickReservation(15);
        },

        onImageQuickRes2: function () {
            this.onQuickReservation(30);
        },

        onImageQuickRes3: function () {
            this.onQuickReservation(45);
        },

        handleAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            if (oAppointment) {
                console.log("Appointment selected: " + oAppointment.getTitle());
            } else {
                console.log("nie weszle");
            }
        }
    });
});