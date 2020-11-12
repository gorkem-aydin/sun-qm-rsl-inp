sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ushell/services/AppConfiguration",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, config, MessageBox) {
	"use strict";

	return BaseController.extend("com.sun.qm5050testresult.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// var oViewModel = new JSONModel({
			// 	vbeln: "",
			// 	lgort: "",
			// 	zztop: ""
			// });
			// this.setModel(oViewModel, "objectView");
			this._oModel = this.getOwnerComponent().getModel();
			this.getRouter().getRoute("worklist").attachPatternMatched(this._onWorkListMatched, this);
			this._takeLgortData();

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onTestResultBeforeRebindTable: function (oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			var newFilter = new sap.ui.model.Filter("IvLgort", sap.ui.model.FilterOperator.EQ, this.byId("inputLgort").getValue());
			mBindingParams.filters.push(newFilter);
		},
		onDetailTestResult: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var oAppUtilModel = this.getModel("appUtil");
			oAppUtilModel.setProperty("/Vbeln", oContext.getProperty("Vbeln"));
			oAppUtilModel.setProperty("/Vbeln2", oContext.getProperty("Vbeln2"));
			oAppUtilModel.setProperty("/Vbeln3", oContext.getProperty("Vbeln3"));
			oAppUtilModel.setProperty("/Vbeln4", oContext.getProperty("Vbeln4"));
			oAppUtilModel.setProperty("/Vbeln5", oContext.getProperty("Vbeln5"));
			oAppUtilModel.setProperty("/Lgort", oContext.getProperty("Lgort"));
			oAppUtilModel.setProperty("/Zztop", oContext.getProperty("Zztop20"));
			oAppUtilModel.setProperty("/StokId", oContext.getProperty("StokId"));
			oAppUtilModel.setProperty("/Charg", oContext.getProperty("Charg"));
			oAppUtilModel.setProperty("/XblnrMkpf", oContext.getProperty("XblnrMkpf"));
			oAppUtilModel.setProperty("/Spart", oContext.getProperty("Spart"));
			this._getRecordDetails();
		},

		onDialogButtonCancelPress: function (oEvent) {
			oEvent.getSource().getParent().close();

		},
		onDialogButtonAddDefinePress: function (oEvent) {
			var oCreateData = {};
			var that = this;
			var oAppUtilModel = this.getModel("appUtil").getData();
			//var oObjectData = this.getModel("objectView").getData();
			oCreateData.Vbeln = oAppUtilModel.Vbeln;
			oCreateData.Vbeln2 = oAppUtilModel.Vbeln2;
			oCreateData.Vbeln3 = oAppUtilModel.Vbeln3;
			oCreateData.Vbeln4 = oAppUtilModel.Vbeln4;
			oCreateData.Vbeln5 = oAppUtilModel.Vbeln5;
			oCreateData.Lgort = oAppUtilModel.Lgort;
			oCreateData.SerimSekli = this.byId("selectSerimSekli").getSelectedKey();
			oCreateData.KesimSekli = this.byId("selectKesimSekli").getSelectedKey();
			oCreateData.IsilIslem = this.byId("selectIsilIslem").getSelectedKey();
			oCreateData.UtuYontemi = this.byId("selectUtuYontemi").getSelectedKey();
			oCreateData.UrunBoyu = this.byId("selectUrunBoyu").getSelectedKey();

			this._oModel.create("/AddNewRecords", oCreateData, {
				success: function (oData) {
					if (oData.EvSonuc === "S") {

						that._getRecordDetails();
					} else {
						//wrong value
					}
				},
				error: function (oErr) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_getRecordDetails: function () {
			var oAppUtilMdl = this.getModel("appUtil").getData();
			//var oObjectData = this.getModel("objectView").getData();
			var that = this;
			var sPath =
				"/RecordDetails(" +
				"IvVbeln='" + oAppUtilMdl.Vbeln + "'," +
				"IvLgort='" + oAppUtilMdl.Lgort + "'" +
				")";

			this._oModel.read(sPath, {
				success: function (oData) {
					if (oData.EvSonuc === "S") {
						//routing
						var oAppUtilModel = that.getModel("appUtil");
						oAppUtilModel.setProperty("/IsilIslem", oData.IsilIslem);
						oAppUtilModel.setProperty("/IsilIslemTxt", oData.IsilIslemTxt);
						oAppUtilModel.setProperty("/Lgort", oData.IvLgort);
						oAppUtilModel.setProperty("/Vbeln", oData.IvVbeln);
						oAppUtilModel.setProperty("/KesimSekli", oData.KesimSekli);
						oAppUtilModel.setProperty("/KesimSekliTxt", oData.KesimSekliTxt);
						oAppUtilModel.setProperty("/SerimSekli", oData.SerimSekli);
						oAppUtilModel.setProperty("/SerimSekliTxt", oData.SerimSekliTxt);
						oAppUtilModel.setProperty("/UrunBoyu", oData.UrunBoyu);
						oAppUtilModel.setProperty("/UrunBoyuTxt", oData.UrunBoyuTxt);
						oAppUtilModel.setProperty("/UtuYontemi", oData.UtuYontemi);
						oAppUtilModel.setProperty("/UtuYontemiTxt", oData.UtuYontemiTxt);
						that.getRouter().navTo("object", {
							objectId: oAppUtilMdl.Vbeln
						});
					} else {
						that._addNewRecord();
						//new define
					}
				},
				error: function (oError) {

				}
			});
		},
		_addNewRecord: function () {
			var sDialogText = "50X50 Testi sonuç girişi";
			var oDialog = this.byId("dialogAddDefine");
			if (!oDialog) {
				// Create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.sun.qm5050testresult.view.fragment.AddNewDefine", this);
				this.getView().addDependent(oDialog);
				jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), oDialog);
			}
			oDialog.setTitle(sDialogText);
			oDialog.open();

		},
		_takeLgortData: function () {
			//this._oModel

			var that = this;
			var sPath =
				"/Vh_DefaultStorageSet('')";

			this._oModel.read(sPath, {
				success: function (oData) {
					if (oData.EvHata) {
						MessageBox.error(oData.EvMessage);
					} else {
						that.byId("inputLgort").setValue(oData.EvParva);
					}
				},
				error: function (oError) {

				}
			});
		},
		_onWorkListMatched: function (oEvent) {
			jQuery.sap.delayedCall(100, this, "_setFullWidth", [this]);
			this._startupParameters = this._getMyComponent().getComponentData().startupParameters;
			var oBindItems = this.byId("tableTestList").getBinding("items");
			if (oBindItems !== undefined) {
				oBindItems.refresh(true);
			}
		},
		_setFullWidth: function () {
			config.setApplicationFullWidth(true);
		},
		_getMyComponent: function () {
			"use strict";
			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			return sap.ui.component(sComponentId);
		}
	});
});