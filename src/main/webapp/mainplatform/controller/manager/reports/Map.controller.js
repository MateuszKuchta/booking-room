sap.ui.define(["ecu/controller/BaseController",
	"ecu/controller/manager/reports/Locations",
	"ecu/controller/manager/reports/CirclesGenerator"
    ], function(BaseController,Locations,CirclesGenerator) {
    "use strict";
    return BaseController.extend("ecu.controller.manager.reports.Map", {
    	oLocations:null,
    	oGeoMap:null,
    	it:null,
    	count:1,
    	onInit: function(){

			var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("map"); //wskazać stronę w routingu
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data");
            }, this);

            
    		this.oGeoMap = this.getView().byId("GeoMap");
    		var view = this.getView();
    		this.oLocations = new Locations();	
			this.getOwnerComponent().getRouter().getRoute("map").attachPatternMatched(this._onRouteMatched, this);
			
			
			
    		var oMapConfig = {
    				"MapProvider": [{
			            "name": "Openstreetmap",
			            "copyright": "<b><a href='http://www.openstreetmap.org/copyright'>© openstreetmap</a></b>",
			            "Source": [{
			            	"id": "s1",
			            	"url": "http://a.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
			            	}, {
			            	"id": "s2",
			            	"url": "http://b.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
			            	}, {
				            "id": "s3",
				            "url": "http://c.tile.openstreetmap.org/{LOD}/{X}/{Y}.png"
				            }
			            	]
			        }],
			        "MapLayerStacks": [{
			                "name": "DEFAULT",
			                "MapLayer": {
			                        "name": "layer1",
			                        "refMapProvider": "Openstreetmap",
			                        "opacity": "1",
			                        "colBkgnd": "RGB(255,255,255)"
			                }
			        }]
    		};
    		this.oGeoMap.setMapConfiguration(oMapConfig);
    		this.oGeoMap.setRefMapLayerStack("DEFAULT");
    		this.oGeoMap.setInitialZoom(9);
  		  	
  		  	var list = this.getView().byId("buList");
  		  	
  		  	window.it = this;
  		  	var select = new sap.m.Select({
  		  		change:function(event,oListener){
  		  		//this.selectedKey = event.getSource().mProperties.selectedKey;
  		  		var key = event.getSource().mProperties.selectedKey;
  		  		window.it.centerPositon(key);
  		  			
  	    		//this.selectedKey = "B2";
  		  		}
  		  	});
  		  	for(var i = 0;i < this.oLocations.oData.location.length;i++){
  		  		select.addItem(new sap.ui.core.Item({
  		  			text:this.oLocations.oData.location[i].bu,
  		  			key:this.oLocations.oData.location[i].bu
  		  			
  		  		}));
  		  	}
  		  	list.addContent(select);

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
		_onRouteMatched: function(oEvent) {			
			var args = oEvent.getParameter("arguments");
			console.info(args.bu);
			this.centerPositon(args.bu);
			this.renderCircles(true);
			
		},
    	centerPositon : function(bu){
    		/*jQuery.ajax({
                url: "Location.json",
                dataType: "json",
                success: function(data, textStatus, jqXHR) {        
                //var jsonmodel = new sap.ui.model.json.JSONModel();
                //jsonmodel.setData(data);
                //view.setModel(jsonmodel,"Location");
                	oLocations = data;
                	//console.info(oLocations.location["0"]);
                   }});
    		console.info(oLocations);*/
    		var lat,lon;
    		var loc = this.oLocations.oData.location;
    		for(var i = 0; i < loc.length; i++){
    			if(loc[i].bu === bu){
    				lat = loc[i].lat;
    				lon = loc[i].lon;
    			}
    		}
    		console.info(lat+";"+lon);
    		this.oGeoMap.setCenterPosition(lat+";"+lon);
    	},
    	renderCircles:function(isCircle){
    		/*var oCircles = new sap.ui.vbm.GeoCircles();
    		var oCircle = new sap.ui.vbm.GeoCircle({
    			position : "14.5623779296875;53.42442784857192;0",
    			radius : 10000,
    			color : "rgba(92,186,230,0.6)"
    		});
    		oCircles.addItem(oCircle);
    		console.info(oCircles);*/
    		//this.oGeoMap.destroyLegend();
    		this.oGeoMap = this.getView().byId("GeoMap");
    		this.oLocations = new Locations();
    		var cg = new CirclesGenerator(this.oLocations,"Month");
    		this.oGeoMap.destroyVos();
    		
    		if (isCircle){
    			this.oGeoMap.addVo(cg.getGeoCircles());
        		this.oGeoMap.addVo(cg.getSpots());
    		} else {
    			this.oGeoMap.addVo(cg.getColumn());
    			this.oGeoMap.addVo(cg.getSpots());
    		}
    		
    		
    		//legenda
    		if(this.count == 1){
    			this.oGeoMap.setLegend(cg.getLegend());
    			this.count++;
    		}
    		
    	},
    	onCircles : function(){
    		this.renderCircles(true);
    	},
    	onColumns : function(){
    		this.renderCircles(false);
    	}
    });
});