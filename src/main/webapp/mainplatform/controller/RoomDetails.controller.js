sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/Fragment"
], function (BaseController, Fragment) {
    "use strict";
    return BaseController.extend("ecu.controller.RoomDetails", {
        thisRD: null,
        timerHelper: null,
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
            var oTimer = this.getView().byId("oTimer");
            var result = this.GetClock();
            var resultTimer = this.GetTimer();

            oLabel.setText(result);
            //oTimer.setText(resultTimer);
            var that = this;
            setInterval(function () {
                var result = that.GetClock();
                //var resultTimer = that.GetTimer();
                oLabel.setText(result);
                //oTimer.setText(resultTimer);
            }, 1000);
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

        GetTimer: function () {
            var d = new Date();
            var time = null;
            var actualTime = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
            time = window.timerHelper - actualTime;

            if (time < 0) {
                time = -time;
            }
            var newTime = new Date(time);
            var nmin = newTime.getMinutes();
            var nsec = newTime.getSeconds();
            var nhour = newTime.getHours() - 1;

            if (nmin <= 9) nmin = "0" + nmin;
            if (nsec <= 9) nsec = "0" + nsec;
            var result = "for " + (nhour + 2) + ":" + nmin + ":" + nsec + "";

            if (window.timerHelper == "-1")
                return " ";

            return result;
        },

        addReservationText: function (data) {
            var jsonModel = new sap.ui.model.json.JSONModel();
            var i = 0;
            console.log(data);
            if (data != "0") {
                var start = new Date(data.value["0"].start.dateTime).getTime();
                var end = new Date(data.value["0"].end.dateTime).getTime();

                var nhour_start = new Date(start).getHours(),
                    nmin_start = new Date(start).getMinutes(),
                    nhour_end = new Date(end).getHours(),
                    nmin_end = new Date(end).getMinutes();
                if (nhour_start <= 9) nhour_start = "0" + nhour_start;
                if (nmin_start <= 9) nmin_start = "0" + nmin_start;
                if (nhour_end <= 9) nhour_end = "0" + nhour_end;
                if (nmin_end <= 9) nmin_end = "0" + nmin_end;

                var fullTime = nhour_start + ":" + nmin_start + "-" + nhour_end + ":" + nmin_end;

                var json = '{ "time" : [' +
                    '{ "start":"' + fullTime  + '" }]}';
                var obj = JSON.parse(json);


                console.log(fullTime);

                for (i = 1; i < data.value.length; i++) {
                    var start = new Date(data.value[i].start.dateTime).getTime();
                    var end = new Date(data.value[i].end.dateTime).getTime();
                    var nhour_start = new Date(start).getHours(),
                        nmin_start = new Date(start).getMinutes(),
                        nhour_end = new Date(end).getHours(),
                        nmin_end = new Date(end).getMinutes();
                    if (nhour_start <= 9) nhour_start = "0" + nhour_start;
                    if (nmin_start <= 9) nmin_start = "0" + nmin_start;
                    if (nhour_end <= 9) nhour_end = "0" + nhour_end;
                    if (nmin_end <= 9) nmin_end = "0" + nmin_end;

                    var fullTime = nhour_start + ":" + nmin_start + "-" + nhour_end + ":" + nmin_end;
                    obj.time.push({
                        start: fullTime
                    });
                }
                jsonModel.setData(obj);
                this.getView().setModel(jsonModel, "reservationTime");
            } else {
                var d = new Date();
                var dateFrom = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.toLocaleTimeString();
                var dateTo = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1) + "T" + d.toLocaleTimeString();
                var url_reservation_next_all = "/ecu-web/getUserEvents?userEmail=ecroom1@itutil.com&startDateTime=" + dateFrom + "&endDateTime=" + dateTo;
                this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_next_all), "reservationTime");
            }
        },

        updateStatus: function () {
            var d = new Date();
            var nhour = d.getHours(),
                nmin = d.getMinutes(),
                nsec = d.getSeconds();

            if (nhour <= 9) nhour = "0" + nhour;
            if (nmin <= 9) nmin = "0" + nmin;
            if (nsec <= 9) nsec = "0" + nsec;

            var dateFrom = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.toLocaleTimeString();
            var dateTo = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1) + "T" + d.toLocaleTimeString();

            var url_reservation_next_all = "/ecu-web/getUserEvents?userEmail=ecroom1@itutil.com&startDateTime=" + dateFrom + "&endDateTime=" + dateTo;
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_next_all), "reservationDisplayDetailsAll");
            var url_reservation_details_people = "/ecu-web/users";
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_details_people), "reservationDetailsPeople");
            var url_reservation_details_find_another = "/ecu-web/freeRooms";
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_details_find_another), "reservationDetailsFindAnother");

            var oModel = new sap.ui.model.odata.v2.ODataModel("/ecu-web/ODataService.svc");
            var jsonModel = new sap.ui.model.json.JSONModel();
            var jsonStatusModel = new sap.ui.model.json.JSONModel();

            window.thisRD = this;

            var getJSON = function (url, callback) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'json';
                xhr.onload = function () {
                    var status = xhr.status;
                    if (status === 200) {
                        callback(null, xhr.response);
                    } else {
                        callback(status, xhr.response);
                    }
                };
                xhr.send();
            };
            this.addReservationText(0);
            var model = new sap.ui.model.json.JSONModel(url_reservation_next_all);
            console.log(model);
            getJSON(url_reservation_next_all, function (err, data) {
                var json = '{ "status" : [' +
                    '{ "CurrentOrUse":" " , "ProgressBar":"0" , "CurrentOrNext": " "}]}';
                var obj = JSON.parse(json);
                jsonStatusModel.setData(obj);

                var date = new Date();
                var actual = new Date().getTime();

                if (data.value.length != 0) { //if (data != null)
                    var start = new Date(data.value["0"].start.dateTime).getTime();
                    var end = new Date(data.value["0"].end.dateTime).getTime();

                    window.thisRD.addReservationText(data);
                    if (start <= actual) {
                        window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("freeRoom");
                        window.thisRD.getView().byId("roomDetailsImage").addStyleClass("inUseRoom");
                        window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_end-now.png");

                        var maxCounterTime = end - start;
                        var currentCounterTime = end - actual;
                        var progressBarCounter = 100 - Math.round((100 * currentCounterTime) / maxCounterTime).toFixed(2);

                        jsonStatusModel.oData.status["0"].CurrentOrUse = "In use";
                        jsonStatusModel.oData.status["0"].ProgressBar = progressBarCounter;
                        jsonStatusModel.oData.status["0"].CurrentOrNext = "Current";

                        window.timerHelper = end;

                        sessionStorage.removeItem('updateStatus');
                        if (window.thisRD.getView().byId("imageQuickRes1").getVisible())
                            window.thisRD.onQuickReservation(0);
                    } else {
                        window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("inUseRoom");
                        window.thisRD.getView().byId("roomDetailsImage").addStyleClass("freeRoom");
                        window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_quick-booking.png");
                        jsonStatusModel.oData.status["0"].CurrentOrUse = "Available";
                        jsonStatusModel.oData.status["0"].ProgressBar = "0";
                        jsonStatusModel.oData.status["0"].CurrentOrNext = "Next";

                        window.timerHelper = start;
                    }
                    window.thisRD.getView().setModel(jsonStatusModel, "ActualStatus");
                } else {
                    jsonStatusModel.oData.status["0"].CurrentOrUse = "Available";
                    jsonStatusModel.oData.status["0"].ProgressBar = "0";
                    jsonStatusModel.oData.status["0"].CurrentOrNext = "No reservations";

                    window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("inUseRoom");
                    window.thisRD.getView().byId("roomDetailsImage").addStyleClass("freeRoom");
                    window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_quick-booking.png");

                    window.timerHelper = "-1";
                    window.thisRD.getView().setModel(jsonStatusModel, "ActualStatus");
                }
            });
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

            rejectBtn.setVisible(true);
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

            dateToSendFrom.getTime();
            dateToSendTo.getTime();

            var actualTime = new Date().getTime();

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
                        "address": "mateusz.kuchta@itutil.com",
                        "name": "Mateusz Kuchta"
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
                    url: "/ecu-web/event",
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

        onListButtonPress: function () {
            console.log("dziala");
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
            var i = 0,
                j = 0;
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

            for (i = 0; i < 4; i++) {

                if (oEvent.mParameters.selectedItems[i] !== undefined) {
                    for (j = 0; j < 4; j++) {
                        if (oEvent.mParameters.selectedItems[i].mProperties.title === enums[j].name)
                            this.getView().byId(enums[j].image).setSrc("./resources/images/" + enums[j].image + "White.png");
                    }
                }
            }
        },

        onEndNowAndQuickRes: function () {
            if (this.getView().byId("endNowAndQuickRes").getSrc() === "./resources/images/button_quick-booking.png") {
                this.onQuickReservation(0);
            } else {

                window.thisRD = this;
                $.get({
                    url: "/ecu-web/deleteCurrentEvent?roomEmail=ecroom1@itutil.com",
                    success: function (data) {
                        sleep(1000).then(() => {
                            thisRD.updateStatus();
                        });

                        function sleep(ms) {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        }
                    },
                    error: function (errMsg) {
                        sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });

                this.updateStatus();
                sap.m.MessageToast.show("Conference has ended!");
            }

        },

        onQuickReservation: function (minutes) {

            var i = 1;
            if (minutes != 0) {
                var date = new Date();
                date.setMonth(date.getMonth() + 1);
                date.setSeconds(date.getSeconds() + 1);
                var nhour = date.getHours(),
                    nmin = date.getMinutes(),
                    nsec = date.getSeconds();

                if (nhour <= 9) nhour = "0" + nhour;
                if (nmin <= 9) nmin = "0" + nmin;
                if (nsec <= 9) nsec = "0" + nsec;

                var fromDateTime = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "T" + nhour + ":" + nmin + ":" + nsec;

                date.setMinutes(date.getMinutes() + minutes);
                nhour = date.getHours();
                nmin = date.getMinutes();
                if (nhour <= 9) nhour = "0" + nhour;
                if (nmin <= 9) nmin = "0" + nmin;


                var toDateTime = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + "T" + nhour + ":" + nmin + ":00";

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
                    url: "/ecu-web/event",
                    data: json,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        //if (data) {
                        thisRD.getView().byId("DTI4").setValue("");
                        thisRD.getView().byId("DTI1").setValue("");
                        thisRD.getView().byId("DTI2").setValue("");
                        thisRD.getView().byId("DTI3").setValue("");
                        sap.m.MessageToast.show("Booked for " + minutes + " minutes");


                        var refreshId = setInterval(function () {
                            thisRD.updateStatus();
                            if (!sessionStorage.getItem('updateStatus')) {
                                clearInterval(refreshId);
                            }
                        }, 3000);

                        //} else {
                        // sap.m.MessageToast.show("Room already in use");
                        //}
                    },
                    error: function (errMsg) {
                        sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });
            }

            if (this.getView().byId("imageQuickRes1").getVisible()) {
                for (i = 1; i < 4; i++)
                    this.getView().byId("imageQuickRes" + i).setVisible(false);
                this.getView().byId("roomDetailsTableClosest").setVisible(true);
                this.getView().byId("progressBar").setVisible(true);
            } else {
                for (i = 1; i < 4; i++)
                    this.getView().byId("imageQuickRes" + i).setVisible(true);
                this.getView().byId("roomDetailsTableClosest").setVisible(false);
                this.getView().byId("progressBar").setVisible(false);
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
        }
    });
});