sap.ui.define([
	"ecu/controller/BaseController",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/core/Fragment"
], function (BaseController, Fragment) {
	"use strict";
	return BaseController.extend("ecu.controller.Corpo", {
		onInit: function () {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.attachRouteMatched(this.handleRouteMatched, this);
			
			var oRouter, oTarget;
			oRouter = this.getRouter();
			oTarget = oRouter.getTarget("corpo");
			oTarget.attachDisplay(function (oEvent) {
				this._oData = oEvent.getParameter("data");
			}, this);
		},

		handleRouteMatched: function () {
            var url = "/ecu-web/ODataService.svc/Newss?$orderby=Time%20desc&$top=3&$format=json";
			var oModelJs = new sap.ui.model.json.JSONModel(url);
			this.getView().setModel(oModelJs, "news");
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

		onOpenFoodPopover: function (oEvent) {

			var url = "/ecu-web/ODataService.svc/GetSuppliersFromLast30Minutes?$format=json";
			var oModelJs = new sap.ui.model.json.JSONModel(url);
			this.getView().setModel(oModelJs, "lastSuppliers");

			if (!this._oPopoverFood) {
				this._oPopoverFood = sap.ui.xmlfragment("popoverNavCon", "ecu.view.Popovers.Popover", this);
				this.getView().addDependent(this._oPopoverFood);
			}

			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopoverFood.openBy(oButton);
			});
		},

		//Przechodzi w popoverze do następnej części popoveru
		onNavToProduct: function (oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oNavCon = sap.ui.core.Fragment.byId("popoverNavCon", "navCon");
			var oDetailPage = sap.ui.core.Fragment.byId("popoverNavCon", "detail");

			var url = "/ecu-web/ODataService.svc/Suppliers?$format=json";
			var oModelJs = new sap.ui.model.json.JSONModel(url);
			this.getView().setModel(oModelJs, "allSupliers");

			oNavCon.to(oDetailPage);
		},

		onPopNavBack: function (oEvent) {
			var oNavCon = sap.ui.core.Fragment.byId("popoverNavCon", "navCon");
			oNavCon.back();
		},

		//Dodaje 'Pana Kanapke' do bazy
		it:null,
		onSupplierArrived: function (oEvent) {
			var oSelectedItem = oEvent.getSource();
			var oContext = oSelectedItem.getBindingContext("allSupliers");

			var title = oEvent.getSource().getTitle();
			var description = oEvent.getSource().getDescription();
			window.it = this;
			$.get({
				url: "/ecu-web/ODataService.svc/SupplierArrived?SupplierName='" + title + "'&EmployeeId=20&$format=json",
				success: function (response) {
					if (response) {
						sap.m.MessageToast.show("Added!");
						var url = "/ecu-web/ODataService.svc/Newss?$orderby=Time%20desc&$top=3&$format=json";
						var oModelJs = new sap.ui.model.json.JSONModel(url);
						window.it.getView().setModel(oModelJs, "news");
					}
				},
				error: function (response) {
					sap.m.MessageToast.show("Error with connecting to the server");
				}
			})
		},

		//Odswieża listę fast foodów
		onRefreshPress: function (oEvent) {
			var url = "/ecu-web/ODataService.svc/GetSuppliersFromLast30Minutes?$format=json";
			var oModelJs = new sap.ui.model.json.JSONModel(url);
			this.getView().setModel(oModelJs, "lastSuppliers");
		},

		//Wyświetla listę newsów
		//TODO
		onNewsListPress: function (oEvent) {
			var title = oEvent.getSource().getText();
			var desc = oEvent.getSource().getTimestamp();

			var oNews = {
				news: {
					title: title,
					desc: desc
				}
			};
			var oModel = new sap.ui.model.json.JSONModel(oNews);
			//oModel.setData(jsonString);
			this.getView().setModel(oModel, "openNews");

			if (!this._oPopoverNews) {
				this._oPopoverNews = sap.ui.xmlfragment("popoverNavConNews", "ecu.view.Popovers.PopoverNews", this);
				this.getView().addDependent(this._oPopoverNews);
			}

			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopoverNews.openBy(oButton);
			});
		},

		//
		onNavigationPopover: function (oEvent) {

			if (!this._oPopoverNav) {
				this._oPopoverNav = sap.ui.xmlfragment("popoverNavConNav", "ecu.view.Popovers.PopoverNavigation", this);
				this.getView().addDependent(this._oPopoverNav);
			}

			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopoverNav.openBy(oButton);
			});
		},

		handleSearchPressed: function (oEvent) {

			var jsonString = JSON.stringify({
				Room: '1',
				Floor: '1'
			}, {
				Room: '2',
				Floor: '1'
			}, {
				Room: '3',
				Floor: '2'
			});

			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(jsonString);
			this.getView().setModel(oModel, "navSearch");
		},

		onNavigationRoute: function () {
			this.getRouter().navTo("Navigation");
		},

		onFirstFloorPress: function (oEvent) {
			this.getRouter().navTo("Floor1");
		},

		onSecondFloorPress: function(oEvent) {
			this.getRouter().navTo("Floor2");
		},

		onThirdFloorPress: function(oEvent) {
			this.getRouter().navTo("Floor3");
		},

		onReservationRoomPopover: function (oEvent) {
			if (!this._oPopoverRoomReservation) {
				this._oPopoverRoomReservation = sap.ui.xmlfragment("popoverNavReservation", "ecu.view.Popovers.PopoverRoomReservation", this);
				this.getView().addDependent(this._oPopoverRoomReservation);
			}

			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oPopoverRoomReservation.openBy(oButton);
			});
		},

		//Pobiera dane o pokojach i w momencie wybrania wyświetla listę zajętości
		onNumberOfRoomPick: function (oEvent) {

			var oItem = oEvent.getParameter("item"),
				sItemPath = "";
			while (oItem instanceof sap.m.MenuItem) {
				sItemPath = oItem.getText() + " > " + sItemPath;
				oItem = oItem.getParent();
			}
			sItemPath = sItemPath.substr(0, sItemPath.lastIndexOf(" > "));
			sap.ui.getCore().setModel(sItemPath, "chosenRoom");
			// var url = "/ecu-web/ODataService.svc/Rooms(" + sItemPath + "L)/ReservationDetails?$format=json";
			var url = "/ecu-web/ODataService.svc/GetCurrentAndFutureReservations?RoomNumber="+sItemPath+"&$format=json";
			var oModelJs = new sap.ui.model.json.JSONModel(url);
			this.getView().setModel(oModelJs, "roomReservation");
			

			var oNavCon = sap.ui.core.Fragment.byId("popoverNavReservation", "navConReservation");
			var oDetailPage = sap.ui.core.Fragment.byId("popoverNavReservation", "detail");

			oNavCon.to(oDetailPage);
		},

		onPopReservationBack: function () {
			var oNavCon = sap.ui.core.Fragment.byId("popoverNavReservation", "navConReservation");
			oNavCon.back();
		},

		//Dodawanie rezerwacji pokoju bez wykorzystania mapy
		onAcceptRoomReservation: function (oEvent) {
			this._oPopoverRoomReservation.close();
			var date = sap.ui.core.Fragment.byId("popoverNavReservation", "DTI1").getValue();
			var hourFrom = sap.ui.core.Fragment.byId("popoverNavReservation", "DTI2").getValue();
			var hourTo = sap.ui.core.Fragment.byId("popoverNavReservation", "DTI3").getValue();
			date = date.split(".");

			var dateToSendFrom = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourFrom + ":00";
			var dateToSendTo = date[2] + "-" + date[1] + "-" + date[0] + "T" + hourTo + ":00";
			var room = sap.ui.getCore().getModel("chosenRoom");

			if (dateToSendFrom && dateToSendTo) {
				if (this.checkTime(date, hourFrom)) {
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
				} else {
					sap.m.MessageToast.show("Are u sure date is correct?");
				}
			} else {
				sap.m.MessageToast.show("All of inputs are valid?");
			}
		},

		onFreeMeetingRooms: function () {
			var url = "/ecu-web/ODataService.svc/GetFreeRooms";
			var oModelJs = new sap.ui.model.json.JSONModel(url);
			this.getView().setModel(oModelJs, "getFreeRooms");

			var oNavCon = sap.ui.core.Fragment.byId("popoverNavConNav", "navConNav");
			var oDetailPage = sap.ui.core.Fragment.byId("popoverNavConNav", "detail");

			oNavCon.to(oDetailPage);
		},

		onPopNavBackNav: function (oEvent) {
			var oNavCon = sap.ui.core.Fragment.byId("popoverNavConNav", "navConNav");
			oNavCon.back();
		},

		checkTime: function(date, hourFrom) {
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
		},

		onFoodNavigation: function(oEvent) {
			sessionStorage.setItem('food', "foodValue");
			this.getRouter().navTo("Floor2");
		},

		onNavToMainPage: function() {
            this.getRouter().navTo("NewApp");
        }
	});
});
