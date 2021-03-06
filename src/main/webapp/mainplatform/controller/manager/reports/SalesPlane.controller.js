sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'ecu/lib/QueryGenerator'
], function (Controller,QueryGenerator) {
	"use strict";
	var Controller = Controller.extend("ecu.controller.manager.reports.SalesPlane",{
		vizFrame : null,
		day_f : null,
		month_f: null,
		year_f: null,
		day_t:null,
		month_t:null,
		year_t:null,
		groupByUnit:false,
		select:null,
		oPopOver : null,
		time:null,
		date_f:null,
		date_t:null,
		businessUnit:null,
		region:null,
		isDateChange:false,
		onInit : function(){
	        
			this.getOwnerComponent().getRouter().getRoute("salesPlane").attachPatternMatched(this._onRouteMatched, this);
			var i18nModel = new sap.ui.model.resource.ResourceModel({
	        	 bundleName: "ecu.i18n.i18n"
	         });
	        this.getView().setModel(i18nModel, "i18n");
	        // this.groupByUnit = false;
		},
		onSeriesSelected : function(){
			sap.m.MessageToast.show("Wybrano serie");
		},
		_onRouteMatched: function(oEvent) {
			this.date_f = this.getView().byId("DP_f");
	        this.date_t = this.getView().byId("DP_t");
	        
	        var groupBy = oEvent.getParameter("arguments");
			var seriesRadioGroup = this.getView().byId("seriesRadioGroup");
			var selectSplit = groupBy.groupby.split("--");
			
			// funkcja zwracająca aktualną datę
			// dane dla kafelka aktualny kwartał
			var date = new Date();
			var firstDay = this.convertDate(new Date(date.getFullYear(), date.getMonth()+1, 1));
			var lastDay = this.convertDate(new Date(date.getFullYear(), date.getMonth() + 3, 1));
			var yearBegin = this.convertDate(new Date(date.getFullYear(), 1, 1));
			var yearEnd = this.convertDate(new Date(date.getFullYear()+1, 1, 1));
			
			
	        switch(selectSplit[1]) {
				case "dailyPlan":
					// seriesRadioGroup.setSelectedIndex(0);
					this.select = 0;
					this.selectedDateButton("day");
					// this.renderDatePicker(this.select);
					this.date_f.setValue(firstDay);
					this.date_t.setValue(lastDay);
					this.initChart(firstDay,lastDay,0,true,null,null);
					break;
				case "quarterPlan":
					// seriesRadioGroup.setSelectedIndex(3);
					this.select = 3;
					this.selectedDateButton("quarter");
					// this.renderDatePicker(this.select);
					this.date_f.setValue(yearBegin);
					this.date_t.setValue(yearEnd);
					this.initChart(yearBegin,yearEnd,3,true,null,null);
					break;
				}
		},
		readData: function (where,groupby,orderby){
			var view = this.getView();
			var oDataURL = "/ecu-web/ODataService.svc";
			var oModel = new sap.ui.model.json.JSONModel();
			var oData = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: oDataURL
			});
			oData.read("/GetSales?",{
				// GroupBy='sYear,month'&Between='2016-09-13'&And='2017-09-13'
				urlParameters:{
					"Where":where,
					"GroupBy":groupby,
					"OrderBy":orderby
				},
				success : function (oData,response) {	
                    oModel.setData(oData);
                    // można pracować na liście wyników
                    /*
					 * for (var i = 0; i < oModel.oData.results.length; i++){
					 * oModel.oData.results[i].Name =
					 * oModel.oData.results[i].Name + "Alo"; }
					 */

                    },
                error : function(oError){
                	console.info(oError);
                },
                uniqIndex: function(oModel){
                	console.info(oModel);
                }
			});
			
			return oModel;
		},
		onDateSelect: function(oEvent){
			this.isDateChange = true;
			this.onGrupChange();
		},
		oThis:null,
		initChart: function(date_f,date_t,gradation,isDate,businessUnit,region){
			
			var view = this.getView();		   
			var label = this.getView().getModel("i18n").getResourceBundle();
			
			// generowanie zapytania
			var qg = new QueryGenerator(date_f,date_t,gradation,isDate,businessUnit,region);
			view.setModel(this.readData(qg.Where,qg.GroupBy,qg.OrderBy),"Data");
			
			// header wykresu
			var charHeader = this.getView().byId("chartContainer");
			if(isDate){
				charHeader.setTitle("Plane sales by date");
			} else {
				if(businessUnit !== null){
					charHeader.setTitle("Plane sales by Business Unit " + businessUnit);
				} else {
					charHeader.setTitle("Plane sales by Business Unit");
				}
				
			}
			
			// wykres
			var vizFrame = this.getView().byId("idVizFrame");
			vizFrame.removeAllFeeds();
			vizFrame.setVizProperties({
				title: {
		            text: " "
		        },
		        legend: {
		        	visible:false
		        },
				interaction : { selectability : { mode : "single" } },
				valueAxis: {
			        title: {
			            visible: false,
			            text: "Value Axis Value"
			        }
			    },
			    categoryAxis: {
			        title: {
			            visible: false,
			            text: "Category Axis Value"
			        }
			    }
			});

			
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
	            dimensions: [{
	                name: "xAxis",
	                value: "{Name}"
	            }],
	            measures: [{
	                name: "Plan Sale",
	                value: '{PlanSale}'
	            },
	            {
	            	name: "Actual Sale",
	                value: '{ActualSale}'
	            }
	            ],
	            data: {
	                path: "Data>/results"
	            }
	        });
			vizFrame.setDataset(oDataset);
			
			
			
			vizFrame.setVizType("column");
			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid' : "valueAxis",
				'type' : "Measure",
				'values' : ["Plan Sale","Actual Sale"]
			});
			var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid' : "categoryAxis",
				'type' : "Dimension",
				'values' : ["xAxis"]
			});
			vizFrame.addFeed(feedValueAxis);
			vizFrame.addFeed(feedCategoryAxis);
			
			// popover dla VizFrame
			
			var chartPopover = new sap.viz.ui5.controls.Popover({});      
			chartPopover.connect(vizFrame.getVizUid());
			
			if (this.groupByUnit){
				window.oThis=this;
				window.time=this.time;
				var actionItem = {
					type:"action",
					text:"Drill",
					press: function(oEvent){
						window.oThis.clickOnDrill();
					}
				};
				chartPopover.setActionItems([ actionItem ]); 
			}
			
		},
		clikOnChart: function(oEvent){
			
			// TODO: zebrać dane dotyczące czasu w zwróconym rekordzie, wartości
			// przypisać do zmiennych dotyczących czasu.
			var getData = oEvent.getParameter("data");
			if(this.select>0){
				
				this.initChart(this.select - 1);
			}
			 
		},
		// funkcja pobiera dane z zaznaczonej kolumny
		clikOnChart_ : function(oEvent){
			var sObj = new Array();
			var data = oEvent.getParameter("data");
			this.businessUnit = data[0].data.xAxis;
			

		} ,
		// funkcja generuje nowy wykres np. poziom niżej
		// TODO: powinien generować wykres dla zakresu na podstawie kolumny
		clickOnDrill:function (){
			this.initChart(this.date_f.getValue(),this.date_t.getValue(),this.select,false,this.businessUnit,null);

		},
		onDateGradation:function(oEvent){
			this.date_f = this.getView().byId("DP_f");
	        this.date_t = this.getView().byId("DP_t");
	        var date = new Date();
	        		
			var buttonId = oEvent.getParameters().id.split("--");
			var gradiation;
			switch(buttonId[1]){
			case "day":
				gradiation = 0;
				this.selectedDateButton(buttonId[1]);
				if(!this.isDateChange){
					this.date_f.setValue(this.convertDate(new Date(date.getFullYear(), date.getMonth()+1, 1)));
					this.date_t.setValue(this.convertDate(new Date(date.getFullYear(), date.getMonth() + 2, 1)));
				}
				break;
			case "week":
				this.selectedDateButton(buttonId[1]);
				gradiation = 1;
				if(!this.isDateChange){
					this.date_f.setValue(this.convertDate(new Date(date.getFullYear(), date.getMonth()+1, 1)));
					this.date_t.setValue(this.convertDate(new Date(date.getFullYear(), date.getMonth() + 2, 1)));
				}
				break;
			case "month":
				this.selectedDateButton(buttonId[1]);
				gradiation = 2;
				// date = new Date("2017-01-25");
				var year_f,year_t,month_f,month_t;
				var gap = [1,2,3,10,11,12];
				if(!this.isDateChange){
					// console.info(date.getMonth());
					year_f = date.getFullYear();
					year_t = date.getFullYear();
					month_f = date.getMonth();
					month_t = date.getMonth();
					if(date.getMonth() < 3){year_f = date.getFullYear() - 1; month_f = gap[date.getMonth() + 3];}
					if(date.getMonth() > 8){year_t = date.getFullYear() + 1; month_t = gap[(date.getMonth() - 6)- 3];}
					this.date_f.setValue(this.convertDate(new Date(year_f,month_f-1, 1)));
					this.date_t.setValue(this.convertDate(new Date(year_t,month_t + 3, 1)));
				}
				break;
			case "quarter":
				this.selectedDateButton(buttonId[1]);
				gradiation = 3;
				if(!this.isDateChange){
					this.date_f.setValue(this.convertDate(new Date(date.getFullYear(),1, 1)));
					this.date_t.setValue(this.convertDate(new Date(date.getFullYear()+1,1, 1)));
				}
				break;
			case "year":
				this.selectedDateButton(buttonId[1]);
				gradiation = 4;
				if(!this.isDateChange){
					this.date_f.setValue(this.convertDate(new Date(date.getFullYear()-1,1, 1)));
					this.date_t.setValue(this.convertDate(new Date(date.getFullYear()+1,1, 1)));
				}
				break;
			}
			this.select = gradiation;
			this.initChart(this.date_f.getValue(),this.date_t.getValue(),gradiation,true,null,null);
		},
		convertDate:function(date){
   			var year = date.getFullYear();
			var month = date.getMonth();
			var day = date.getDate();
			
			return year+"-"+month+"-"+day;
   		},
   		onGrupChange:function(){
   			
   			
   			this.date_f = this.getView().byId("DP_f");
	        this.date_t = this.getView().byId("DP_t");
   			var selectedGroup = this.getView().byId("selectedGroup");
   			switch(selectedGroup.getSelectedItem().getProperty("key")){
   			case "1" :
   				this.initChart(this.date_f.getValue(),this.date_t.getValue(),this.select,true,null,null);
   				this.dateButtons(true);
   				this.groupByUnit = false;
   				break;
   			case "2" :
   				this.groupByUnit = true;
   				this.initChart(this.date_f.getValue(),this.date_t.getValue(),this.select,false,null,null);
   				this.dateButtons(false);
   				break;
   			}
   			
   		},
   		dateButtons:function(isActive){
   			var bDay = this.getView().byId("day");
   			var bWeek = this.getView().byId("week");
   			var bMonth = this.getView().byId("month");
   			var bQuarter = this.getView().byId("quarter");
   			var bYear = this.getView().byId("year");
   			
   			bDay.setEnabled(isActive);
   			bWeek.setEnabled(isActive);
   			bMonth.setEnabled(isActive);
   			bQuarter.setEnabled(isActive);
   			bYear.setEnabled(isActive);
   		},
   		selectedDateButton(selected){
   			var bDay = this.getView().byId("day");
   			var bWeek = this.getView().byId("week");
   			var bMonth = this.getView().byId("month");
   			var bQuarter = this.getView().byId("quarter");
   			var bYear = this.getView().byId("year");
   			
   			switch(selected){
   			case "day":
   				bDay.setActiveIcon("sap-icon://accept");
   				bDay.setEnabled(false);
   	   			bWeek.setEnabled(true);
   	   			bMonth.setEnabled(true);
   	   			bQuarter.setEnabled(true);
   	   			bYear.setEnabled(true);
   				break;
   			case "week":
   				bDay.setEnabled(true);
   	   			bWeek.setEnabled(false);
   	   			bMonth.setEnabled(true);
   	   			bQuarter.setEnabled(true);
   	   			bYear.setEnabled(true);
   				break;
   			case "month":
   				bDay.setEnabled(true);
   	   			bWeek.setEnabled(true);
   	   			bMonth.setEnabled(false);
   	   			bQuarter.setEnabled(true);
   	   			bYear.setEnabled(true);
   				break;
   			case "quarter":
   				bDay.setEnabled(true);
   	   			bWeek.setEnabled(true);
   	   			bMonth.setEnabled(true);
   	   			bQuarter.setEnabled(false);
   	   			bYear.setEnabled(true);
   				break;
   			case "year":
   				bDay.setEnabled(true);
   	   			bWeek.setEnabled(true);
   	   			bMonth.setEnabled(true);
   	   			bQuarter.setEnabled(true);
   	   			bYear.setEnabled(false);
   				break;
   			}
   		}
	});
});