sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		// App Utility Model
		createAppUtilModel: function () {
			var oModel = new JSONModel({
				IsilIslem: "",
				Lgort: "",
				Vbeln: "",
				KesimSekli: "",
				SerimSekli: "",
				UrunBoyu: "",
				UtuYontemi: ""

			});
			return oModel;
		},
		testResultModel: function () {
			var oModel = new JSONModel([]);
			return oModel;
		},
			testResultModel1: function () {
			var oModel = new JSONModel([]);
			return oModel;
		}

	};
});