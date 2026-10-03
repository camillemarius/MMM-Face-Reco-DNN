"use strict";
// Which settings the recognition script gets from config.js. Run: node --test test/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

let started = null;
const load = Module._load;
Module._load = function (request, ...rest) {
	if (request === "node_helper") return { create: (d) => d };
	if (request === "python-shell") {
		return { PythonShell: function (script, options) { started = options; this.on = () => {}; this.end = () => {}; } };
	}
	if (request === "signal-exit") return () => {};
	return load.call(this, request, ...rest);
};
const helper = require("../node_helper.js");
Module._load = load;

function args (config) {
	started = null;
	helper.python_start.call(Object.assign(Object.create(helper), { name: "MMM-Face-Reco-DNN", config }));
	return started.args;
}

test("extendDatasetNames reaches the script as a comma separated list", () => {
	assert.ok(args({ extendDataset: true, extendDatasetNames: ["unknown"] }).includes("--extendDatasetNames=unknown"));
	assert.ok(args({ extendDataset: true, extendDatasetNames: ["unknown", "ben"] }).includes("--extendDatasetNames=unknown,ben"));
});

test("without extendDatasetNames every name is kept, as before", () => {
	assert.ok(args({ extendDataset: true }).includes("--extendDatasetNames="));
});

test("exposureValue reaches the script (camera exposure correction, e.g. 1 against backlight); default 0", () => {
	assert.ok(args({ exposureValue: 1 }).includes("--exposureValue=1"));
	assert.ok(args({ exposureValue: -0.5 }).includes("--exposureValue=-0.5"));
	assert.ok(args({}).includes("--exposureValue=0"));
});
