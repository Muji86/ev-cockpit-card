// Checks the adapters and the cost model without Home Assistant: node scripts/test.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;
const ctx = {};
new Function("ctx", readFileSync(root + "src/10-adapters.js", "utf8") + readFileSync(root + "src/20-energy.js", "utf8") +
  "\nctx.evcResolve=evcResolve;ctx.EvcModel=EvcModel;ctx.EVC_ADAPTERS=EVC_ADAPTERS;")(ctx);

// Tesla Fleet car named "My car": matched on translation keys
const reg = {}, add = (id, platform, tk, dev = "car1") => { reg[id] = { entity_id: id, platform, translation_key: tk, device_id: dev }; };
const T = ctx.EVC_ADAPTERS.tesla.keys;
add("sensor.mycar_battery_level", "tesla_fleet", T.battery);
add("number.mycar_charge_limit", "tesla_fleet", T.charge_limit);
add("lock.mycar_lock", "tesla_fleet", T.lock);
add("cover.mycar_froot", "tesla_fleet", T.frunk);          // renamed entity still found by key
add("cover.mycar_boot", "tesla_fleet", T.trunk);
add("lock.mycar_charge_cable_lock", "tesla_fleet", "charge_state_charge_port_latch");
add("sensor.other_thing", "hue", null, "lamp");
let r = ctx.evcResolve({ entities: reg }, { vehicle: "tesla", entities: {} });
assert.equal(r.deviceId, "car1");
assert.equal(r.entities.battery, "sensor.mycar_battery_level");
assert.equal(r.entities.frunk, "cover.mycar_froot");
assert.equal(r.entities.trunk, "cover.mycar_boot");
assert.equal(r.entities.lock, "lock.mycar_lock", "the door lock, not the charge cable lock");

// Overrides win
r = ctx.evcResolve({ entities: reg }, { vehicle: "tesla", entities: { battery: "sensor.mine" } });
assert.equal(r.entities.battery, "sensor.mine");

// Two Teslas: the configured one is used
add("sensor.car2_battery_level", "teslemetry", T.battery, "car2");
r = ctx.evcResolve({ entities: reg }, { vehicle: "tesla", device_id: "car2", entities: {} });
assert.equal(r.entities.battery, "sensor.car2_battery_level");

// Volkswagen through the MQTT bridge (German names), as on a real ID.4
const vw = {}, vdev = { id4: { manufacturer: "Volkswagen", model: "ID.4" }, powerwall: { manufacturer: "Tesla Energy" } };
const v = (id, dev = "id4") => { vw[id] = { entity_id: id, platform: "mqtt", translation_key: null, device_id: dev }; };
["sensor.vw_id_4_soc", "sensor.vw_id_4_reichweite", "select.vw_id_4_ladelimit", "sensor.vw_id_4_ladeleistung", "sensor.vw_id_4_restladezeit",
 "binary_sensor.vw_id_4_charging", "binary_sensor.vw_id_4_charger", "binary_sensor.vw_id_4_verriegelt", "binary_sensor.vw_id_4_klimatisierung",
 "button.vw_id_4_start_charging", "button.vw_id_4_laden_fortsetzen", "button.vw_id_4_laden_stoppen", "button.vw_id_4_klimatisierung_starten",
 "button.vw_id_4_klimatisierung_stoppen", "device_tracker.vw_id_4_position", "sensor.vw_id_4_kilometerstand",
 "button.vw_id_4_fahrzeug_synchronisieren", "binary_sensor.vw_id_4_something_open"].forEach(id => v(id));
v("sensor.home_battery_soc", "powerwall");   // another MQTT device with a "_soc" sensor must not be taken for the car
r = ctx.evcResolve({ entities: vw, devices: vdev }, { vehicle: "volkswagen", entities: {} });
assert.equal(r.deviceId, "id4");
assert.deepEqual(r.devices, ["id4"]);
const want = { battery: "sensor.vw_id_4_soc", range: "sensor.vw_id_4_reichweite", charge_limit: "select.vw_id_4_ladelimit",
  charger_power: "sensor.vw_id_4_ladeleistung", time_to_full: "sensor.vw_id_4_restladezeit", charging: "binary_sensor.vw_id_4_charging",
  charge_cable: "binary_sensor.vw_id_4_charger", lock: "binary_sensor.vw_id_4_verriegelt", climate: "binary_sensor.vw_id_4_klimatisierung",
  charge_start: "button.vw_id_4_start_charging", charge_stop: "button.vw_id_4_laden_stoppen", climate_start: "button.vw_id_4_klimatisierung_starten",
  climate_stop: "button.vw_id_4_klimatisierung_stoppen", location: "device_tracker.vw_id_4_position", odometer: "sensor.vw_id_4_kilometerstand",
  wake: "button.vw_id_4_fahrzeug_synchronisieren", something_open: "binary_sensor.vw_id_4_something_open" };
for (const [role, id] of Object.entries(want)) assert.equal(r.entities[role], id, role);
assert.equal(r.entities.charge_switch, undefined, "a button is not a switch");

// We Connect ID (English names)
const wc = {};
["sensor.id4_state_of_charge", "sensor.id4_range", "sensor.id4_charging_state", "number.id4_target_state_of_charge", "device_tracker.id4_position"]
  .forEach(id => { wc[id] = { entity_id: id, platform: "volkswagen_we_connect_id", translation_key: null, device_id: "wc" }; });
r = ctx.evcResolve({ entities: wc }, { vehicle: "volkswagen", entities: {} });
assert.equal(r.entities.battery, "sensor.id4_state_of_charge");
assert.equal(r.entities.charge_limit, "number.id4_target_state_of_charge");

// Cost model: off-peak window across midnight, battery shifts peak usage
const M = ctx.EvcModel;
assert.ok(M.inWindow(23, 23, 6) && M.inWindow(2, 23, 6) && !M.inWindow(12, 23, 6));
const day = Array.from({ length: 24 }, (_, h) => ({ hour: h, home: 1, car: h === 1 ? 10 : 0 }));
const tariff = { off: 0.1, peak: 0.3, s: 0, e: 5, standing: 0.5 };
const plain = M.dayCost(day, tariff, null, null);
assert.equal(Math.round(plain.cost * 100), Math.round((15 * 0.1 + 19 * 0.3 + 0.5) * 100));
const withBatt = M.dayCost(day, tariff, { usable: 10, eff: 0.9, kw: 5 }, null);
assert.ok(withBatt.cost < plain.cost, "a battery should lower the bill");

console.log("All checks passed");
