sap.ui.define([ "sap/ui/base/Object" ], function(Object) {
	"use strict";
	return Object.extend("ecu.lib.QueryGenerator", {
		Where : null,
		GroupBy : null,
		OrderBy : null,
		constructor : function(date_f, date_t, gradation, isDate, businessUnit,
				region) {
			this.gradation = gradation;
			this.generate(date_f, date_t, gradation, isDate, businessUnit,
					region);
			//console.info(this.Where);
		},
		generate : function(date_f, date_t, gradation, isDate, businessUnit,
				region) {

			if (isDate) {
				this.byDate(gradation, date_f, date_t);
			} else {
				this.byGroup(date_f, date_t, businessUnit,region);
			}
		},
		byDate : function(gradation, date_f, date_t) {

			switch (gradation) {
			case 0:
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "''";
				this.GroupBy = "'s.day'";
				this.OrderBy = "'s.day'";
				break;
			case 1:
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "''";
				this.GroupBy = "'s.week,s.sYear'";
				this.OrderBy = "'s.week,s.sYear'";
				break;
			case 2:
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "''";
				this.GroupBy = "'s.month,s.sYear'";
				this.OrderBy = "'s.month,s.sYear'";
				break;
			case 3:
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "''";
				this.GroupBy = "'s.quarter,s.sYear'";
				this.OrderBy = "'s.quarter,s.sYear'";
				break;
			case 4:
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "''";
				this.GroupBy = "'s.sYear'";
				this.OrderBy = "'s.sYear'";
				break;
			}
		},
		byGroup : function(date_f, date_t, businessUnit, region) {
			//console.info(businessUnit+" and "+region);
			if (businessUnit === null && region === null) {
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "''";
				this.GroupBy = "'s.businnesUnit'";
				this.OrderBy = "'s.businnesUnit'";
			}
			if (businessUnit !== null && region === null) {
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "' AND s.businnesUnit ='" + businessUnit + "''";
				this.GroupBy = "'s.region'";
				this.OrderBy = "'s.region'";
			}
			if (businessUnit !== null && region !== null) {
				this.Where = "'s.date BETWEEN '" + date_f + "' AND '" + date_t
						+ "' AND s.businnesUnit ='" + businessUnit
						+ "' AND s.region ='" + region + "''";
				this.GroupBy = "'s.region'";
				this.OrderBy = "'s.region'";
			}
		}
	});
});