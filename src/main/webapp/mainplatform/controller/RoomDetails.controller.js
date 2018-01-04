/* global moment:true */
sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "ecu/lib/moment"
], function (BaseController, Fragment, MessageBox, momentjs) {
    "use strict";
    return BaseController.extend("ecu.controller.RoomDetails", {
        thisRD: null,
        ifLogged: null,
        actualReservationData: null,
        onInit: function () {
            this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this._oRouter.attachRouteMatched(this.handleRouteMatched, this);

            var oLabel = this.getView().byId("oClock");
            var result = this.GetClock();

            window.thisRD = this;
            oLabel.setText(result);
            var that = this;
            setInterval(function () {
                var result = that.GetClock();
                oLabel.setText(result);
            }, 1000);

            this.getView().setModel(new sap.ui.model.json.JSONModel("/room-reservation/users"), "reservationDetailsPeople");
            this.getView().setModel(new sap.ui.model.json.JSONModel("/room-reservation/rooms"), "allRooms");

            if (this.showCookie("Name") != undefined) {
                var oModel = new sap.ui.model.json.JSONModel();
                var json = { 
                    "value": [{
                        "roomName": this.showCookie("Name")
                    }]
                };
                oModel.setData(json);
                this.getView().setModel(oModel, "roomName");
            }
            if (this.showCookie("Url") != undefined) {
                this.saveImages(this.showCookie("Url"));
            }
        },

        onAfterRendering: function () {
            jQuery("#" + this.createId("openMenuLink")).on("click", this.openNav.bind(this));
            jQuery("#" + this.createId("loginButton")).on("click", this.onOutlookLoginPress.bind(this));
            jQuery("#" + this.createId("settingsButton")).on("click", this.onSettingsPress.bind(this));
            jQuery("#" + this.createId("child")).on("click", this.closeNav.bind(this));
            jQuery("#" + this.createId("child2")).on("click", this.closeNav.bind(this));
            this.updateStatus();
        },

        handleRouteMatched: function () {
            this.updateStatus();
        },

        GetClock: function () {
            var d = new Date();
            var nhour = d.getHours(),
                nday = d.getDay(),
                nmin = d.getMinutes(),
                nsec = d.getSeconds();

            if (nmin <= 9) nmin = "0" + nmin;
            if (nsec <= 9) nsec = "0" + nsec;
            var result = nhour + ":" + nmin + ":" + nsec + "";

            if (nsec == "00")
                this.updateStatus();
            return result;
        },

        openNav: function () {
            if ($(".sideBar").css('display') === 'none') {
                $(".sideBar").css({
                    'display': 'block'
                });
            } else {
                $(".sideBar").css({
                    'display': 'none'
                });
            }
        },

        closeNav: function () {
            $(".sideBar").css({
                'display': 'none'
            });
        },

        onSettingsPress: function () {
            console.log(this.createId("settingsButton"));
            if (this.getView().byId("settingsBox").getVisible()) {
                this.getView().byId("settingsBox").setVisible(false);
            } else {
                this.getView().byId("settingsBox").setVisible(true);
            }
        },

        onReservationPress: function () {
            this.getView().byId("calendarView").setVisible(false);
            this.getView().byId("attendeesList").setVisible(false);
            this.getView().byId("reservationsList").setVisible(true);

            this.getView().byId("attendeesIcon").removeStyleClass("selectedIcon");
            this.getView().byId("calendarIcon").removeStyleClass("selectedIcon");
            this.getView().byId("reservationsIcon").addStyleClass("selectedIcon");
        },

        onAttendeesPress: function () {
            this.getView().byId("calendarView").setVisible(false);
            this.getView().byId("reservationsList").setVisible(false);
            this.getView().byId("attendeesList").setVisible(true);

            this.getView().byId("reservationsIcon").removeStyleClass("selectedIcon");
            this.getView().byId("calendarIcon").removeStyleClass("selectedIcon");
            this.getView().byId("attendeesIcon").addStyleClass("selectedIcon");
        },

        onCalendarPress: function () {
            this.getView().byId("reservationsList").setVisible(false);
            this.getView().byId("attendeesList").setVisible(false);
            this.getView().byId("calendarView").setVisible(true);

            this.getView().byId("attendeesIcon").removeStyleClass("selectedIcon");
            this.getView().byId("reservationsIcon").removeStyleClass("selectedIcon");
            this.getView().byId("calendarIcon").addStyleClass("selectedIcon");
        },

        setOccupancyRoomStatus: function () {
            window.thisRD = this;
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/room-reservation/getRoomsWithEvents",
                dataType: "json",
                success: function (data) {

                    if (data != null) {
                        for (var i = 0; i < data.length; i++) {
                            if (i == 0)
                                data[i].startTime = new Date();
                            if ((data[i].value != null) && (data[i].value.length != 0)) {
                                data[i].startTime = new Date(data[i].value[0].start.dateTime);
                                if (new Date(data[i].value[0].start.dateTime).getTime() > new Date().getTime()) {
                                    data[i].available = "Available";
                                } else {
                                    data[i].available = "In use";
                                }
                                for (var j = 0; j < data[i].value.length; j++) {
                                    data[i].value[j].start.dateTime = new Date(data[i].value[j].start.dateTime);
                                    data[i].value[j].end.dateTime = new Date(data[i].value[j].end.dateTime);
                                    data[i].value[j].type = "Type0" + Math.floor((Math.random() * 4) + 1);
                                    var nhour_start = data[i].value[j].start.dateTime.getHours(),
                                        nhour_end = data[i].value[j].end.dateTime.getHours(),
                                        nmins_start = data[i].value[j].start.dateTime.getMinutes(),
                                        nmins_end = data[i].value[j].end.dateTime.getMinutes();
                                    if (nhour_start <= 9) nhour_start = "0" + nhour_start;
                                    if (nhour_end <= 9) nhour_end = "0" + nhour_end;
                                    if (nmins_start <= 9) nmins_start = "0" + nmins_start;
                                    if (nmins_end <= 9) nmins_end = "0" + nmins_end;
                                    data[i].value[j].totalTime = nhour_start + ":" + nmins_start + "-" + nhour_end + ":" + nmins_end;
                                }
                            } else {
                                data[i].available = "Available";
                            }
                        }
                    }
                    window.thisRD.getView().setModel(new sap.ui.model.json.JSONModel(data), "allRoomsOccupancy");
                }
            });
        },

        addReservationText: function (data) {
            var jsonModel = new sap.ui.model.json.JSONModel();
            var jsonMainHeader = new sap.ui.model.json.JSONModel();

            if (data != "0") {
                var json = { 
                    "value": [{
                        "subject": {},
                        "organizer": {},
                        "reservationTime": {},
                        "startDateTime": {},
                        "endDateTime": {},
                        "attendees": []
                    }]
                };

                for (var i = 0; i < data.value.length; i++) {
                    //Konwertowanie czasu, da sie zrobic jedna metoda ale stary apple nie czytal wszystkich funkcji
                    var start_dt_apple = data.value[i].start.dateTime.split("T");
                    var start_date_apple = start_dt_apple[0].split("-");
                    var start_time_apple = start_dt_apple[1].split(":");
                    var start = new Date(start_date_apple[0], (start_date_apple[1] - 1), start_date_apple[2], start_time_apple[0], start_time_apple[1], "00", "00").getTime();

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

                    //Pierwsza rezerwacja potrzebna nam bedzie do wyswietlenia glownych informacji 
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
                            "organizer": {},
                            "reservationTime": {},
                            "startDateTime": {},
                            "endDateTime": {},
                            "attendees": []
                        });
                    }

                    json.value[i].subject = data.value[i].subject;
                    json.value[i].organizer = data.value[i].organizer.emailAddress.name;
                    json.value[i].reservationTime = nhour_start + ":" + nmin_start + "-" + nhour_end + ":" + nmin_end;
                    json.value[i].startDateTime = new Date(data.value[i].start.dateTime);
                    json.value[i].endDateTime = new Date(data.value[i].end.dateTime);

                    //Dodanie uczestnikow do modelu rezerwacji
                    for (var j = 0; j < data.value[i].attendees.length; j++) {

                        if (data.value[i].attendees[j].phone != undefined) {
                            json.value[i].attendees.push({
                                name: data.value[i].attendees[j].emailAddress.name,
                                address: data.value[i].attendees[j].emailAddress.address,
                                phone: data.value[i].attendees[j].phone.number
                            });
                        } else {
                            json.value[i].attendees.push({
                                name: data.value[i].attendees[j].emailAddress.name,
                                address: data.value[i].attendees[j].emailAddress.address
                            });
                        }
                    }
                }
                jsonModel.setData(json);
                this.getView().setModel(jsonModel, "reservationTime");
            } else {
                var email = this.showCookie("Email");
                var url_reservation_next_all = "/room-reservation/getUserEvents?userEmail=" + email;
                this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_next_all), "reservationTime");
                var time = "";
                var jsonMainHour = '{ "time" : [' +
                    '{ "mainTime":"' + time + '" }]}';

                var obj = JSON.parse(jsonMainHour);
                jsonMainHeader.setData(obj);
                this.getView().setModel(jsonMainHeader, "reservationTimeHeader");
            }
            this.setOccupancyRoomStatus();
        },

        checkIfLoggedIn: function () {
            window.thisRD = this;

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/room-reservation/rooms",
                async: false,
                dataType: "json",
                success: function (data) {
                    window.thisRD.ifLogged = true;

                    if (window.thisRD.showCookie("Email") === undefined) {
                        window.thisRD.getView().byId("reservationsList").setVisible(false);
                        window.thisRD.getView().byId("attendeesList").setVisible(false);
                        window.thisRD.getView().byId("calendarView").setVisible(false);

                        window.thisRD.getView().byId("reservationsIcon").setSrc("");
                        window.thisRD.getView().byId("attendeesIcon").setSrc("");
                        window.thisRD.getView().byId("calendarIcon").setSrc("");
                    } else {
                        window.thisRD.getView().byId("reservationsList").setVisible(true);
                        window.thisRD.getView().byId("attendeesList").setVisible(false);
                        window.thisRD.getView().byId("calendarView").setVisible(false);

                        window.thisRD.getView().byId("reservationsIcon").setSrc("sap-icon://check-availability");
                        window.thisRD.getView().byId("attendeesIcon").setSrc("sap-icon://group");
                        window.thisRD.getView().byId("calendarIcon").setSrc("sap-icon://calendar");

                        window.thisRD.getView().byId("attendeesIcon").removeStyleClass("selectedIcon");
                        window.thisRD.getView().byId("calendarIcon").removeStyleClass("selectedIcon");
                        window.thisRD.getView().byId("reservationsIcon").addStyleClass("selectedIcon");
                    }

                },
                error: function (err) {
                    if (err.status == "401") {
                        window.thisRD.ifLogged = false;
                        window.thisRD.getView().byId("reservationsList").setVisible(false);
                        window.thisRD.getView().byId("attendeesList").setVisible(false);
                        window.thisRD.getView().byId("calendarView").setVisible(false);

                        window.thisRD.getView().byId("reservationsIcon").setSrc("");
                        window.thisRD.getView().byId("attendeesIcon").setSrc("");
                        window.thisRD.getView().byId("calendarIcon").setSrc("");

                    }
                }
            });
        },

        updateStatus: function () {
            this.checkIfLoggedIn();
            var d = new Date();
            var dateFrom = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.toLocaleTimeString();
            var dateTo = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1) + "T" + d.toLocaleTimeString();

            var url_reservation_details_find_another = "/room-reservation/rooms";
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_details_find_another), "reservationDetailsFindAnother");

            var jsonModel = new sap.ui.model.json.JSONModel();
            var jsonStatusModel = new sap.ui.model.json.JSONModel();
            window.thisRD = this;

            var json = '{ "status" : [' +
                '{ "CurrentOrUse":" "}]}';
            var obj = JSON.parse(json);
            jsonStatusModel.setData(obj);

            var date = new Date();
            var actual = new Date().getTime();
            var email = this.showCookie("Email");

            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/room-reservation/getUserEvents?userEmail=" + email,
                dataType: "json",
                success: function (data) {
                    var model_actual = JSON.stringify(window.thisRD.actualReservationData);
                    var model_incoming = JSON.stringify(data);

                    if (data.value.length != 0) {
                        var start_dt_apple = data.value["0"].start.dateTime.split("T");
                        var start_date_apple = start_dt_apple[0].split("-");
                        var start_time_apple = start_dt_apple[1].split(":");
                        var start = new Date(start_date_apple[0], (start_date_apple[1] - 1), start_date_apple[2], start_time_apple[0], start_time_apple[1], "00", "00").getTime();
                        window.thisRD.newReservationStartTime = start;

                        var end_dt_apple = data.value["0"].end.dateTime.split("T");
                        var end_date_apple = end_dt_apple[0].split("-");
                        var end_time_apple = end_dt_apple[1].split(":");
                        var end = new Date(end_date_apple[0], (end_date_apple[1] - 1), end_date_apple[2], end_time_apple[0], end_time_apple[1], "00", "00").getTime();

                        if ((window.thisRD.actualReservationData !== model_incoming) || (jQuery("#__xmlview1--child").hasClass("almostFreeRoom") && (start <= actual))) {
                            window.thisRD.addReservationText(data);
                        }

                        jQuery("#__xmlview1--child").removeClass("freeRoom");
                        jQuery("#__xmlview1--child").removeClass("almostFreeRoom");
                        jQuery("#__xmlview1--child").removeClass("inUseRoom");

                        if (start <= actual) {
                            jQuery("#__xmlview1--child").addClass("inUseRoom");
                            if (window.thisRD.getView().byId("15minReservation").getVisible())
                                window.thisRD.onQuickReservation(0);
                            window.thisRD.getView().byId("plusReservation").setSrc("./resources/images/end.png");
                            jsonStatusModel.oData.status["0"].CurrentOrUse = "In use";

                        } else {
                            var checkIfLessThan15 = start - actual;
                            if (new Date(checkIfLessThan15).getTime() <= new Date(0).setMinutes(new Date(0).getMinutes() + 15)) {
                                jQuery("#__xmlview1--child").addClass("almostFreeRoom");
                                if (window.thisRD.getView().byId("15minReservation").getVisible())
                                    window.thisRD.onQuickReservation(0);
                                window.thisRD.getView().byId("plusReservation").setSrc("./resources/images/plus-orange.png");
                            } else {
                                jQuery("#__xmlview1--child").addClass("freeRoom");
                                if ((window.thisRD.getView().byId("plusReservation").getSrc() !== "./resources/images/plus.png") && (window.thisRD.getView().byId("plusReservation").getSrc() !== "./resources/images/30mins.png")) {
                                    if (window.thisRD.getView().byId("15minReservation").getVisible())
                                        window.thisRD.onQuickReservation(0);
                                }

                            }
                            jsonStatusModel.oData.status["0"].CurrentOrUse = "Available";
                        }
                    } else {
                        window.thisRD.addReservationText(0);
                        jsonStatusModel.oData.status["0"].CurrentOrUse = "No reservations";
                        
                        jQuery("#__xmlview1--child").removeClass("almostFreeRoom");
                        jQuery("#__xmlview1--child").removeClass("inUseRoom");
                        jQuery("#__xmlview1--child").addClass("freeRoom");
                        if ((window.thisRD.getView().byId("plusReservation").getSrc() !== "./resources/images/plus.png") && (window.thisRD.getView().byId("plusReservation").getSrc() !== "./resources/images/30mins.png")) {
                            window.thisRD.onQuickReservation(0);
                        }
                    }
                    if (window.thisRD.ifLogged === false) {
                        jsonStatusModel.oData.status["0"].CurrentOrUse = "Not logged in";
                    }

                    window.thisRD.actualReservationData = model_incoming;
                    window.thisRD.getView().setModel(jsonStatusModel, "ActualStatus");
                },
                error: function () {
                    window.thisRD.addReservationText(0);
                    jsonStatusModel.oData.status["0"].CurrentOrUse = "No reservations";

                    jQuery("#__xmlview1--child").removeClass("almostFreeRoom");
                    jQuery("#__xmlview1--child").removeClass("inUseRoom");
                    jQuery("#__xmlview1--child").addClass("freeRoom");
                    window.thisRD.onQuickReservation(0);

                    if (window.thisRD.ifLogged === false) {
                        jsonStatusModel.oData.status["0"].CurrentOrUse = "Not logged in";
                        // window.thisRD.getView().byId("plusReservation").setSrc("");
                    }
                    window.thisRD.getView().setModel(jsonStatusModel, "ActualStatus");
                }

            });
        },

        onEndNowAndQuickRes: function () {

            if (this.getView().byId("plusReservation").getSrc() === "./resources/images/plus.png") {
                this.getView().byId("availableReservation").setVisible(false);
                this.getView().byId("15minReservation").setVisible(true);
                this.getView().byId("plusReservation").setSrc("./resources/images/30mins.png");
                this.getView().byId("45minReservation").setVisible(true);
                this.getView().byId("timeReservation").setVisible(false);
                jQuery("#__xmlview1--footer").css({
                    "display": "block"
                });
            } else if (this.getView().byId("plusReservation").getSrc() === "./resources/images/30mins.png") {
                this.onQuickReservation(30);
            } else if (this.getView().byId("plusReservation").getSrc() === "./resources/images/plus-orange.png") {
                var minutes = this.newReservationStartTime - new Date().getTime();
                minutes = new Date(minutes).getMinutes();
                this.onQuickReservation(minutes);
            } else {
                sap.ui.core.BusyIndicator.show();
                var email = this.showCookie("Email");
                this.onQuickReservation(0);
                window.thisRD = this;
                $.get({
                    url: "/room-reservation/endCurrentEvent?roomEmail=" + email,
                    success: function (data) {
                        setTimeout(
                            function () {
                                sap.ui.core.BusyIndicator.hide();
                                window.thisRD.updateStatus();
                                sap.m.MessageToast.show("Conference has ended!");
                            }, 1000);
                    },
                    error: function (errMsg) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });
            }
        },

        onQuickReservation: function (minutes) {

            var i = 1;
            if (minutes != 0) {
                sap.ui.core.BusyIndicator.show();
                var date = new Date();
                date.setSeconds(date.getSeconds() + 1);
                var nhour = date.getHours(),
                    nmin = date.getMinutes(),
                    nsec = date.getSeconds(),
                    ndays = date.getDate(),
                    nmonth = (date.getMonth() + 1);

                if (nmonth <= 9) nmonth = "0" + nmonth;
                if (ndays <= 9) ndays = "0" + ndays;
                if (nhour <= 9) nhour = "0" + nhour;
                if (nmin <= 9) nmin = "0" + nmin;
                if (nsec <= 9) nsec = "0" + nsec;
                var fromDateTime = date.getFullYear() + "-" + nmonth + "-" + ndays + "T" + nhour + ":" + nmin + ":" + nsec;

                date.setMinutes(date.getMinutes() + minutes);
                nmonth = (date.getMonth() + 1);
                ndays = date.getDate();
                nhour = date.getHours();
                nmin = date.getMinutes();
                if (nmonth <= 9) nmonth = "0" + nmonth;
                if (ndays <= 9) ndays = "0" + ndays;
                if (nhour <= 9) nhour = "0" + nhour;
                if (nmin <= 9) nmin = "0" + nmin;

                var toDateTime = date.getFullYear() + "-" + nmonth + "-" + ndays + "T" + nhour + ":" + nmin + ":00";
                var json = { 
                    "subject": "Conference meeting",
                     "start": {   
                        "dateTime": fromDateTime,
                           "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                     "end": {   
                        "dateTime": toDateTime,
                           "timeZone": Intl.DateTimeFormat().resolvedOptions().timeZone 
                    },
                     "location": {
                        "displayName": this.showCookie("Email"),
                        "locationType": "ConferenceRoom"
                    },
                    "attendees": [{
                        "emailAddress": {
                            "address": this.showCookie("Email"),
                            "name": this.showCookie("Name")
                        },
                        "type": "required"   
                    } ]
                };
                json = JSON.stringify(json);
                $.ajax({
                    type: "POST",
                    url: "/room-reservation/event",
                    data: json,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        setTimeout(
                            function () {
                                sap.ui.core.BusyIndicator.hide();
                                sap.m.MessageToast.show("Booked for " + minutes + " minutes");
                                thisRD.updateStatus();
                            }, 1000);
                    },
                    error: function (errMsg, data) {
                        sap.ui.core.BusyIndicator.hide();
                        if (errMsg.status == "409")
                            sap.m.MessageToast.show("Room is already in use");
                        else
                            sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });
            }
            if (minutes > 14 || minutes < 1) {
                this.getView().byId("availableReservation").setVisible(true);
                this.getView().byId("15minReservation").setVisible(false);
                this.getView().byId("plusReservation").setSrc("./resources/images/plus.png");
                this.getView().byId("45minReservation").setVisible(false);
                this.getView().byId("timeReservation").setVisible(true);

                jQuery("#__xmlview1--footer").css({
                    "display": "none"
                });

            }

        },

        onQuick15: function () {
            this.onQuickReservation(15);
        },

        onQuick45: function () {
            this.onQuickReservation(45);
        },

        onCancelButton: function () {
            this.onQuickReservation(0);
        },

        onRoomChange: function (evt) {
            var email = evt.getParameters().selectedItem.mProperties.key;
            if (this.getView().byId("selectRoomId").getSelectedItem() != null) {
                var name = evt.getParameters().selectedItem.mProperties.text;
                document.cookie = "Email=" + email + "; expires=Fri, 31 Dec 2037 23:59:59 GMT; path=/";
                document.cookie = "Name=" + name + "; expires=Fri, 31 Dec 2037 23:59:59 GMT; path=/";
            }
            if (this.showCookie("Name") != undefined) {
                var oModel = new sap.ui.model.json.JSONModel();
                var json = { 
                    "value": [{
                        "roomName": this.showCookie("Name")
                    }]
                };
                oModel.setData(json);
                this.getView().setModel(oModel, "roomName");
            }

            this.updateStatus();
        },

        showCookie: function (name) {
            if (document.cookie != "") {
                var cookies = document.cookie.split("; ");
                for (var i = 0; i < cookies.length; i++) {
                    var cookieName = cookies[i].split("=")[0];
                    var cookieVal = cookies[i].split("=")[1];
                    if (cookieName === name) {
                        return decodeURI(cookieVal);
                    }
                    if (cookieVal === name) {
                        return decodeURI(cookieName);
                    }
                }
            }
        },

        onOutlookLoginPress: function () {
            if (window.thisRD.ifLogged) {
                sap.ui.core.BusyIndicator.show();
                this.onQuickReservation(0);
                window.thisRD = this;
                $.ajax({
                    type: "GET",
                    url: "/room-reservation/logout",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        window.thisRD.updateStatus();
                        sap.m.MessageToast.show("Logged out");
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function (err) {
                        sap.ui.core.BusyIndicator.hide();
                        sap.m.MessageToast.show("Error with connecting to the server");
                    }
                });

            } else {
                window.location.replace('https://' + window.location.host + '/room-reservation/login?prefer=' + Intl.DateTimeFormat().resolvedOptions().timeZone);
            }
        },

        onUrlSave: function () {
            if (this.getView().byId("urlInput").getValue() != "") {
                this.runImage(this.getView().byId("urlInput").getValue());
                this.getView().byId("urlInput").setValue("");
            }
        },

        testImage: function (url, timeoutT) {
            return new Promise(function (resolve, reject) {
                var timeout = timeoutT || 5000;
                var timer, img = new Image();
                img.onerror = img.onabort = function () {
                    clearTimeout(timer);
                    reject("error");
                };
                img.onload = function () {
                    clearTimeout(timer);
                    resolve("success");
                };
                timer = setTimeout(function () {
                    img.src = "//!!!!/noexist.jpg";
                    reject("timeout");
                }, timeout);
                img.src = url;
            });
        },


        record: function (url, result) {

            if (result === "success") {
                document.cookie = "Url=" + url + "; expires=Fri, 31 Dec 2037 23:59:59 GMT; path=/";
                window.thisRD.saveImages(url);

                sap.m.MessageToast.show("Success!");
            } else {
                sap.m.MessageToast.show("Error!");
            }

        },

        runImage: function (url) {
            this.testImage(url).then(this.record.bind(null, url), this.record.bind(null, url));
        },

        saveImages: function (url) {
            $(".freeRoom").css({
                'background': "linear-gradient( rgba(0, 255, 0, 0.5), rgba(0, 255, 0, 0.58)), url('" + url + "')"
            });

            $(".inUseRoom").css({
                'background': "linear-gradient( rgba(255, 0, 0, 0.5), rgba(255, 0, 0, 0.6)), url('" + url + "')"
            });

            $(".almostFreeRoom").css({
                'background': "linear-gradient( rgba(255, 255, 0, 0.57), rgba(255, 255, 0, 0.82)), url('" + url + "')"
            });
        },

        handleAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            if (oAppointment) {
                sap.m.MessageBox.show("Subject: " + oAppointment.getText() + "\n" + "Time: " + oAppointment.getTitle());
            }
        }

    });
});