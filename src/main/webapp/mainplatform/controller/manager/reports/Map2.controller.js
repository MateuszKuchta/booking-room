sap.ui.define(["ecu/controller/BaseController",
	"ecu/controller/manager/reports/Locations",
	 "sap/suite/ui/microchart/RadialMicroChart",
	 'ecu/lib/oDate',
	 'ecu/lib/QueryGenerator',
	 "ecu/controller/manager/SaleFormatter",
	 "ecu/controller/manager/reports/MapRadial",
    ], function(BaseController,Locations,RadialMicroChart,oDate,QueryGenerator,SaleFormatter,MapRadial) {
    "use strict";
    return BaseController.extend("ecu.controller.manager.reports.Map2", {
    	oLocations:null,
    	oGeoMap:null,
    	it:null,
    	onInit : function(){
    		var oRouter, oTarget;
            oRouter = this.getRouter();
            oTarget = oRouter.getTarget("map"); //wskazać stronę w routingu
            oTarget.attachDisplay(function (oEvent) {
                this._oData = oEvent.getParameter("data");
            }, this);
            
    		this.oGeoMap = this.getView().byId("GeoMap");
    		this.oGeoMap.setInitialZoom(6);
			this.oGeoMap.setCenterPosition("19.479745;52.068812");
			
    		
    		var view = this.getView();
    		this.oLocations = new Locations();	
    		this.getOwnerComponent().getRouter().getRoute("map2").attachPatternMatched(this._onRouteMatched, this);
    			
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
    		
    		//legenda dla mapy  	
    	  	/*var list = this.getView().byId("buList");
    	  	
    	  	window.it = this;
    	  	var select = new sap.m.Select({
    	  		change:function(event,oListener){
    	  		var key = event.getSource().mProperties.selectedKey;
    	  		window.it.centerPositon(key);
    	  		}
    	  	});
    	  	for(var i = 0;i < this.oLocations.oData.location.length;i++){
    	  		select.addItem(new sap.ui.core.Item({
    	  			text:this.oLocations.oData.location[i].bu,
    	  			key:this.oLocations.oData.location[i].bu
    	  			
    	  		}));
    	  	}
    	  	list.addContent(select);*/
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
			
			this.oGeoMap.attachZoomChanged(function(event){
				this.destroyVos();
				var mapRadial = new MapRadial(this.getZoomlevel());
				this.addVo(mapRadial.getGeoContainers());
			});

				
				
		}
    });
});