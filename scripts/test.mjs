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

// Battery level → kWh: 56% → 80% over the night is 24% of 77 kWh, plus 10% charging losses
const soc = [56, 56, 59, 62, 65, 68, 71, 74, 77, 80, 80, 79].map((mean, i) => ({ start: i * 3600e3, mean }));
const kwh = M.socToKwh(soc, 77, 0.9), total = Object.values(kwh).reduce((a, b) => a + b, 0);
assert.ok(Math.abs(total - 0.24 * 77 / 0.9) < 0.01, "SoC rise turns into wall kWh");
assert.equal(kwh[11 * 3600e3], 0, "a falling battery level is not charging");
// The hour's highest level tracks the rise without the half-hour lag of the mean (20–21 Nov, a real ID.4)
const night = [[75, 75], [75.66, 76], [78.34, 79], [79.53, 80], [75.9, 80]].map(([mean, max], i) => ({ start: i * 3600e3, mean, max }));
const byMax = M.socToKwh(night, 77, 0.9);
assert.ok(Math.abs(byMax[1 * 3600e3] - 0.01 * 77 / 0.9) < 0.01 && Math.abs(byMax[2 * 3600e3] - 0.03 * 77 / 0.9) < 0.01, "rise counted in the hour it happened");

// Charging reported an hour late moves back to the hour the meter saw it (20–21 Nov: 5% of 77 kWh ≈ 4.3 kWh)
const al = M.alignToMeter([{ car: 0.86, meter: 2.43 }, { car: 2.57, meter: 1.53 }, { car: 0.86, meter: 0.98 }]);
assert.ok(Math.abs(al.reduce((a, h) => a + h.car, 0) - 4.29) < 0.01, "nothing lost");
assert.ok(al.every(h => h.car <= h.meter + 1e-9), "never more than the meter");

// Supplier slots: a later figure for the same half-hour replaces the earlier one; slots add up per hour
const dh = M.dispatchHours([
  { completed_dispatches: [{ start: "2026-11-25T00:00:00+00:00", charge_in_kwh: -1.2 }] },
  { completed_dispatches: [{ start: "2026-11-25T00:00:00+00:00", charge_in_kwh: -1.3 }, { start: "2026-11-25T00:30:00+00:00", charge_in_kwh: -1.2 }] },
]);
assert.ok(Math.abs(dh[Date.parse("2026-11-25T00:00:00Z")] - 2.5) < 1e-9, "revised slot + second slot in the same hour");

// Real off-peak hours from the hourly cost: 6.66p and 36.46p, and the standing-charge hour is ignored
const edf = { offpeak_rate: 0.0666, peak_rate: 0.3646 };
assert.equal(M.offFromCost(0.0666 * 2, 2, edf), true);
assert.equal(M.offFromCost(0.3646 * 2, 2, edf), false);
assert.equal(M.offFromCost(0.0666 * 0.4 + 0.51835, 0.4, edf), null, "hour carrying the standing charge falls back to the window");
assert.equal(M.offFromCost(0.1, 0, edf), null);
// A Smart Charge slot at 06:00 is off-peak on the real tariff, but not in the fixed 23:00–06:00 window
const slot = { hour: 6, home: 1, car: 7, off: true };
const real = M.dayCost([slot], { off: 0.0666, peak: 0.3646, s: 23, e: 6, standing: 0, actual: true }, null, null);
const fixed = M.dayCost([slot], { off: 0.0666, peak: 0.3646, s: 23, e: 6, standing: 0 }, null, null);
assert.ok(real.cost < fixed.cost, "Smart Charge slot priced off-peak");

// Battery shortfall: 10 kWh usable at 3 kW; a peak of 4 kWh/h for 5 h runs out in hour 4 and is over the inverter every hour
const busy = Array.from({ length: 24 }, (_, h) => ({ hour: h, home: h >= 17 && h < 22 ? 4 : 0.2, car: 0 }));
const tf = { off: 0.1, peak: 0.3, s: 0, e: 5, standing: 0 };
const bd = M.dayCost(busy, tf, { usable: 10, eff: 0.9, kw: 3 }, null);
assert.equal(bd.emptyAt, 19, "2.4 kWh used by 17:00, then 3 kW: runs out at 19:00");
assert.ok(Math.abs(bd.battUsed - 10) < 1e-9, "uses all of it");
assert.ok(Math.abs(bd.gridEmpty + bd.gridPower + bd.battUsed - bd.peakHome) < 1e-9, "every peak kWh is accounted for");
assert.equal(bd.overHours, 5, "every evening hour asks for more than 3 kW");
assert.ok(Math.abs(bd.gridPower - 5) < 1e-9, "1 kWh over the inverter in each of them");
const sf = M.shortfall({ a: busy, b: busy.map(x => ({ ...x, home: 0.3 })) }, tf, { usable: 10, eff: 0.9, kw: 3 });
assert.equal(sf.n, 2); assert.equal(sf.covered, 1); assert.equal(sf.emptyDays, 1); assert.equal(sf.typicalEmpty, 19);
// A short off-peak window can't fill a big battery through a small inverter
const short = M.dayCost(busy, { ...tf, e: 1 }, { usable: 15, eff: 0.9, kw: 3 }, null);
assert.ok(short.battUsed <= 3 * 0.9 + 1e-9, "only what one off-peak hour can charge");

console.log("All checks passed");
