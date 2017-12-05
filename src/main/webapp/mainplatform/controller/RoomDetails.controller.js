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
        ifLogged: false,
        actualReservationData: null,
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
                                    console.log(data[i].value[j].start.dateTime.getHours() + ":" + data[i].value[j].start.dateTime.getMinutes() + "-" + data[i].value[j].end.dateTime.getHours() + ":" + data[i].value[j].end.dateTime.getMinutes());
                                    data[i].value[j].totalTime = data[i].value[j].start.dateTime.getHours() + ":" + data[i].value[j].start.dateTime.getMinutes() + "-" + data[i].value[j].end.dateTime.getHours() + ":" + data[i].value[j].end.dateTime.getMinutes();
                                }
                            } else {
                                data[i].available = "Available";
                            }
                        }
                    }
                    window.thisRD.getView().setModel(new sap.ui.model.json.JSONModel(data), "allRoomsOccupancy");
                    console.log(window.thisRD.getView().getModel("allRoomsOccupancy"));
                }
            });
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

            if (nsec == "00")
                this.updateStatus();

            return result;
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
        
        checkIfLoggedIn: function() {
        	window.thisRD = this;
        	
        	$.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/room-reservation/rooms",
                dataType: "json",
                success: function (data) {
                	window.ifLogged = true;
                    window.thisRD.getView().byId("calendarImage").setSrc("sap-icon://calendar");
                    window.thisRD.getView().byId("peopleImage").setSrc("sap-icon://group");
                    window.thisRD.getView().byId("findAnotherImage").setSrc("sap-icon://check-availability");
                },
                error: function(err) {
                	if(err.status == "401") {
                		window.ifLogged = false;
                		window.thisRD.getView().byId("roomDetailsTableAll").setVisible(false);
                        window.thisRD.getView().byId("calendarImage").setSrc("");
                        
                        window.thisRD.getView().byId("roomDetailsTablePeople").setVisible(false);
                        window.thisRD.getView().byId("peopleImage").setSrc("");

                        window.thisRD.getView().byId("roomDetailsTableFindAnother").setVisible(false);
                        window.thisRD.getView().byId("findAnotherImage").setSrc("");
                        
                        window.thisRD.getView().byId("detailsHBox").setVisible(true);
                        window.thisRD.getView().byId("openReservationImage").removeStyleClass("grayIcon");
                        window.thisRD.getView().byId("openReservationImage").addStyleClass("whiteIcon");
                	}
                }
        	})
        },

        updateStatus: function () {
        	this.checkIfLoggedIn();
            var d = new Date();
            var dateFrom = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + "T" + d.toLocaleTimeString();
            var dateTo = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + (d.getDate() + 1) + "T" + d.toLocaleTimeString();

            var url_reservation_details_find_another = "/room-reservation/rooms";
            this.getView().setModel(new sap.ui.model.json.JSONModel(url_reservation_details_find_another), "reservationDetailsFindAnother");

            var jsonModel = new sap.ui.model.json.JSONModel;
            var jsonStatusModel = new sap.ui.model.json.JSONModel;
            window.thisRD = this;

            var json = '{ "status" : [' +
                '{ "CurrentOrUse":" " , "ProgressBar":"0" , "CurrentOrNext": " "}]}';
            var obj = JSON.parse(json);
            jsonStatusModel.setData(obj);
            console.log(window.ifLogged);
            var date = new Date();
            var actual = new Date().getTime();
            var email = this.showCookie("Email");
            $.ajax({
                type: "GET",
                contentType: "application/json; charset=utf-8",
                url: "/room-reservation/getUserEvents?userEmail=" + email,
                dataType: "json",
                success: function (data) {
                    var model_actual = JSON.stringify(this.actualReservationData);
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

                        if ((window.thisRD.actualReservationData !== model_incoming) || (window.thisRD.getView().byId("roomDetailsImage").hasStyleClass("almostFreeRoom") && (start <= actual))) {
                            window.thisRD.addReservationText(data);
                        }
                        
                        window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("freeRoom");
                        window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("almostFreeRoom");
                        window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("inUseRoom");

                        if (start <= actual) {

                            window.thisRD.getView().byId("roomDetailsImage").addStyleClass("inUseRoom");
                            window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_end-now.png");

                            var maxCounterTime = end - start;
                            var currentCounterTime = end - actual;
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
                            if (new Date(checkIfLessThan15).getTime() <= new Date(0).setMinutes(new Date(0).getMinutes()+15)) {
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
                        window.thisRD.addReservationText(0);
                        jsonStatusModel.oData.status["0"].CurrentOrUse = "Available";
                        jsonStatusModel.oData.status["0"].ProgressBar = "0";
                        jsonStatusModel.oData.status["0"].CurrentOrNext = "No reservations";

                        window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("almostFreeRoom");
                        window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("inUseRoom");
                        window.thisRD.getView().byId("roomDetailsImage").addStyleClass("freeRoom");
                        window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_quick-booking.png");
                    }
                    if(window.ifLogged === false) {
                    	jsonStatusModel.oData.status["0"].CurrentOrUse = "Not logged in";
                    }
                    
                    window.thisRD.actualReservationData = model_incoming;
                    window.thisRD.getView().setModel(jsonStatusModel, "ActualStatus");
                },
                error: function () {
                    window.thisRD.addReservationText(0);
                    jsonStatusModel.oData.status["0"].CurrentOrUse = "Available";
                    jsonStatusModel.oData.status["0"].ProgressBar = "0";
                    jsonStatusModel.oData.status["0"].CurrentOrNext = "No reservations";

                    window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("almostFreeRoom");
                    window.thisRD.getView().byId("roomDetailsImage").removeStyleClass("inUseRoom");
                    window.thisRD.getView().byId("roomDetailsImage").addStyleClass("freeRoom");
                    window.thisRD.getView().byId("endNowAndQuickRes").setSrc("./resources/images/button_quick-booking.png");
                    
                    if(window.ifLogged === false) {
                    	jsonStatusModel.oData.status["0"].CurrentOrUse = "Not logged in";
                    }
                    window.thisRD.getView().setModel(jsonStatusModel, "ActualStatus");
                }

            });
        },

        onRoomDetailsPeopleOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("roomDetailsTablePeople");

            rejectBtn.setVisible(true);
            this.getView().byId("peopleImage").removeStyleClass("grayIcon");
            this.getView().byId("peopleImage").addStyleClass("whiteIcon");

            this.getView().byId("roomDetailsTableAll").setVisible(false);
            this.getView().byId("calendarImage").removeStyleClass("whiteIcon");
            this.getView().byId("calendarImage").addStyleClass("grayIcon");

            this.getView().byId("roomDetailsTableFindAnother").setVisible(false);
            this.getView().byId("findAnotherImage").removeStyleClass("whiteIcon");
            this.getView().byId("findAnotherImage").addStyleClass("grayIcon");

            this.getView().byId("detailsHBox").setVisible(false);
            this.getView().byId("openReservationImage").removeStyleClass("whiteIcon");
            this.getView().byId("openReservationImage").addStyleClass("grayIcon");
        },

        onRoomDetailsFindOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("roomDetailsTableFindAnother");

            rejectBtn.setVisible(true);
            this.getView().byId("findAnotherImage").removeStyleClass("grayIcon");
            this.getView().byId("findAnotherImage").addStyleClass("whiteIcon");

            this.getView().byId("roomDetailsTableAll").setVisible(false);
            this.getView().byId("calendarImage").removeStyleClass("whiteIcon");
            this.getView().byId("calendarImage").addStyleClass("grayIcon");

            this.getView().byId("roomDetailsTablePeople").setVisible(false);
            this.getView().byId("peopleImage").removeStyleClass("whiteIcon");
            this.getView().byId("peopleImage").addStyleClass("grayIcon");

            this.getView().byId("detailsHBox").setVisible(false);
            this.getView().byId("openReservationImage").removeStyleClass("whiteIcon");
            this.getView().byId("openReservationImage").addStyleClass("grayIcon");
        },

        onRoomDetailsAddOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("detailsHBox");

            rejectBtn.setVisible(true);
            this.getView().byId("openReservationImage").removeStyleClass("grayIcon");
            this.getView().byId("openReservationImage").addStyleClass("whiteIcon");

            this.getView().byId("roomDetailsTableAll").setVisible(false);
            this.getView().byId("calendarImage").removeStyleClass("whiteIcon");
            this.getView().byId("calendarImage").addStyleClass("grayIcon");

            this.getView().byId("roomDetailsTablePeople").setVisible(false);
            this.getView().byId("peopleImage").removeStyleClass("whiteIcon");
            this.getView().byId("peopleImage").addStyleClass("grayIcon");

            this.getView().byId("roomDetailsTableFindAnother").setVisible(false);
            this.getView().byId("findAnotherImage").removeStyleClass("whiteIcon");
            this.getView().byId("findAnotherImage").addStyleClass("grayIcon");
        },

        onRoomDetailsCalendarOpen: function (oEvent) {
            var rejectBtn = this.getView().byId("roomDetailsTableAll");

            rejectBtn.setVisible(true);
            this.getView().byId("calendarImage").removeStyleClass("grayIcon");
            this.getView().byId("calendarImage").addStyleClass("whiteIcon");

            this.getView().byId("roomDetailsTableFindAnother").setVisible(false);
            this.getView().byId("findAnotherImage").removeStyleClass("whiteIcon");
            this.getView().byId("findAnotherImage").addStyleClass("grayIcon");

            this.getView().byId("roomDetailsTablePeople").setVisible(false);
            this.getView().byId("peopleImage").removeStyleClass("whiteIcon");
            this.getView().byId("peopleImage").addStyleClass("grayIcon");

            this.getView().byId("detailsHBox").setVisible(false);
            this.getView().byId("openReservationImage").removeStyleClass("whiteIcon");
            this.getView().byId("openReservationImage").addStyleClass("grayIcon");
        },

        onEndNowAndQuickRes: function () {

            if (this.getView().byId("endNowAndQuickRes").getSrc() === "./resources/images/button_quick-booking.png") {
                this.onQuickReservation(0);
            } else if (this.getView().byId("endNowAndQuickRes").getSrc() === "./resources/images/button_quick-booking-orange.png") {
                var minutes = this.newReservationStartTime - new Date().getTime();
                minutes = new Date(minutes).getMinutes();
                this.onQuickReservation(minutes);
            } else {
                sap.ui.core.BusyIndicator.show();
                var email = this.showCookie("Email");
                window.thisRD = this;
                $.get({
                    url: "/room-reservation/endCurrentEvent?roomEmail=" + email,
                    success: function (data) {
                    	setTimeout(
	            		    function() {
	            		    	sap.ui.core.BusyIndicator.hide();
	                            thisRD.updateStatus();
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
                var json = JSON.stringify(json);
                sessionStorage.setItem('updateStatus', 'true');
                $.ajax({
                    type: "POST",
                    url: "/room-reservation/event",
                    data: json,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        setTimeout(
    	            		    function() {
    	            		    	sap.ui.core.BusyIndicator.hide();
    	                            sap.m.MessageToast.show("Booked for " + minutes + " minutes");
    	                            thisRD.updateStatus();
                		    }, 1000);
                    },
                    error: function (errMsg, data) {
                        sap.ui.core.BusyIndicator.hide();
                        if (errMsg.status === "409")
                            sap.m.MessageToast.show("Room is already in use");
                        else
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
                sap.m.MessageBox.show("Subject " + oAppointment.getText() + "\n" + "Time: " + oAppointment.getTitle());
            }
        },

        onOutlookLoginPress: function () {
        	window.location.replace('http://' + window.location.host + '/room-reservation/login?prefer=' + Intl.DateTimeFormat().resolvedOptions().timeZone);

        },
        
        onOutlookLogoutPress: function() {
        	sap.ui.core.BusyIndicator.show();
        	console.log("przed");
        	$.ajax({
                type: "GET",
                url: "/room-reservation/logout",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                	sap.m.MessageToast.show("Logged out");
                	console.log("po w success");
                	sap.ui.core.BusyIndicator.hide();
                },
                error: function () {
                	console.log("po w error");
                	sap.ui.core.BusyIndicator.hide();
                }
            });
        },

        onSavePressButton: function () {
            var email = this.getView().byId("selectRoomId").getSelectedKey();
            if (this.getView().byId("selectRoomId").getSelectedItem() != null) {
                var name = this.getView().byId("selectRoomId").getSelectedItem().getText();
                document.cookie = "Email=" + email + "; expires=Fri, 31 Dec 2037 23:59:59 GMT; path=/"
                document.cookie = "Name=" + name + "; expires=Fri, 31 Dec 2037 23:59:59 GMT; path=/"
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
        }
    });
});