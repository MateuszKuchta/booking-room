sap.ui.define([
    "ecu/controller/BaseController",
    "sap/ui/model/odata/ODataModel"
], function (BaseController) {
    "use strict";
    BaseController.extend("ecu.controller.NewApp", {

        onInit: function (evt) {


        },

        onCorpoPress: function () {
            this.getRouter().navTo("Corpo");
        },
        naviToReports: function () {
            this.getRouter().navTo("dashboard");
        },

        onNavToMainPage: function() {
            this.getRouter().navTo("NewApp");
        },

        onNavToDetails: function() {
            this.getRouter().navTo("RoomDetails");
            // window.location.replace('http://' + window.location.host+ '/ecu-web/login');
        }

    });
});