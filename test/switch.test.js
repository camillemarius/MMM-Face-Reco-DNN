"use strict";
// Who is shown when several people come and go (single-user mode). Run: node --test test/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");

global.Log = { log () {}, info () {}, error () {} };
let def;
global.Module = { register: (name, d) => { def = d; } };
require("../MMM-Face-Reco-DNN.js");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function make () {
	const m = Object.assign(Object.create(def), {
		config: { ...def.defaults, logoutDelay: 20, multiUser: 0, unknownClass: "unknown", debug: false },
		users: [],
		timouts: {},
		sent: [],
		sendNotification (n, p) { this.sent.push(n); },
		updateDom () {}
	});
	m.login_user = function (name) { this.users.push(name); };
	m.logout_user = function (name) { this.users = this.users.filter((u) => u !== name); };
	return m;
}
const login = (m, ...users) => m.socketNotificationReceived("", { action: "login", users });
const logout = (m, ...users) => m.socketNotificationReceived("", { action: "logout", users });

test("a newly recognised person takes over right away", () => {
	const m = make();
	login(m, "Anna");
	login(m, "Ben");
	assert.deepEqual(m.users, ["Ben"]);
});

test("an unknown face does not push a recognised person away", () => {
	const m = make();
	login(m, "Anna");
	login(m, "unknown");
	assert.deepEqual(m.users, ["Anna"]);
});

test("a recognised person replaces an unknown face", () => {
	const m = make();
	login(m, "unknown");
	login(m, "Anna");
	assert.deepEqual(m.users, ["Anna"]);
});

test("when the newcomer leaves, the person still in front of the mirror comes back", async () => {
	const m = make();
	login(m, "Anna");
	login(m, "Ben");
	logout(m, "Ben");
	await sleep(60);
	assert.deepEqual(m.users, ["Anna"]);
});

test("whoever left stays away; nobody in front means nobody shown", async () => {
	const m = make();
	login(m, "Anna");
	login(m, "Ben");
	logout(m, "Anna");
	logout(m, "Ben");
	await sleep(60);
	assert.deepEqual(m.users, []);
});

test("back within the delay: stays logged in, no switch", async () => {
	const m = make();
	login(m, "Anna");
	logout(m, "Anna");
	login(m, "Anna");
	await sleep(60);
	assert.deepEqual(m.users, ["Anna"]);
});

const hold = (m, until, identifier = "ads") => m.notificationReceived("HOLD_LOGOUT", { until }, { identifier });

test("hold: the view stays up until a module's hold ends, even after the person left", async () => {
	const m = make();
	login(m, "Anna");
	hold(m, Date.now() + 150);
	logout(m, "Anna");
	await sleep(70);
	assert.deepEqual(m.users, ["Anna"], "logoutDelay is over, the hold is not");
	await sleep(150);
	assert.deepEqual(m.users, []);
});

test("hold released by the module: the normal logoutDelay applies", async () => {
	const m = make();
	login(m, "Anna");
	hold(m, Date.now() + 1000);
	hold(m, 0);
	logout(m, "Anna");
	await sleep(60);
	assert.deepEqual(m.users, []);
});

test("hold: one module releasing does not end another module's hold", async () => {
	const m = make();
	login(m, "Anna");
	hold(m, Date.now() + 150, "ads-ben");
	hold(m, 0, "ads-anna");
	logout(m, "Anna");
	await sleep(70);
	assert.deepEqual(m.users, ["Anna"]);
	await sleep(150);
});

test("hold: a newly recognised person still takes over at once", () => {
	const m = make();
	login(m, "Anna");
	hold(m, Date.now() + 1000);
	login(m, "Ben");
	assert.deepEqual(m.users, ["Ben"]);
});

test("hold: never longer than maxHold", async () => {
	const m = make();
	m.config.maxHold = 40;
	login(m, "Anna");
	hold(m, Date.now() + 60000);
	logout(m, "Anna");
	await sleep(120);
	assert.deepEqual(m.users, []);
});
