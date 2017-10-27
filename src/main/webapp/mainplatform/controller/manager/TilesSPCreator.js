sap.ui.define([ "sap/ui/base/Object", 'ecu/lib/oDate',
		'ecu/lib/QueryGenerator', 'ecu/controller/manager/TileRadial' ],
		function(Object, oDate, QueryGenerator, TileRadial) {
			"use strict";
			return Object.extend("ecu.controller.manager.TilesSPCreator", {
				baseTile : null,
				isDate : null,
				arg : null,
				route : null,
				view:null,
				constructor : function(viewElement, route) {
					this.viewElement = viewElement;
					this.route = route;
					
				},
				generate : function(isDate, arg) {
					var qg;
					this.isDate = isDate;
					this.arg = arg;
					//this.view = view
					var odate = new oDate();
					//this.viewElement.removeAllTiles();
					//console.info(this.arg);
					
					switch (this.arg.arg1) {
					case "Yesterday":
						if (this.isDate) {
							qg = new QueryGenerator(odate.getDateFromNow(-1),
									odate.getDateFromNow(0), 0, true, null,
									null);
						} else if (this.arg.arg2 === undefined) {
							qg = new QueryGenerator(odate.getDateFromNow(-1),
									odate.getDateFromNow(0), 0, false, null,
									null);
						} else {
							qg = new QueryGenerator(odate.getDateFromNow(-1),
									odate.getDateFromNow(0), 0, false,
									this.arg.arg2, null);
						}
						break;
					case "Week":
						if (isDate) {
							qg = new QueryGenerator(odate.getWeekBegin(), odate
									.getDateFromNow(0), 1, true, null, null);
						} else if (this.arg.arg2 === undefined) {
							qg = new QueryGenerator(odate.getWeekBegin(), odate
									.getDateFromNow(0), 1, false, null, null);
						} else {
							qg = new QueryGenerator(odate.getWeekBegin(), odate
									.getDateFromNow(0), 1, false,
									this.arg.arg2, null);
						}
						break;
					case "Month":
						if (isDate) {
							qg = new QueryGenerator(odate.getMonthBegin(),
									odate.getDateFromNow(0), 2, true, null,
									null);
						} else if (this.arg.arg2 === undefined) {
							qg = new QueryGenerator(odate.getMonthBegin(),
									odate.getDateFromNow(0), 2, false, null,
									null);
						} else {
							qg = new QueryGenerator(odate.getMonthBegin(),
									odate.getDateFromNow(0), 2, false,
									this.arg.arg2, null);
						}
						break;
					}
					
					var oDataURL = "/ecu-web/ODataService.svc";
					var oData = new sap.ui.model.odata.v2.ODataModel({
						serviceUrl : oDataURL
					});
					window.oThis = this;
					oData.read("/GetSales?", {
						urlParameters : {
							"Where" : qg.Where,
							"GroupBy" : qg.GroupBy,
							"OrderBy" : qg.OrderBy
						},
						success : function(oData, response) {
							console.info(qg.Where + "|" + qg.GroupBy + "|resultes :" + oData.results.length);
							var oDataLenght = oData.results.length;
							var array = new Array();
							var args = new Array();
							
							for (var i = 0; i < oData.results.length; i++) {
								array[i] = new TileRadial(i);
								args[i] = oData.results[i].Name;
								
								
								array[i].setData(window.oThis.isDate,
										oData.results[i].Name, "Sales Plan",
										window.oThis.arg.arg1,
										oData.results[i].PlanSale,
										oData.results[i].ActualSale);
								
								array[i].setRoute(window.oThis.route);
								
								if( window.oThis.arg.arg2 === undefined){
									array[i].attachPress(function(event) {
										console.info(event.getParameters());
										window.oThis.route.navTo("salesPlane",{groupby:"quarterPlan"});
									});
								}
								
								//arr.push(tile);
								window.oThis.viewElement.addTile(array[i].getTile());
								// element.addContent(tile.getTile());
							}
						},
						error : function(oError) {
							console.info(oError);
						},
						uniqIndex : function(oModel) {
							console.info(oModel);
						}

					});
				}
			});
		});