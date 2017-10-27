sap.ui.define([
	 "sap/ui/base/Object",
	 "sap/ui/model/json/JSONModel"
], function(Object,JSONModel) {
	"use strict";
	return Object.extend("ecu.controller.manager.reports.Locations", {
		constructor : function(){
			var oData = {
				"location":[
					{
						"bu":"B1",
						"lon": "53.54096",
						"lat": "15.021057",
						"color":"rgba(147,247,0,0.3)",
						"regions": [
							{
								"reg":"R1",
								"lon": "53.321687",
								"lat": "15.054016"
							},
							{
								"reg":"R2",
								"lon": "53.898513",
								"lat": "14.263"
							},
							{
								"reg":"R3",
								"lon": "53.9696597",
								"lat": "14.7479903"
							},
							{
								"reg":"R4",
								"lon": "53.423282",
								"lat": "14.548645"
							}
						]
					},
					{
						"bu":"B2",
						"lon": "54.326135",
						"lat": "18.050537",
						"color":"rgba(51,153,255,0.3)",
						"regions": [
							{
								"reg":"RD",
								"lon": "54.344711",
								"lat": "18.68335"
							},
							{
								"reg":"RB",
								"lon": "54.087751",
								"lat": "18.768494"
							},
							{
								"reg":"RU",
								"lon": "54.450241",
								"lat": "17.018921"
							}
						]
					},
					{
						"bu":"B3",
						"lon": "53.124361",
						"lat": "23.172913",
						"color":"rgba(147,116,0,0.3)",
						"regions": [
							{
								"reg":"R",
								"lon": "53.124361",
								"lat": "23.172913",
							}
						]
					},
					{
						"bu":"B4",
						"lon": "52.140906",
						"lat": "17.141418",
						"color":"rgba(255,255,102,0.3)",
						"regions": [
							{
								"reg":"X3",
								"lon": "52.40644",
								"lat": "16.932678",
							},
							{
								"reg":"X2",
								"lon": "52.523574",
								"lat": "17.575378"
							},
							{
								"reg":"X1",
								"lon": "51.839851",
								"lat": "16.592102"
							}
						]
					},
					{
						"bu":"B5",
						"lon": "52.218377",
						"lat": "21.019592",
						"color":"rgba(255,153,255,0.3)",
						"regions": [
							{
								"reg":"C1",
								"lon": "52.218377",
								"lat": "21.019592",
							},
							{
								"reg":"C2",
								"lon": "52.536941",
								"lat": "19.712219"
							},
							{
								"reg":"C3",
								"lon": "52.164498",
								"lat": "22.304993"
							}
						]
					},
					{
						"bu":"B6",
						"lon": "51.114558",
						"lat": "17.042542",
						"color":"rgba(153,0,51,0.3)",
						"regions": [
							{
								"reg":"D1",
								"lon": "51.114558",
								"lat": "17.042542",
							},
							{
								"reg":"D2",
								"lon": "50.667569",
								"lat": "17.926941"
							},
							{
								"reg":"D3",
								"lon": "51.200688",
								"lat": "16.152649"
							}
						]
					},
					{
						"bu":"B7",
						"lon": "50.054317",
						"lat": "19.942932",
						"color":"rgba(255,153,0,0.3)",
						"regions": [
							{
								"reg":"E1",
								"lon": "50.029622",
								"lat": "19.223328",
							},
							{
								"reg":"E2",
								"lon": "49.604303",
								"lat": "20.711975"
							},
							{
								"reg":"E3",
								"lon": "50.054317",
								"lat": "19.942932"
							}
						]
					},
					{
						"bu":"B8",
						"lon": "50.029622",
						"lat": "22.002869",
						"color":"rgba(204, 204,0,0.3)",
						"regions": [
							{
								"reg":"F1",
								"lon": "49.679003",
								"lat": "21.766663",
							},
							{
								"reg":"F2",
								"lon": "50.029622",
								"lat": "22.002869",
							},
							{
								"reg":"F3",
								"lon": "50.573469",
								"lat": "22.046814"
							}
						]
					}
				]
			};
			var oModel = new JSONModel(oData);
			
			return oModel;
		}
	});
});