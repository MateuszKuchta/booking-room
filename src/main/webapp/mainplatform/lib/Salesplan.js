sap.ui.define([
	 "sap/ui/base/Object"
], function(Object) {
	"use strict";
	return Object.extend("ecu.lib.Salesplan", {
      isRequested:false,
      constructor: function() {
        console.info("Sales Plan");
        },
        setQueryParam:function(date_f,date_t,gradation,isDate,businessUnit,region){
        	this.date_f = date_f;
        	this.date_t = date_t;
        	this.gradation = gradation;
        	this.isDate = isDate;
        	this.businessUnit = businessUnit;
        	this.region = region;
        },
        getModel:function(){
        	var where,groupby,orderby;
        	
        	if(this.isDate){
        		switch(this.gradation){
        		case 0:
        			where = "'s.day ='"+this.date_f+"''";
        			groupby = "'s.day'";
        			orderby = "'s.day'";
        			break;
        		}
        	};
        	
        	return this.readOdata(where,groupby,orderby);
        },
        readOdata:function(where,groupby,orderby){
    	  var oDataURL = "/ecu-web/ODataService.svc";
    	  var oModel = new sap.ui.model.json.JSONModel();
    	  var oData = new sap.ui.model.odata.v2.ODataModel({serviceUrl: oDataURL});
    	  var req = this.isRequested;
			
    	  oData.read("/GetSales?",{
				//GroupBy='sYear,month'&Between='2016-09-13'&And='2017-09-13'
				urlParameters:{
					"Where":where,
					"GroupBy":groupby,
					"OrderBy":orderby
				},
				success : function (oData,response) {	
                    oModel.setData(oData);
                    console.info(oModel.oData.results.length);
                    //można pracować na liście wyników
                    /*for (var i = 0; i < oModel.oData.results.length; i++){
                    	oModel.oData.results[i].Name = oModel.oData.results[i].Name + "Alo";
                    }*/
                    req = true;

                },
                error : function(oError){
                	console.info(oError);
                },
                uniqIndex: function(oModel){
                	console.info(oModel);
                }
			});
    	  
    	  return oModel;
        }
      
    });
});