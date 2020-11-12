/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/sun/qm5050testresult/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});