sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"../model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, History, formatter, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";
	var temp = [];
	return BaseController.extend("com.sun.qm5050testresult.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			this.i18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this._oModel = this.getOwnerComponent().getModel();
			//this.getView().getModel("testResult").setData([]);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		onButtonTestAgainPress: function (oEvent) {
			var oTestModel = this.getView().getModel("testResult");
			var oTestData = oTestModel.getData();
			var sPaths = this.byId("tableTestResult").getSelectedContextPaths();
			if (sPaths.length === 0) {
				MessageBox.error(this.i18nBundle.getText("selectALine"));
				return;
			}
			var iSelected = sPaths[0].split("/")[1];
			var oSelectedData = oTestData[iSelected];

			if (oSelectedData.New) {
				MessageBox.error(this.i18nBundle.getText("canNotUpdateNewLine"));
				return;
			}
			if (oSelectedData.Updated) {
				MessageBox.error(this.i18nBundle.getText("canNotCopyUpdatedLine"));
				return;
			}

			oTestData[iSelected].Status = this.i18nBundle.getText("excludedData");
			oTestData[iSelected].OutOfTolerance = "";
			oTestData[iSelected].VeriDisi = "X";
			oTestData[iSelected].Proccessed = "X";
			oTestData[iSelected].ColorStatus = "Over6";
			oTestData[iSelected].Onayli = "";
			oTestData[iSelected].ManuallyOut = "X";
			oTestData[iSelected].Flag = "X";

			if (oSelectedData.DinlenSonrasiBoy === "" || oSelectedData.DinlenSonrasiEn === "" || oSelectedData.FarkBoyCm === "" ||
				oSelectedData.FarkBoyYuzde === "" || oSelectedData.FarkEnCm === "" || oSelectedData.FarkEnYuzde === "") {
				MessageBox.error(this.i18nBundle.getText("fillInTheBlankFields"));
				return;
			}

			var realTestNo = parseFloat(oSelectedData.TopTestNo, 1);
			for (var i = 0; i < oTestData.length; i++) {
				if (oSelectedData.TestNo === oTestData[i].TestNo) {
					if (oTestData[i].TopTestNo > oSelectedData.TopTestNo) {
						realTestNo = oTestData[i].TopTestNo;
					}
				}

			}

			var sStr = {
				TestNo: oSelectedData.TestNo,
				Charg: oSelectedData.Charg,
				TopNo: oSelectedData.TopNo,
				//TopTestNo: parseFloat((oSelectedData.TopTestNo + 0.1).toFixed(1)),
				TopTestNo: (parseFloat(realTestNo) + 0.1).toFixed(1),
				TestTarihi: new Date(),
				UtuOncesiEn: "",
				UtuOncesiBoy: "",
				UtuSonrasiEn: "",
				UtuSonrasiBoy: "",
				DinlenSonrasiEn: "",
				DinlenSonrasiBoy: "",
				FarkEnCm: "",
				FarkBoyCm: "",
				FarkEnYuzde: "",
				FarkBoyYuzde: "",
				Updated: "X"

			};
			oTestData.push(sStr);
			this.getModel("testResult").setData(oTestData);
			this.getView().setModel(this.getModel("testResult"), "testResult");
			this.byId("tableTestResult").removeSelections(true);
		},
		onButtonAddPress: function (oEvent) {
			var oAppUtilData = this.getModel("appUtil").getData();
			var aGetData = this.getModel("testResult").getData();
			var cCount = 0;
			var cNewValue = 0;
			for (var i = 0; i < aGetData.length; i++) {
				cNewValue = parseInt(this.getModel("testResult").getData()[i].TestNo.split("-")[1], 10);
				if (cNewValue > cCount) {
					cCount = cNewValue;
				}
			}
			cCount++;
			var sStr = {
				TestNo: "",
				Charg: oAppUtilData.Charg,
				TopNo: "",
				TopTestNo: "",
				TestTarihi: new Date(),
				UtuOncesiEn: "",
				UtuOncesiBoy: "",
				UtuSonrasiEn: "",
				UtuSonrasiBoy: "",
				DinlenSonrasiEn: "",
				DinlenSonrasiBoy: "",
				FarkEnCm: "",
				FarkBoyCm: "",
				FarkEnYuzde: "",
				FarkBoyYuzde: "",
				New: "X",
				Flag: "X"

			};

			sStr.TestNo = oAppUtilData.StokId + "-" + cCount;
			sStr.TopNo = cCount;
			sStr.TopTestNo = parseFloat(cCount + ".1");

			var oTestModel = this.getView().getModel("testResult");
			var oTestData = oTestModel.getData();
			oTestData.push(sStr);
			this.getModel("testResult").setData(oTestData);
			this.getView().setModel(this.getModel("testResult"), "testResult");
			this.byId("tableTestResult").removeSelections(true);
		},
		onButtonDeletePress: function (oEvent) {
			var that = this;
			var sAppUtilData = this.getModel("appUtil").getData();
			var sPaths = this.byId("tableTestResult").getSelectedContextPaths();
			if (sPaths.length === 0) {
				MessageBox.error(this.i18nBundle.getText("selectALine"));
				return;
			}
			if (this.byId("tableTestResult").getSelectedContexts()[0].getObject("CanNotDelete") === "X") {
				MessageBox.error(this.i18nBundle.getText("canNotDelete"));
				return;
			}
			var aLine = sPaths[0].split("/")[1];

			var aRows = this.getModel("testResult").getData();
			aRows[aLine].TopTestNo = String(aRows[aLine].TopTestNo);
			//Ana testtop numarasının silinmemesi uyarısı
			if ((parseInt(aRows[aLine].TopTestNo.split(".")[0]) <= parseInt(sAppUtilData.Zztop)) &&
				parseInt(aRows[aLine].TopTestNo.split(".")[1]) === 1) {
				MessageBox.error(this.i18nBundle.getText("maintoptestno"));
				return;
			}

			aRows[aLine].Status = "Silinmiş";
			aRows[aLine].Silinmis = "X";
			aRows[aLine].Flag = "X";
			aRows[aLine].Onayli = "";
			temp = jQuery.extend(true, [], aRows);
			// temp = aRows;
			aRows.splice(aLine, 1);

			this.getModel("testResult").refresh();
			this.byId("tableTestResult").removeSelections(true);
		},
		onInputEntryChange: function (oEvent) {
			var aData = this.getModel("testResult").getData();
			for (var i = 0; i < aData.length; i++) {
				if (aData[i].ManuallyOut === "X" || aData[i].VeriDisi === true) {
					continue;
				}
				aData[i].FarkEnCm = (parseFloat(aData[i].UtuOncesiEn.replace(",", ".")) -
					parseFloat(aData[i].DinlenSonrasiEn.replace(",", "."))).toFixed(2);
				aData[i].FarkBoyCm = (parseFloat(aData[i].UtuOncesiBoy.replace(",", ".")) -
					parseFloat(aData[i].DinlenSonrasiBoy.replace(",", "."))).toFixed(2);

				// aData[i].FarkEnCm = ((aData[i].FarkEnCm) ? aData[i].FarkEnCm : "");
				// aData[i].FarkBoyCm = ((aData[i].FarkBoyCm) ? aData[i].FarkBoyCm : "");

				aData[i].FarkEnCm = ((isNaN(aData[i].FarkEnCm)) ? "" : aData[i].FarkEnCm);
				aData[i].FarkBoyCm = ((isNaN(aData[i].FarkBoyCm)) ? "" : aData[i].FarkBoyCm);

				aData[i].FarkEnYuzde = ((aData[i].FarkEnCm / parseFloat(aData[i].UtuOncesiEn.replace(",", "."))) * 100).toFixed(2);
				aData[i].FarkBoyYuzde = ((aData[i].FarkBoyCm / parseFloat(aData[i].UtuOncesiBoy.replace(",", "."))) * 100).toFixed(2);

				aData[i].FarkEnYuzde = ((isNaN(aData[i].FarkEnYuzde)) ? "" : aData[i].FarkEnYuzde);
				aData[i].FarkBoyYuzde = ((isNaN(aData[i].FarkBoyYuzde)) ? "" : aData[i].FarkBoyYuzde);

				if (aData[i].FarkEnYuzde !== "" && aData[i].FarkBoyYuzde !== "") {
					if ((parseFloat(aData[i].FarkEnYuzde) < 6 && parseFloat(aData[i].FarkEnYuzde) > -6) && (parseFloat(aData[i].FarkBoyYuzde) < 6 &&
							parseFloat(aData[i].FarkBoyYuzde) > -6)) {
						aData[i].Status = this.i18nBundle.getText("approved");
						aData[i].Onayli = "X";
						aData[i].Flag = "X";
						aData[i].ColorStatus = "Under6";
						aData[i].OutOfTolerance = "";
					} else {
						if (aData[i].Proccessed !== "X") {
							aData[i].OutOfTolerance = "X";
							aData[i].Flag = "X";
							aData[i].Onayli = "";
							aData[i].ColorStatus = "Over6";
							aData[i].Status = this.i18nBundle.getText("waitingApproval");
						}

					}
				}

			}
			this.getModel("testResult").setData(aData);
			this.getView().setModel(this.getModel("testResult"), "testResult");
		},
		onButtonOOTPress: function (oEvent) {
			var sDialogText = this.i18nBundle.getText("entryDataForOOT");
			var oDialog = this.byId("dialogOutOfTolerance");
			this.sSelectedPath = oEvent.getSource().getBindingContext("testResult").sPath;
			if (!oDialog) {
				// Create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.sun.qm5050testresult.view.fragment.OutOfTolerance", this);
				this.getView().addDependent(oDialog);
				jQuery.sap.syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), oDialog);
			}
			oDialog.setTitle(sDialogText);
			oDialog.open();
		},
		onDialogOOTButtonCancelPress: function (oEvent) {
			oEvent.getSource().getParent().close();
		},
		onDialogOOTTestAgainPress: function (oEvent) {
			var aData = this.getModel("testResult").getData();

			var oSelectedData = aData[this.sSelectedPath.split("/")[1]];
			var realTestNo = oSelectedData.TopTestNo;
			for (var i = 0; i < aData.length; i++) {
				if (oSelectedData.TestNo === aData[i].TestNo) {
					if (aData[i].TopTestNo > oSelectedData.TopTestNo) {
						realTestNo = aData[i].TopTestNo;
					}
				}

			}

			var sStr = {
				TestNo: oSelectedData.TestNo,
				Charg: oSelectedData.Charg,
				TopNo: oSelectedData.TopNo,
				//TopTestNo: parseFloat((oSelectedData.TopTestNo + 0.1).toFixed(1)),
				TopTestNo: (parseFloat(realTestNo) + 0.1).toFixed(1),
				TestTarihi: new Date(),
				UtuOncesiEn: "",
				UtuOncesiBoy: "",
				UtuSonrasiEn: "",
				UtuSonrasiBoy: "",
				DinlenSonrasiEn: "",
				DinlenSonrasiBoy: "",
				FarkEnCm: "",
				FarkBoyCm: "",
				FarkEnYuzde: "",
				FarkBoyYuzde: ""

			};
			aData[this.sSelectedPath.split("/")[1]].Status = this.i18nBundle.getText("excludedData");
			aData[this.sSelectedPath.split("/")[1]].VeriDisi = "X";
			aData[this.sSelectedPath.split("/")[1]].OutOfTolerance = "";
			aData[this.sSelectedPath.split("/")[1]].Proccessed = "X";
			aData[this.sSelectedPath.split("/")[1]].Flag = "X";
			aData.push(sStr);
			this.getModel("testResult").setData(aData);
			this.getView().setModel(this.getModel("testResult"), "testResult");
			this.byId("dialogOutOfTolerance").close();

		},
		onDialogOOTApprovePress: function (oEvent) {
			var aData = this.getModel("testResult").getData();
			aData[this.sSelectedPath.split("/")[1]].Status = this.i18nBundle.getText("approved");
			aData[this.sSelectedPath.split("/")[1]].OutOfTolerance = "";
			aData[this.sSelectedPath.split("/")[1]].Proccessed = "X";
			aData[this.sSelectedPath.split("/")[1]].Onayli = "X";
			aData[this.sSelectedPath.split("/")[1]].Flag = "X";
			this.getModel("testResult").setData(aData);
			this.getView().setModel(this.getModel("testResult"), "testResult");
			this.byId("dialogOutOfTolerance").close();
		},
		onDialogOOTExcludeDataPress: function (oEvent) {
			var aData = this.getModel("testResult").getData();
			aData[this.sSelectedPath.split("/")[1]].Status = this.i18nBundle.getText("excludedData");
			aData[this.sSelectedPath.split("/")[1]].OutOfTolerance = "";
			aData[this.sSelectedPath.split("/")[1]].VeriDisi = "X";
			aData[this.sSelectedPath.split("/")[1]].Proccessed = "X";
			aData[this.sSelectedPath.split("/")[1]].Flag = "X";
			this.getModel("testResult").setData(aData);
			this.getView().setModel(this.getModel("testResult"), "testResult");
			this.byId("dialogOutOfTolerance").close();
		},

		onButtonSavePress: function (oEvent) {
			var sText = "Ekran bu haliyle kaydedilecektir, onaylıyor musunuz?";
			var that = this;
			MessageBox.warning(sText, {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						that._savingData();
					}
				}
			});
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_onObjectMatched: function (oEvent) {
			this._getRecordResults();
			//this._calcResultLine();
			//var sObjectId = oEvent.getParameter("arguments").objectId;
			this.byId("tableTestResult").removeSelections(true);
		},
		_savingData: function () {
			var aLines = temp;
			if (temp.length === 0) {
				aLines = this.getModel("testResult").getData();
			}
			var sAppUtilData = this.getModel("appUtil").getData();
			var oModel = this.getView().getModel();
			// siparişteki vbelnleri arraye aktarma 
			var VbelnTable = [];
			var _st = new Object();
			var _st1 = new Object();
			var _st2 = new Object();
			var _st3 = new Object();
			var _st4 = new Object();
			if (sAppUtilData.Vbeln) {
				_st.Vbeln = sAppUtilData.Vbeln;
				VbelnTable.push(_st);
			}
			if (sAppUtilData.Vbeln2) {
				_st1.Vbeln = sAppUtilData.Vbeln2;
				VbelnTable.push(_st1);
			}
			if (sAppUtilData.Vbeln3) {
				_st2.Vbeln = sAppUtilData.Vbeln3;
				VbelnTable.push(_st2);
			}
			if (sAppUtilData.Vbeln4) {
				_st3.Vbeln = sAppUtilData.Vbeln4;
				VbelnTable.push(_st3);
			}
			if (sAppUtilData.Vbeln5) {
				_st4.Vbeln = sAppUtilData.Vbeln5;
				VbelnTable.push(_st4);
			}
			var that = this;
			var sStatus;
			var header = {},
				items = [];
			var _s = new Object();
			for (var j in aLines) {

				if (aLines[j].DinlenSonrasiBoy === "" && aLines[j].DinlenSonrasiEn === "" && aLines[j].UtuOncesiBoy === "" && aLines[j].UtuOncesiEn ===
					"" && aLines[j].UtuSonrasiBoy === "" &&
					aLines[j].UtuSonrasiEn === "" && aLines[j].Silinmis === "") {
					sStatus = "01";
					continue;
				}

				if ((aLines[j].DinlenSonrasiBoy === "" || aLines[j].DinlenSonrasiEn === "" || aLines[j].UtuOncesiBoy === "" || aLines[j].UtuOncesiEn ===
						"" || aLines[j].UtuSonrasiBoy === "" ||
						aLines[j].UtuSonrasiEn === "") && (aLines[j].Silinmis === "")) {
					MessageBox.error(this.i18nBundle.getText("missingFields"));
					return;
				}
			}
			for (var i in aLines) {
				if (aLines[i].Onayli !== "X") {
					//TO DO will be edited 
					if (!(aLines[j].DinlenSonrasiBoy === "" && aLines[j].DinlenSonrasiEn === "" && aLines[j].UtuOncesiBoy === "" && aLines[j].UtuOncesiEn ===
							"" && aLines[j].UtuSonrasiBoy === "" &&
							aLines[j].UtuSonrasiEn === "")) {
						if (aLines[i].VeriDisi === undefined || aLines[i].VeriDisi === "") {
							MessageBox.error(this.i18nBundle.getText("disapprovedLine"));
							return;
						}
					}

				}
				_s.TestNo = aLines[i].TestNo;
				_s.Charg = aLines[i].Charg;
				_s.TopNo = aLines[i].TopNo.toString();
				_s.TopTestNo = aLines[i].TopTestNo.toString();
				_s.TestTarihi = aLines[i].TestTarihi;
				_s.Vbeln = sAppUtilData.Vbeln;
				_s.Lgort = sAppUtilData.Lgort;
				_s.XblnrMkpf = sAppUtilData.XblnrMkpf;
				_s.UtuOncesiEn = (aLines[i].UtuOncesiEn.toString().replace(",", ".") ? aLines[i].UtuOncesiEn.toString().replace(",", ".") : "0");
				_s.UtuOncesiBoy = (aLines[i].UtuOncesiBoy.toString().replace(",", ".") ? aLines[i].UtuOncesiBoy.toString().replace(",", ".") : "0");
				_s.DinlenSonrasiEn = (aLines[i].DinlenSonrasiEn.toString().replace(",", ".") ? aLines[i].DinlenSonrasiEn.toString().replace(",",
					".") : "0");
				_s.DinlenSonrasiBoy = (aLines[i].DinlenSonrasiBoy.toString().replace(",", ".") ? aLines[i].DinlenSonrasiBoy.toString().replace(",",
					".") : "0");
				_s.UtuSonrasiEn = (aLines[i].UtuSonrasiEn.toString().replace(",", ".") ? aLines[i].UtuSonrasiEn.toString().replace(",", ".") : "0");
				_s.UtuSonrasiBoy = (aLines[i].UtuSonrasiBoy.toString().replace(",", ".") ? aLines[i].UtuSonrasiBoy.toString().replace(",", ".") :
					"0");
				_s.FarkEnCm = (aLines[i].FarkEnCm.toString().replace(",", ".") ? aLines[i].FarkEnCm.toString().replace(",", ".") : "0");
				_s.FarkBoyCm = (aLines[i].FarkBoyCm.toString().replace(",", ".") ? aLines[i].FarkBoyCm.toString().replace(",", ".") : "0");
				_s.FarkEnYuzde = (aLines[i].FarkEnYuzde.toString().replace(",", ".") ? aLines[i].FarkEnYuzde.toString().replace(",", ".") : "0");
				_s.FarkBoyYuzde = (aLines[i].FarkBoyYuzde.toString().replace(",", ".") ? aLines[i].FarkBoyYuzde.toString().replace(",", ".") : "0");
				// _s.UtuOncesiBoy = aLines[i].UtuOncesiBoy.toString().replace(",", ".");
				// _s.DinlenSonrasiEn = aLines[i].DinlenSonrasiEn.toString().replace(",", ".");
				// _s.DinlenSonrasiBoy = aLines[i].DinlenSonrasiBoy.toString().replace(",", ".");
				// _s.UtuSonrasiEn = aLines[i].UtuSonrasiEn.toString().replace(",", ".");
				// _s.UtuSonrasiBoy = aLines[i].UtuSonrasiBoy.toString().replace(",", ".");
				// _s.FarkEnCm = aLines[i].FarkEnCm.toString().replace(",", ".");
				// _s.FarkBoyCm = aLines[i].FarkBoyCm.toString().replace(",", ".");
				// _s.FarkEnYuzde = aLines[i].FarkEnYuzde.toString().replace(",", ".");
				// _s.FarkBoyYuzde = aLines[i].FarkBoyYuzde.toString().replace(",", ".");
				_s.Silinmis = ((aLines[i].Silinmis) ? true : false);
				_s.Onayli = ((aLines[i].Onayli) ? true : false);
				_s.VeriDisi = ((aLines[i].VeriDisi) ? true : false);
				_s.Flag = ((aLines[i].Flag) ? true : false);
				items.push(_s);
				_s = new Object();
			}
			header.Flag = "X";
			header.IvStatu = ((sStatus) ? sStatus : "02");
			header.to_Item = items;
			header.to_VbelnTable = VbelnTable;
			sap.ui.core.BusyIndicator.show(0);
			oModel.create("/SaveHeaders", header, {
				success: function (oData) {
					MessageToast.show(that.i18nBundle.getText("createdAndHomePage"));
					jQuery.sap.delayedCall(1800, that, function () {
						sap.ui.core.BusyIndicator.hide();
						that.getRouter().navTo("worklist", {}, true);
					});

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		_getRecordResults: function () {
			var oAppUtilData = this.getModel("appUtil").getData();
			var aFilters = [];
			var that = this;
			aFilters.push(
				new Filter("Charg", FilterOperator.EQ, oAppUtilData.Charg),
				new Filter("Vbeln", FilterOperator.EQ, oAppUtilData.Vbeln),
				new Filter("Lgort", FilterOperator.EQ, oAppUtilData.Lgort),
				new Filter("XblnrMkpf", FilterOperator.EQ, oAppUtilData.XblnrMkpf)
			);
			this._oModel.read("/RecordResults", {
				filters: aFilters,
				success: function (oData) {
					debugger;
					temp = oData.results;
					var aResults = oData.results;
					that.getModel("appUtil").setProperty("/TempData", oData.results);
					if (aResults.length > 0) {
						for (var i = 0; i < aResults.length; i++) {
							aResults[i].CanNotDelete = "X";
							aResults[i].Editable = false;
							if (aResults[i].VeriDisi) {
								aResults[i].ColorStatus = "Over6";
								aResults[i].Status = that.i18nBundle.getText("excludedData");
							}
							if (aResults[i].Onayli) {
								aResults[i].ColorStatus = "Under6";
								aResults[i].Status = that.i18nBundle.getText("approved");
							}
							if (!(aResults[i].VeriDisi) && !(aResults[i].Onayli) && !(aResults[i].UtuOncesiEn > 0)) {
								aResults[i].CanNotDelete = "";
								aResults[i].Editable = true;
								aResults[i].UtuOncesiEn = "";
								aResults[i].UtuOncesiBoy = "";
								aResults[i].UtuSonrasiEn = "";
								aResults[i].UtuSonrasiBoy = "";
								aResults[i].DinlenSonrasiEn = "";
								aResults[i].DinlenSonrasiBoy = "";
								aResults[i].FarkEnCm = "";
								aResults[i].FarkBoyCm = "";
								aResults[i].FarkEnYuzde = "";
								aResults[i].FarkBoyYuzde = "";
							}
							if (!(aResults[i].VeriDisi) && !(aResults[i].Onayli) && !(aResults[i].Silinmis) && (aResults[i].UtuOncesiEn > 0)) {
								aResults[i].Status = "Onay Bekliyor";
								aResults[i].OutOfTolerance = "X";
								aResults[i].ColorStatus = "Over6";
							}
						}
						that.getModel("testResult").setData(oData.results);
						that.getView().setModel(that.getModel("testResult"), "testResult");
					} else {
						that._calcResultLine();
					}

				},
				error: function (e) {}

			});

		},
		_calcResultLine: function () {
			var oAppUtilData = this.getModel("appUtil").getData();
			var aLines = [];
			var iTopValue;
			if (oAppUtilData.Spart === "DO" || oAppUtilData.Spart === "TR") {
				iTopValue = 1;
			} else {
				iTopValue = parseInt(oAppUtilData.Zztop, 10);
			}
			//var iTopValue = 3;
			for (var i = 1; i <= iTopValue; i++) {
				var sStr = {
					TestNo: "",
					Charg: oAppUtilData.Charg,
					TopNo: "",
					TopTestNo: "",
					TestTarihi: new Date(),
					UtuOncesiEn: "",
					UtuOncesiBoy: "",
					UtuSonrasiEn: "",
					UtuSonrasiBoy: "",
					DinlenSonrasiEn: "",
					DinlenSonrasiBoy: "",
					FarkEnCm: "",
					FarkBoyCm: "",
					FarkEnYuzde: "",
					FarkBoyYuzde: "",
					ColorStatus: "",
					CanNotDelete: "X",
					Flag: "X"

				};
				sStr.TestNo = oAppUtilData.StokId + "-" + i;
				sStr.TopNo = i;
				sStr.TopTestNo = parseFloat(i + ".1");
				aLines.push(sStr);
			}
			this.getModel("testResult").setData(aLines);
			this.getView().setModel(this.getModel("testResult"), "testResult");

		}

	});

});