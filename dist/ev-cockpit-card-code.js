/*! EV Cockpit Card 0.3.0 | MIT | https://github.com/Muji86/ev-cockpit-card */
(function(){
// ---- 10-adapters.js ----
// ── Vehicle adapters ─────────────────────────────────────────────
// An adapter tells the card which Home Assistant entities hold each piece of car data
// ("roles"). Entities are matched on the integration (platform) and the entity's
// translation_key, which stays the same whatever the car is called and in every language.
// If an entity has no translation_key, the English entity_id ending is tried instead.
// Any role can be set by hand in the card config under `entities:`.
//
// To add a make: add an entry to EVC_ADAPTERS with its platforms and keys (see CONTRIBUTING.md).

const EVC_ROLES = {
  battery: "Battery level (%)",
  range: "Battery range",
  charging: "Charging state",
  charger_power: "Charger power (kW)",
  energy_added: "Energy added this session (kWh)",
  time_to_full: "Time to full charge",
  charger_current: "Charger current (A)",
  charger_voltage: "Charger voltage (V)",
  charge_limit: "Charge limit (number, %)",
  charge_current: "Charge current (number, A)",
  charge_switch: "Charging on/off (switch)",
  charge_port: "Charge port door (cover)",
  charge_cable: "Charge cable connected (binary sensor)",
  lock: "Door lock (lock)",
  sentry: "Sentry / alarm mode (switch)",
  climate: "Cabin climate (climate)",
  defrost: "Defrost (switch)",
  inside_temp: "Inside temperature",
  outside_temp: "Outside temperature",
  frunk: "Front trunk (cover)",
  trunk: "Boot / trunk (cover)",
  windows: "Windows (cover)",
  seat_left: "Driver seat heater (select)",
  seat_right: "Passenger seat heater (select)",
  wheel_heater: "Steering wheel heater (select)",
  location: "Location (device tracker)",
  flash: "Flash lights (button)",
  honk: "Honk horn (button)",
  wake: "Wake (button)",
  online: "Online (binary sensor)",
  update: "Software update",
  odometer: "Odometer",
  charge_start: "Start charging (button)",
  charge_stop: "Stop charging (button)",
  climate_start: "Start climate (button)",
  climate_stop: "Stop climate (button)",
  something_open: "Something open (binary sensor)",
};

const EVC_ADAPTERS = {
  tesla: {
    name: "Tesla",
    platforms: ["tesla_fleet", "teslemetry", "tessie"],
    keys: {
      battery: "charge_state_battery_level",
      range: "charge_state_battery_range",
      charging: "charge_state_charging_state",
      charger_power: "charge_state_charger_power",
      energy_added: "charge_state_charge_energy_added",
      time_to_full: "charge_state_minutes_to_full_charge",
      charger_current: "charge_state_charger_actual_current",
      charger_voltage: "charge_state_charger_voltage",
      charge_limit: "charge_state_charge_limit_soc",
      charge_current: "charge_state_charge_current_request",
      charge_switch: "charge_state_user_charge_enable_request",
      charge_port: "charge_state_charge_port_door_open",
      charge_cable: "charge_state_conn_charge_cable",
      lock: "vehicle_state_locked",
      sentry: "vehicle_state_sentry_mode",
      climate: "driver_temp",
      defrost: "climate_state_defrost_mode",
      inside_temp: "climate_state_inside_temp",
      outside_temp: "climate_state_outside_temp",
      frunk: "vehicle_state_ft",
      trunk: "vehicle_state_rt",
      windows: "windows",
      seat_left: "climate_state_seat_heater_left",
      seat_right: "climate_state_seat_heater_right",
      wheel_heater: "climate_state_steering_wheel_heat_level",
      location: "location",
      flash: "flash_lights",
      honk: "honk",
      wake: "wake",
      online: "state",
      update: "vehicle_state_software_update_status",
      odometer: "vehicle_state_odometer",
    },
    // English entity_id endings, used only when an entity has no translation_key
    suffixes: {
      battery: "battery_level", range: "battery_range", charging: "charging", charger_power: "charger_power",
      energy_added: "charge_energy_added", time_to_full: "time_to_full_charge", charger_current: "charger_current",
      charger_voltage: "charger_voltage", charge_limit: "charge_limit", charge_current: "charge_current",
      charge_switch: "charge", charge_port: "charge_port_door", charge_cable: "charge_cable", lock: "lock",
      sentry: "sentry_mode", climate: "climate", defrost: "defrost", inside_temp: "inside_temperature",
      outside_temp: "outside_temperature", frunk: ["frunk", "froot", "front_trunk"], trunk: ["trunk", "boot"], windows: "windows",
      seat_left: "seat_heater_front_left", seat_right: "seat_heater_front_right", wheel_heater: "steering_wheel_heater",
      location: "location", flash: "flash_lights", honk: "honk_horn", wake: "wake", online: "status",
      update: "update", odometer: "odometer",
    },
    images: { scene: "tesla/scene", side: "tesla/side", xray: "tesla/xray" },
    // Where the car sits in the scene photo (photo pixels), so the card can frame it
    sceneCar: { w: 1310, h: 490, cx: 640, carW: 800, roof: 72, tyres: 440 },
    model: "Tesla",
  },
  // Volkswagen ID. family (ID.3, ID.4, ID.5, ID.7, ID. Buzz). Works with:
  //  - an MQTT bridge that publishes the car as a "Volkswagen" device with German entity names
  //    (sensor.<car>_soc, select.<car>_ladelimit, button.<car>_laden_stoppen…), checked against a real ID.4;
  //  - the community "Volkswagen We Connect ID" and "Volkswagen Car-Net" integrations (English names; not yet
  //    checked against a real car).
  // None of these set translation keys, so entities are matched on the end of their entity_id.
  volkswagen: {
    name: "Volkswagen ID.",
    platforms: ["volkswagen_we_connect_id", "volkswagencarnet", "mqtt"],
    manufacturers: ["volkswagen", "vw"],   // MQTT devices must be a Volkswagen
    keys: {},
    suffixes: {
      battery: ["state_of_charge", "soc"],
      range: ["range", "reichweite"],
      charging: ["charging_state", "charging"],
      charger_power: ["charge_power", "ladeleistung"],
      time_to_full: ["remaining_charging_time", "restladezeit"],
      charge_limit: ["target_state_of_charge", "ladelimit"],
      charge_current: ["max_charge_current_ac"],
      charge_switch: ["charging"],
      charge_start: ["start_charging", "laden_starten", "laden_fortsetzen"],
      charge_stop: ["stop_charging", "laden_stoppen"],
      charge_cable: ["plug_connection_state", "charger", "kabel"],
      lock: ["door_lock", "verriegelt"],
      climate: ["climatisation", "klimatisierung"],
      climate_start: ["start_climate", "klimatisierung_starten"],
      climate_stop: ["stop_climate", "klimatisierung_stoppen"],
      inside_temp: ["inside_temperature"],
      outside_temp: ["outside_temperature"],
      location: ["position"],
      odometer: ["odometer", "kilometerstand"],
      wake: ["fahrzeug_synchronisieren", "refresh_data"],
      something_open: ["something_open", "doors_open"],
    },
    wakeLabel: "Sync with car",
    images: { scene: "volkswagen/scene", side: "volkswagen/side", xray: "volkswagen/xray" },
    sceneCar: { w: 1310, h: 490, cx: 640, carW: 800, roof: 65, tyres: 445 },
    model: "Volkswagen ID.",
  },
  generic: {
    name: "Other car (choose entities)",
    platforms: [],
    keys: {},
    suffixes: {},
    images: {},
    sceneCar: null,
    model: "Electric car",
  },
};

// Which entity types each role may be. Read-only alternatives (a lock or climate reported only by a
// binary sensor) are allowed; the card then shows the state and uses buttons where the car has them.
const EVC_DOMAINS = {
  charging: ["sensor", "binary_sensor"], charge_limit: ["number", "select"], charge_current: ["number", "select"],
  charge_switch: ["switch"], charge_start: ["button"], charge_stop: ["button"], charge_port: ["cover"], charge_cable: ["binary_sensor"],
  lock: ["lock", "binary_sensor"], sentry: ["switch"], climate: ["climate", "binary_sensor", "switch"], climate_start: ["button"], climate_stop: ["button"],
  defrost: ["switch"], frunk: ["cover"], trunk: ["cover"], windows: ["cover"], seat_left: ["select"], seat_right: ["select"], wheel_heater: ["select"],
  location: ["device_tracker"], flash: ["button"], honk: ["button"], wake: ["button"], online: ["binary_sensor"], update: ["update"],
  something_open: ["binary_sensor"], battery: ["sensor"], range: ["sensor"], charger_power: ["sensor"], energy_added: ["sensor"],
  time_to_full: ["sensor"], charger_current: ["sensor"], charger_voltage: ["sensor"], inside_temp: ["sensor"], outside_temp: ["sensor"], odometer: ["sensor"],
};
const evcDomainOk = (role, id) => { const d = EVC_DOMAINS[role]; return !d || d.includes(id.split(".")[0]); };

// Map roles to entities on one device
function evcMatch(adapter, onDevice) {
  const entities = {};
  Object.keys(EVC_ROLES).forEach(role => {
    const key = adapter.keys[role];
    let hit = key && onDevice.find(e => e.translation_key === key && evcDomainOk(role, e.entity_id));
    const sufs = [].concat(adapter.suffixes[role] || []);
    for (const s of sufs) {
      if (hit) break;
      hit = onDevice.find(e => (!key || !e.translation_key) && e.entity_id.endsWith("_" + s) && evcDomainOk(role, e.entity_id));
    }
    if (hit) entities[role] = hit.entity_id;
  });
  return entities;
}

// Find the car and map every role to an entity_id. Returns { adapter, deviceId, entities, devices }.
function evcResolve(hass, cfg) {
  const adapter = EVC_ADAPTERS[cfg.vehicle] || EVC_ADAPTERS.tesla;
  const reg = Object.values(hass.entities || {});
  const makerOk = d => {
    if (!adapter.manufacturers) return true;
    const dev = hass.devices && hass.devices[d];
    return !dev || adapter.manufacturers.includes(String(dev.manufacturer || "").toLowerCase());
  };
  const mine = reg.filter(e => adapter.platforms.includes(e.platform) && e.device_id && makerOk(e.device_id));
  // A car is a device with a battery level; the best match wins
  const scored = [...new Set(mine.map(e => e.device_id))].map(d => {
    const ents = evcMatch(adapter, mine.filter(e => e.device_id === d));
    return { d, ents, n: Object.keys(ents).length };
  }).filter(x => x.ents.battery).sort((a, b) => b.n - a.n);
  const devices = scored.map(x => x.d);
  const pick = scored.find(x => x.d === cfg.device_id) || scored[0];
  const entities = pick ? Object.assign({}, pick.ents) : {};
  Object.entries(cfg.entities || {}).forEach(([role, id]) => { if (id) entities[role] = id; });
  return { adapter, deviceId: pick ? pick.d : null, entities, devices };
}

// ---- 20-energy.js ----
// ── Energy and cost model ────────────────────────────────────────
// Costs are worked out per hour from Home Assistant long-term statistics, so each
// tariff's off-peak window is priced correctly. Pure functions; no Home Assistant needed.

const EvcModel = {
  inWindow(hour, s, e) { return s <= e ? hour >= s && hour < e : hour >= s || hour < e; },

  // day: [{ hour, home, car }]; tariff: { off, peak, s, e, standing }
  // battery: null | { usable, eff, kw } — charged off-peak, runs the house (not the car) at peak
  // charger: null | { kw } — moves all car charging into the off-peak window, as far as it fits
  dayCost(day, tariff, battery, charger) {
    const r = { carOff: 0, carPeak: 0, homeOff: 0, homePeak: 0, battUsed: 0, battCharge: 0 };
    const offHours = day.filter(x => this.inWindow(x.hour, tariff.s, tariff.e)).length;
    let carTotal = 0;
    day.forEach(x => { carTotal += x.car; });
    if (charger) {
      r.carOff = Math.min(carTotal, charger.kw * offHours);
      r.carPeak = carTotal - r.carOff;
    }
    let store = battery ? battery.usable : 0;
    const order = [...day].sort((a, b) => ((a.hour - tariff.e + 24) % 24) - ((b.hour - tariff.e + 24) % 24));
    order.forEach(x => {
      const off = this.inWindow(x.hour, tariff.s, tariff.e);
      if (!charger) r[off ? "carOff" : "carPeak"] += x.car;
      if (off) { r.homeOff += x.home; return; }
      const d = battery ? Math.min(store, battery.kw, x.home) : 0;
      store -= d;
      r.battUsed += d;
      r.homePeak += x.home - d;
    });
    r.battCharge = battery ? r.battUsed / battery.eff : 0;
    r.offKwh = r.carOff + r.homeOff + r.battCharge;
    r.peakKwh = r.carPeak + r.homePeak;
    r.cost = r.offKwh * tariff.off + r.peakKwh * tariff.peak + tariff.standing;
    return r;
  },

  averageDay(days) {
    const sums = {};
    days.forEach(d => d.forEach(x => {
      const s = sums[x.hour] || (sums[x.hour] = { hour: x.hour, home: 0, car: 0 });
      s.home += x.home; s.car += x.car;
    }));
    const n = days.length;
    return Object.values(sums).sort((a, b) => a.hour - b.hour).map(s => ({ hour: s.hour, home: s.home / n, car: s.car / n }));
  },

  // days: { 'YYYY-MM-DD': [{hour, home, car}] } (complete days only). Missing days use the average day.
  months(days, monthKeys, scenarios) {
    const keys = Object.keys(days);
    const avg = keys.length ? this.averageDay(keys.map(k => days[k])) : null;
    const avgCost = {};
    if (avg) Object.entries(scenarios).forEach(([id, s]) => { avgCost[id] = this.dayCost(avg, s.tariff, s.battery, s.charger); });
    return monthKeys.map(mk => {
      const [y, m] = mk.split("-").map(Number);
      const dim = new Date(y, m, 0).getDate();
      const real = keys.filter(k => k.startsWith(mk));
      const out = { key: mk, realDays: real.length, days: dim, cost: {} };
      Object.entries(scenarios).forEach(([id, s]) => {
        let c = 0;
        real.forEach(k => { c += this.dayCost(days[k], s.tariff, s.battery, s.charger).cost; });
        if (avg) c += avgCost[id].cost * (dim - real.length);
        out.cost[id] = c;
      });
      return out;
    });
  },
};

// Load hourly statistics and fold them into months, days and per-day usage.
async function evcLoadEnergy(hass, cfg) {
  const e = cfg.energy || {}, t = cfg.tariff;
  const tz = (hass.config && hass.config.time_zone) || "UTC";
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" });
  const parts = d => {
    const p = fmt.formatToParts(d), g = x => p.find(v => v.type === x).value;
    return { key: `${g("year")}-${g("month")}`, day: `${g("year")}-${g("month")}-${g("day")}`, hour: parseInt(g("hour"), 10) };
  };
  const now = new Date(), nMonths = e.months || 6;
  const monthKeys = [];
  for (let i = nMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const start = new Date(now.getFullYear(), now.getMonth() - (nMonths - 1), 1);
  const ids = [e.car_statistic, e.home_statistic].filter(Boolean);
  const res = await hass.callWS({
    type: "recorder/statistics_during_period", start_time: start.toISOString(), end_time: now.toISOString(),
    statistic_ids: ids, period: "hour", types: ["change"], units: { energy: "kWh" },
  });
  const off = h => EvcModel.inWindow(h, t.offpeak_start, t.offpeak_end);
  const months = {};
  monthKeys.forEach(k => { months[k] = { car: { off: 0, peak: 0 }, carMetered: { off: 0, peak: 0 }, home: { off: 0, peak: 0 }, hasHome: false }; });
  const hours = {};
  const row = (id, field) => (res[id] || []).forEach(r => {
    const h = hours[r.start] || (hours[r.start] = { car: null, meter: null });
    h[field] = Math.max(0, r.change || 0);
  });
  row(e.car_statistic, "car");
  if (e.home_statistic) row(e.home_statistic, "meter");
  const usage = {}, days = {}, counts = {};
  Object.entries(hours).forEach(([st, h]) => {
    const p = parts(new Date(Number(st))), m = months[p.key], b = off(p.hour) ? "off" : "peak";
    if (m && h.car) m.car[b] += h.car;
    const u = usage[p.day] || (usage[p.day] = { car: { off: 0, peak: 0 }, home: { off: 0, peak: 0 }, meter: 0 });
    u.car[b] += h.meter == null ? (h.car || 0) : Math.min(h.car || 0, h.meter);
    if (h.meter == null) return;
    u.meter++;
    const car = Math.min(h.car || 0, h.meter);   // the car can't use more than the meter recorded
    u.home[b] += h.meter - car;
    if (m) { m.hasHome = true; m.carMetered[b] += car; m.home[b] += h.meter - car; }
    const c = counts[p.day] || (counts[p.day] = { car: 0, meter: 0 });
    c.meter++; if (h.car != null) c.car++;
    (days[p.day] || (days[p.day] = [])).push({ hour: p.hour, home: h.meter - car, car });
  });
  const complete = {};
  Object.entries(days).forEach(([d, rows]) => { if (counts[d].meter >= 23 && counts[d].car >= 23) complete[d] = rows; });
  return { months, monthKeys, days: complete, usage };
}

// ---- 30-styles.js ----
// ── Styles (shadow DOM) ─────────────────────────────────────────
// Glass cockpit: icon rail left, status pills top, one section below. Sizes scale with the
// viewport height so the whole card fits cast screens (Nest Hub 1024×600 up to 4K TVs) without scrolling.
const EVC_CSS = `
:host{display:block;
  --ground:#0e141b;--glass:rgba(34,44,56,.6);--edge:rgba(255,255,255,.09);--edge2:rgba(255,255,255,.16);--well:rgba(255,255,255,.04);
  --ink:#f2f5f8;--t2:rgba(226,233,240,.62);--t3:rgba(226,233,240,.38);
  --lime:var(--evc-accent,#c8f53c);--lime-d:#9cc21d;--good:#8fe05a;--amber:#ffbf5a;--red:#ff7a6b;
  --u:clamp(.62rem,1.35vh,1rem);
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:var(--ink);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box;margin:0;padding:0}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
button:focus-visible,input:focus-visible{outline:2px solid var(--lime);outline-offset:2px}
button:disabled{opacity:.4;cursor:default}
svg{display:block}
[hidden]{display:none!important}

.frame{position:relative;overflow:hidden;display:grid;grid-template-columns:calc(var(--u)*4.6) minmax(0,1fr);background:var(--ground);
  height:var(--evc-height,calc(100vh - var(--header-height,56px) - 16px));min-height:420px;border-radius:24px;border:1px solid var(--edge2)}
:host([fullscreen]) .frame{position:fixed;inset:0;z-index:7;height:100vh;height:100dvh;border-radius:0;border:0}

/* scene */
.scene{position:absolute;inset:0;z-index:0;overflow:hidden;background:linear-gradient(180deg,#5a6b80,#1e2834 40%,#18212b)}
.scene img{position:absolute;max-width:none;left:0;top:0;-webkit-mask-image:linear-gradient(180deg,#000 82%,transparent);mask-image:linear-gradient(180deg,#000 82%,transparent)}
.scene img.cover{width:100%;height:62%;object-fit:cover}
.scene .shade{position:absolute;inset:0;background:radial-gradient(130% 80% at 50% 35%,transparent 45%,rgba(8,12,17,.45)),linear-gradient(180deg,rgba(10,14,19,.25),transparent 18%,transparent 60%,rgba(10,14,19,.6))}
.frame.dim .scene::after{content:"";position:absolute;inset:0;background:rgba(10,14,19,.58);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}

/* rail */
.rail{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.7);padding:calc(var(--u)*1.3) 0;
  background:rgba(20,27,36,.35);border-right:1px solid var(--edge);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.rail .logo{width:calc(var(--u)*1.9);height:calc(var(--u)*1.9);margin-bottom:calc(var(--u)*1);fill:var(--ink);opacity:.9}
.rail button{width:calc(var(--u)*2.8);height:calc(var(--u)*2.8);border-radius:50%;display:grid;place-items:center;color:var(--t2);background:rgba(255,255,255,.05);border:1px solid var(--edge);position:relative}
.rail button svg{width:42%;height:42%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.rail button:hover{color:var(--ink)}
.rail button.on{color:#16210a;background:var(--lime);border-color:var(--lime);box-shadow:0 0 18px rgba(200,245,60,.45)}
.rail button[data-tip]:hover::after{content:attr(data-tip);position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);white-space:nowrap;font-size:12px;padding:5px 9px;border-radius:7px;background:#000;color:#fff;z-index:5}
.rail .sp{flex:1}
.rail .me{width:calc(var(--u)*2.8);height:calc(var(--u)*2.8);border-radius:50%;display:grid;place-items:center;font-weight:500;font-size:calc(var(--u)*1);background:linear-gradient(135deg,#5b6b7d,#2e3946);border:1px solid var(--edge2)}

/* main */
.main{position:relative;z-index:1;display:grid;grid-template-rows:auto minmax(0,1fr);gap:calc(var(--u)*.9);padding:calc(var(--u)*1.3) calc(var(--u)*1.6);min-width:0;min-height:0}
.glass{background:var(--glass);border:1px solid var(--edge);border-radius:calc(var(--u)*1.25);backdrop-filter:blur(18px) saturate(1.2);-webkit-backdrop-filter:blur(18px) saturate(1.2)}
.top{display:flex;align-items:center;gap:calc(var(--u)*1);flex-wrap:wrap}
.pill{display:flex;align-items:center;gap:calc(var(--u)*.9);padding:calc(var(--u)*.7) calc(var(--u)*1);border-radius:calc(var(--u)*1.1);text-align:left}
button.pill:hover,.hov:hover{border-color:var(--edge2);background:rgba(44,56,70,.72)}
.lbl{font-size:calc(var(--u)*.78);color:var(--t2)}
.big{font-weight:300;letter-spacing:-.02em;font-size:calc(var(--u)*1.4)}
.pbatt .ico{width:calc(var(--u)*1.35);height:calc(var(--u)*2.1);border:1.5px solid var(--good);border-radius:5px;position:relative;padding:2px;display:flex;align-items:flex-end}
.pbatt .ico::before{content:"";position:absolute;top:-4px;left:28%;width:44%;height:3px;border-radius:1px;background:var(--good)}
.pbatt .ico i{display:block;width:100%;border-radius:2px;background:var(--good)}
.bar6{width:calc(var(--u)*8.5);height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:6px;position:relative}
.bar6 i{display:block;height:100%;background:linear-gradient(90deg,var(--lime-d),var(--lime))}
.bar6 u{position:absolute;top:0;bottom:0;width:2px;background:#fff}
.chev{width:16px;height:16px;fill:none;stroke:var(--t2);stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}
.pstate{margin:0 auto;padding:calc(var(--u)*.45) calc(var(--u)*1.1) calc(var(--u)*.45) calc(var(--u)*.45)}
.mini{position:relative;width:calc(var(--u)*3.2);height:calc(var(--u)*3.2);display:grid;place-items:center;font-size:calc(var(--u)*.72)}
.mini svg{position:absolute;inset:0;width:100%;height:100%}
.pstate h2{font-size:calc(var(--u)*1.2);font-weight:500}
.plimit{padding:calc(var(--u)*.6) calc(var(--u)*.7) calc(var(--u)*.6) calc(var(--u)*1)}
.seg{display:inline-flex;gap:4px;padding:3px;border-radius:999px;background:rgba(0,0,0,.25);border:1px solid var(--edge);flex-wrap:wrap}
.seg button{padding:calc(var(--u)*.35) calc(var(--u)*.8);border-radius:999px;font-size:calc(var(--u)*.75);color:var(--t2)}
.seg button:hover{color:var(--ink)}
.seg button.on{background:rgba(200,245,60,.16);color:var(--lime);box-shadow:inset 0 0 0 1px rgba(200,245,60,.55)}
.ibtn{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:var(--t2)}
.ibtn:hover{background:rgba(255,255,255,.07);color:var(--ink)}
.ibtn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round}

/* overview */
.view{min-height:0;min-width:0}
.home{display:grid;grid-template-rows:minmax(0,1fr) auto;gap:calc(var(--u)*.9)}
.hero{position:relative;min-height:calc(var(--u)*6)}
.heads,.row3{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.92fr) minmax(0,1fr);gap:calc(var(--u)*1.35)}
.heads button{display:flex;align-items:center;gap:10px;font-size:calc(var(--u)*.92);padding:4px 6px;border-radius:8px;text-align:left}
.heads button:hover{background:rgba(255,255,255,.05)}
.heads svg{width:17px;height:17px;fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.heads .ar{margin-left:auto;stroke:var(--t2)}
.row3{margin-top:calc(var(--u)*.7);align-items:stretch}
.panel{padding:calc(var(--u)*1.1);display:flex;flex-direction:column;justify-content:space-between;gap:calc(var(--u)*.85);min-height:0;min-width:0}
.well{border-radius:calc(var(--u)*.9);background:var(--well);border:1px solid var(--edge)}
.vs-top{display:flex;align-items:center;gap:calc(var(--u)*1);padding:calc(var(--u)*.7);width:100%;text-align:left}
.vs-top img{width:44%;max-width:180px;height:auto;-webkit-mask-image:radial-gradient(70% 75% at 50% 50%,#000 62%,transparent);mask-image:radial-gradient(70% 75% at 50% 50%,#000 62%,transparent)}
.vs-top h3{font-size:calc(var(--u)*1.25);font-weight:500}
.dot{display:inline-flex;align-items:center;gap:7px;font-size:calc(var(--u)*.8);color:var(--good);margin-top:4px}
.dot::before{content:"";width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 8px currentColor}
.dot.off{color:var(--t2)}
.stats4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.stats4 div{display:flex;flex-direction:column;gap:4px;min-width:0}
.stats4 b{font-size:calc(var(--u)*1.35);font-weight:400}
.stats4 small{font-size:calc(var(--u)*.72);color:var(--t3)}
.foot{display:flex;align-items:center;gap:12px;padding:calc(var(--u)*.7) calc(var(--u)*.9);width:100%;text-align:left;font-size:calc(var(--u)*.82)}
.foot svg.i{width:22px;height:22px;fill:none;stroke:var(--t2);stroke-width:1.6;flex:none}
.foot .g{color:var(--good)}
.foot .r{margin-left:auto;color:var(--t2)}

/* dial */
.dialwrap{display:grid;place-items:center;min-height:0}
.dial{position:relative;width:min(100%,calc(var(--u)*20.5));aspect-ratio:1;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 50% 40%,rgba(62,76,92,.78),rgba(24,31,40,.86) 70%);border:1px solid var(--edge2);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 20px 60px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.08)}
.dial.lg{width:min(100%,calc(var(--u)*27))}
.dial>svg{position:absolute;inset:0;width:100%;height:100%}
.dial .in{position:relative;text-align:center;display:flex;flex-direction:column;align-items:center;gap:calc(var(--u)*.35);width:78%}
.dial .cap{font-size:calc(var(--u)*.78);color:var(--t2)}
.dial .clock{font-size:calc(var(--u)*2.9);font-weight:300;letter-spacing:-.02em;line-height:1.05}
.dial.lg .clock{font-size:calc(var(--u)*3.6)}
.dial .clock span{color:var(--t3)}
.dial .tri{display:grid;grid-template-columns:repeat(3,1fr);width:100%;margin-top:calc(var(--u)*.4);border-top:1px solid var(--edge);padding-top:calc(var(--u)*.6)}
.dial .tri div{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:calc(var(--u)*.85)}
.dial .tri div+div{border-left:1px solid var(--edge)}
.dial .tri svg{width:15px;height:15px;fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;margin-bottom:2px}
.dial .tri small{font-size:calc(var(--u)*.66);color:var(--t3)}
.go{margin-top:calc(var(--u)*.7);min-width:62%;height:calc(var(--u)*2.9);padding:0 18px;border-radius:999px;background:var(--lime);color:#18220a;display:inline-grid;place-items:center;font-weight:600;font-size:calc(var(--u)*.82);box-shadow:0 0 24px rgba(200,245,60,.45)}
.go:hover:not(:disabled){filter:brightness(1.08)}
.go svg{width:18px;height:18px;fill:#18220a}
.go.ghost{background:rgba(255,255,255,.08);color:var(--ink);box-shadow:none;border:1px solid var(--edge2)}
.go.warn{background:var(--amber);color:#2a1a00}
@media (prefers-reduced-motion:no-preference){.tick.live{animation:glow 2.4s ease-in-out infinite}@keyframes glow{50%{opacity:.35}}}

/* insights */
.tips{display:flex;flex-direction:column}
.tips button,.tips div{display:flex;align-items:center;gap:10px;padding:calc(var(--u)*.55) calc(var(--u)*.75);font-size:calc(var(--u)*.82);text-align:left;width:100%}
.tips button:hover{background:rgba(255,255,255,.04)}
.tips>*+*{border-top:1px solid var(--edge)}
.ck{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:var(--lime-d);flex:none}
.ck svg{width:11px;height:11px;fill:none;stroke:#14200a;stroke-width:3}
.ck.w{background:var(--amber)}
.tips b{margin-left:auto;font-weight:400;color:var(--t2);font-size:calc(var(--u)*.78);white-space:nowrap}
.xray{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:10px;align-items:center;padding:6px 12px 6px 4px;background:rgba(40,58,75,.55)}
.xray img{width:100%;height:auto;display:block;-webkit-mask-image:radial-gradient(75% 80% at 50% 50%,#000 60%,transparent);mask-image:radial-gradient(75% 80% at 50% 50%,#000 60%,transparent)}
.xray .k{display:flex;flex-direction:column;gap:calc(var(--u)*.7);font-size:calc(var(--u)*.72);color:var(--t2)}
.xray .k b{display:block;font-size:calc(var(--u)*.95);color:var(--ink);font-weight:400;margin-top:3px}
.xray .k i{display:block;height:4px;border-radius:2px;background:rgba(255,255,255,.12);margin-top:6px;overflow:hidden}
.xray .k i::before{content:"";display:block;height:100%;width:var(--w);background:var(--lime)}

/* section pages */
.page{display:grid;gap:calc(var(--u)*1.1);min-height:0;height:100%;overflow:auto;align-content:start}
.card{padding:calc(var(--u)*1.1);display:flex;flex-direction:column;gap:calc(var(--u)*.75);min-height:0;min-width:0}
.card h4{font-size:calc(var(--u)*.92);font-weight:500;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.kpi b{display:block;font-size:calc(var(--u)*1.9);font-weight:300;margin-top:6px;letter-spacing:-.02em}
.kpi small{display:block;font-size:calc(var(--u)*.75);color:var(--t3);margin-top:4px}
.chart{flex:1;min-height:calc(var(--u)*8)}
.chart svg{width:100%;height:100%}
.key{display:flex;gap:16px;font-size:calc(var(--u)*.72);color:var(--t2);flex-wrap:wrap}
.key i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:6px}
.opt{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:3px 12px;padding:calc(var(--u)*.5) 0;border-top:1px solid var(--edge)}
.opt:first-child{border-top:0}
.opt .t{font-size:calc(var(--u)*.85)}
.opt .t em{font-style:normal;font-size:10px;font-weight:600;color:#18220a;background:var(--lime);padding:2px 7px;border-radius:999px;margin-left:8px}
.opt small{font-size:calc(var(--u)*.72);color:var(--t3)}
.opt .v{text-align:right;font-size:calc(var(--u)*1)}
.opt .s{text-align:right;font-size:calc(var(--u)*.72);color:var(--good)}
.opt .bar{grid-column:1/-1;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden}
.opt .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--lime-d),var(--lime))}
.opt.now .bar i{background:rgba(255,255,255,.3)}
.line{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:calc(var(--u)*.55) 0;border-top:1px solid var(--edge);font-size:calc(var(--u)*.82);color:var(--t2)}
.line:first-child{border-top:0}
.line b{font-weight:400;color:var(--ink);font-size:calc(var(--u)*.92);text-align:right;overflow-wrap:anywhere}
.stepper{display:flex;align-items:center;justify-content:space-between;border:1px solid var(--edge2);border-radius:12px;height:calc(var(--u)*2.9);background:rgba(0,0,0,.2)}
.stepper button{width:calc(var(--u)*2.9);height:100%;color:var(--t2);font-size:20px;border-radius:12px}
.stepper button:hover{color:var(--ink);background:rgba(255,255,255,.06)}
.stepper span{font-size:calc(var(--u)*1.05)}
input[type=range]{width:100%;accent-color:var(--lime)}
.timeline{position:relative;height:calc(var(--u)*2.1);border-radius:8px;background:rgba(255,255,255,.08);overflow:hidden}
.timeline .off{position:absolute;top:0;bottom:0;background:rgba(200,245,60,.35)}
.timeline .now{position:absolute;top:-2px;bottom:-2px;width:2px;background:#fff;box-shadow:0 0 8px #fff}
.hours{display:flex;justify-content:space-between;font-size:calc(var(--u)*.66);color:var(--t3)}
.empty{font-size:calc(var(--u)*.85);color:var(--t2);line-height:1.5}
.empty code{font-size:.92em;background:rgba(255,255,255,.08);padding:1px 5px;border-radius:5px}

.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(calc(var(--u)*10),1fr));gap:calc(var(--u)*.9)}
.tile{display:flex;flex-direction:column;align-items:flex-start;gap:calc(var(--u)*.8);padding:calc(var(--u)*1);border-radius:calc(var(--u)*1.1);text-align:left;min-height:calc(var(--u)*7)}
.tile svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.tile .tn{font-size:calc(var(--u)*.88)}
.tile .ts{font-size:calc(var(--u)*.75);color:var(--t3);margin-top:2px}
.tile.on{background:rgba(200,245,60,.14);border-color:rgba(200,245,60,.5)}
.tile.on svg,.tile.on .ts{color:var(--lime)}
.tile.arm{background:rgba(255,191,90,.16);border-color:rgba(255,191,90,.6)}
.tile.arm .ts{color:var(--amber)}
.page.fill{align-content:stretch}
.map{position:relative;border-radius:calc(var(--u)*1.25);overflow:hidden;min-height:calc(var(--u)*16);border:1px solid var(--edge);background:#121a23}
.map>*{position:absolute;inset:0;height:100%}

.toast{position:absolute;z-index:10;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;transition:.25s;padding:10px 16px;border-radius:12px;background:#000;border:1px solid var(--edge2);font-size:13px;pointer-events:none;max-width:calc(100% - 32px)}
.toast.on{opacity:1;transform:translate(-50%,0)}
.err{padding:24px;font-size:14px;line-height:1.5;color:var(--t2)}

/* short screens (Nest Hub and similar): drop the hero headings to keep everything on screen */
@media (max-height:640px){ .heads{display:none} .row3{margin-top:0} .stats4 small:last-child{display:none} }
/* tablets and narrow windows: the card scrolls inside itself; the side rail stays */
@media (max-width:1000px), (max-height:500px){
  .frame{height:auto;min-height:0;overflow:visible} .scene{border-radius:inherit}
  :host([fullscreen]) .frame{position:fixed;inset:0;height:100vh;height:100dvh;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
  .main{min-height:0;align-content:start}
  .home{grid-template-rows:auto auto}
  .hero{min-height:0;height:clamp(200px,42vw,380px)}
  .main{grid-template-columns:minmax(0,1fr)}
  .row3,.heads{grid-template-columns:repeat(2,minmax(0,1fr))} .heads button:nth-child(3){display:none} .row3 .p3{grid-column:1/-1}
  .page{height:auto;overflow:visible} .g2,.g3,.g4{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .g2>div{display:flex!important;flex-direction:column;gap:inherit;min-height:auto!important} .g2,.g3{min-height:auto!important;height:auto!important} .card{min-height:auto}
  .g2>*,.g3>*{grid-row:auto!important;grid-column:auto!important}
  .chart{min-height:180px} .map{min-height:55vh}
  .dial{width:min(100%,320px)} .dial.lg{width:min(100%,360px)}
}
/* phones (portrait) and short landscape screens: app-style layout with a bottom tab bar */
@media (max-width:760px), (max-height:500px){
  :host{--u:13px}
  .frame{grid-template-columns:1fr;grid-template-rows:1fr auto;border-radius:18px}
  :host([fullscreen]) .frame{border-radius:0}
  .main{order:1;padding:calc(12px + env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) 16px max(12px,env(safe-area-inset-left,0px));gap:12px}
  .rail{order:2;position:sticky;bottom:0;z-index:6;flex-direction:row;justify-content:space-around;gap:4px;
    padding:8px max(8px,env(safe-area-inset-left,0px)) calc(8px + env(safe-area-inset-bottom,0px));
    border-right:0;border-top:1px solid var(--edge);background:rgba(14,20,27,.82)}
  .rail .logo,.rail .sp,.rail .me{display:none}
  .rail button{width:44px;height:44px} .rail button[data-tip]:hover::after{display:none}
  .top{gap:8px}
  .pbatt{flex:1 1 100%} .pbatt .bar6{width:100%} .pbatt>div:nth-child(3){flex:1}
  .pstate{flex:1 1 auto;margin:0} .plimit{flex:1 1 auto;justify-content:space-between}
  .plimit .ibtn{display:none}
  .hero{height:clamp(170px,52vw,300px)}
  .row3,.heads,.g2,.g3{grid-template-columns:minmax(0,1fr)!important} .heads{display:none} .row3{gap:12px;margin-top:0}
  .g4{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .top>*{min-width:0} .plimit{flex-wrap:wrap}
  .stats4{grid-template-columns:repeat(4,minmax(0,1fr))} .stats4 small:last-child{display:block}
  .panel,.card{padding:14px} .vs-top img{width:38%}
  .tiles{grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px} .tile{min-height:96px;padding:12px}
  .seg button{padding:7px 11px} .go{height:46px} .stepper{height:48px} .stepper button{width:48px}
  .map{min-height:50vh}
  .toast{bottom:calc(84px + env(safe-area-inset-bottom,0px))}
}
@media (max-height:500px){ .hero{height:58vh} }
@media (max-width:380px){ .stats4{grid-template-columns:repeat(2,minmax(0,1fr))} .g4{grid-template-columns:minmax(0,1fr)!important} }
`;

// ---- 40-card.js ----
// ── The card ────────────────────────────────────────────────────
const EVC_VERSION = "0.3.0";

const EVC_DEFAULTS = {
  vehicle: "tesla",
  fullscreen: true,
  currency: "£",
  limit_presets: [80, 90, 100],
  exit_path: "",
  tariff: { offpeak_rate: 0.09, peak_rate: 0.31, offpeak_start: 0, offpeak_end: 5, standing_charge: 0.4705, standing_charge_entity: "" },
  compare: null,      // { name, offpeak_rate, peak_rate, offpeak_start, offpeak_end, standing_charge }
  home_battery: null, // { name, kwh, usable, efficiency, cost, inverter_options: [6, 8] }
  ev_charger_kw: 0,
  energy: null,       // { car_statistic, home_statistic, months }
  entities: {},
};

const EVC_ICON = {
  home: '<path d="M3 11 12 4l9 7M5 10v10h14V10"/>', bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', nav: '<path d="m4 11 16-7-7 16-2-7z"/>',
  chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>', grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  exit: '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>', clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', amp: '<path d="M5 12h3l2-6 4 12 2-6h3"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  fan: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7s2 5-2 7M14 12c4 0 7 1 7 4s-5 2-7-2M12 14c0 4-1 7-4 7s-2-5 2-7M10 12c-4 0-7-1-7-4s5-2 7 2"/>',
  snow: '<path d="M12 2v20M4 6l16 12M20 6 4 18"/>', car: '<path d="M3 14l2-6h14l2 6v4H3z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
  win: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 12h16"/>', plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
  light: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>', horn: '<path d="M3 10v4h4l6 5V5L7 10zM16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>', chev: '<path d="m9 6 6 6-6 6"/>', check: '<path d="m2.5 6.5 2.2 2L9.5 3.5"/>', bang: '<path d="M6 3v4M6 9.2v.1"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
};
const evcIc = (k, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24">${EVC_ICON[k] || ""}</svg>`;
const EVC_TESLA_LOGO = '<svg class="logo" viewBox="0 0 100 100" aria-label="Tesla"><path d="M6 17c24-11 64-11 88 0l-2.5 6.5c-11-4.6-23-6.6-34-6.8L50 25l-7.5-8.3c-11 .2-23 2.2-34 6.8z"/><path d="M42.5 25.5h15L53 30.5 50 94l-3-63.5z"/></svg>';
const evcEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const evcImg = key => (window.__evcImages || {})[key] || "";

class EvCockpitCard extends HTMLElement {
  static getConfigElement() { return document.createElement("ev-cockpit-card-editor"); }
  static getStubConfig() { return { vehicle: "tesla" }; }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    const d = EVC_DEFAULTS;
    this._cfg = Object.assign({}, d, config, {
      tariff: Object.assign({}, d.tariff, config.tariff || {}),
      entities: Object.assign({}, config.entities || {}),
    });
    this._view = this._view || "home";
    this._ui = this._ui || { who: "both", unit: "kwh", per: "year", inv: null, mon: null };
    this._resolved = null;
    this._sig = "";
    this._applyFullscreen();
    if (this.shadowRoot) this._renderAll();
  }

  set preview(v) { this._preview = v; this._applyFullscreen(); }
  set editMode(v) { this._editMode = v; this._applyFullscreen(); }
  _applyFullscreen() {
    const on = this._cfg && this._cfg.fullscreen && !this._preview && !this._editMode && !this._peek;
    this.toggleAttribute("fullscreen", !!on);
  }

  getCardSize() { return 12; }
  getGridOptions() { return { columns: "full", rows: 10, min_rows: 8 }; }

  connectedCallback() {
    this._tick = setInterval(() => this._everySecond(), 1000);
    // Pictures may arrive after the code when they are loaded as a separate resource
    this._onImages = this._onImages || (() => { if (this.shadowRoot) this._renderAll(); });
    window.addEventListener("evc-images", this._onImages);
    if (this.shadowRoot) this._renderAll();
  }
  disconnectedCallback() { clearInterval(this._tick); if (this._ro) this._ro.disconnect(); window.removeEventListener("evc-images", this._onImages); }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", e => this._onClick(e));
      this.shadowRoot.addEventListener("change", e => this._onChange(e));
    }
    if (!this._resolved || this._regRef !== hass.entities) {
      this._regRef = hass.entities;
      this._resolved = evcResolve(hass, Object.assign({}, this._cfg, this._deviceOverride ? { device_id: this._deviceOverride } : {}));
      this._sig = "";
    }
    if (this._mapEl) this._mapEl.hass = hass;
    const sig = this._signature();
    if (first || !this.shadowRoot.querySelector(".frame")) this._renderAll();
    else if (sig !== this._sig && !this._dragging) this._renderDynamic();
    this._sig = sig;
    const e = this._cfg.energy;
    if (e && e.car_statistic && !this._eLoading && Date.now() - (this._eAt || 0) > 10 * 60 * 1000) this._loadEnergy();
  }

  // Only re-render when one of the car's entities changed
  _signature() {
    const s = this._hass.states;
    return Object.values(this._resolved.entities).map(id => (s[id] ? s[id].last_updated + s[id].state : "-")).join("|") + (s["zone.home"] ? "" : "");
  }

  // ── State helpers ──────────────────────────────────────────
  _id(role) { return this._resolved && this._resolved.entities[role]; }
  _so(role) { const id = this._id(role); return id ? this._hass.states[id] : undefined; }
  _st(role) { const o = this._so(role); return o ? o.state : null; }
  _ok(role) { const v = this._st(role); return v != null && v !== "unavailable" && v !== "unknown"; }
  _num(role) { const v = parseFloat(this._st(role)); return isNaN(v) ? null : v; }
  _attr(role, a) { const o = this._so(role); return o ? (o.attributes || {})[a] : undefined; }
  _unit(role) { return this._attr(role, "unit_of_measurement") || ""; }
  _fmt(v, dp = 0) { return v == null ? "--" : Number(v).toFixed(dp); }
  _money(v, dp = 2) { return this._cfg.currency + (v || 0).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  _rate(r) { return this._cfg.currency === "£" ? `${+(r * 100).toFixed(1)}p` : `${this._cfg.currency}${r.toFixed(3)}`; }
  _hh(h) { return `${String(h).padStart(2, "0")}:00`; }

  _chargeState() {
    const id = this._id("charging");
    if (id && id.startsWith("binary_sensor.")) {
      if (this._st("charging") === "on") return "charging";
      if (this._ok("charge_cable")) return this._st("charge_cable") === "on" ? "stopped" : "disconnected";
      return "";
    }
    return (this._st("charging") || "").toLowerCase();
  }
  _canCharge() { return !!(this._id("charge_switch") || this._id("charge_start")); }
  // A lock entity, or a binary sensor (device_class lock: off = locked, as Home Assistant defines it)
  _lockCtl() { const id = this._id("lock"); return !!id && id.startsWith("lock."); }
  _locked() {
    const v = this._st("lock");
    if (this._lockCtl()) return v === "locked";
    return this._attr("lock", "device_class") === "lock" ? v === "off" : v === "on";
  }
  _climateOn() { const v = this._st("climate"); return !!v && v !== "off" && v !== "unavailable" && v !== "unknown"; }
  _climateCtl() { const id = this._id("climate"); return !!id && (id.startsWith("climate.") || id.startsWith("switch.") || !!this._id("climate_start")); }
  _limitOptions() { const o = this._attr("charge_limit", "options"); return Array.isArray(o) ? o.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b) : null; }
  _setLimit(v) {
    const id = this._id("charge_limit"); if (!id) return;
    if (id.startsWith("select.")) {
      const opts = this._limitOptions() || [v], best = opts.reduce((b, o) => Math.abs(o - v) < Math.abs(b - v) ? o : b, opts[0]);
      const raw = this._attr("charge_limit", "options").find(o => Number(o) === best);
      return this._call("select", "select_option", "charge_limit", { option: raw }, `Charge limit set to ${best}%`);
    }
    return this._call("number", "set_value", "charge_limit", { value: v }, `Charge limit set to ${v}%`);
  }
  _isCharging() { const c = this._chargeState(); return c === "charging" || c === "starting"; }
  _plugged() {
    if (this._ok("charge_cable")) return this._st("charge_cable") === "on";
    const c = this._chargeState();
    return !!c && c !== "disconnected" && c !== "unknown" && c !== "unavailable";
  }
  _secondsLeft() {
    const v = this._st("time_to_full");
    if (!v || !this._isCharging()) return null;
    const t = new Date(v).getTime();
    if (!isNaN(t)) { const s = Math.round((t - Date.now()) / 1000); return s > 0 ? s : null; }
    const n = parseFloat(v); // some integrations report hours or minutes as a number
    if (isNaN(n) || n <= 0) return null;
    return Math.round((this._unit("time_to_full") === "h" ? n * 60 : n) * 60);
  }
  _name() {
    if (this._cfg.name) return this._cfg.name;
    const dv = this._hass.devices && this._resolved.deviceId && this._hass.devices[this._resolved.deviceId];
    return (dv && (dv.name_by_user || dv.name)) || this._resolved.adapter.model;
  }
  _model() {
    const dv = this._hass.devices && this._resolved.deviceId && this._hass.devices[this._resolved.deviceId];
    return this._cfg.model || (dv && dv.model) || this._resolved.adapter.model;
  }
  _image(kind) {
    const own = this._cfg[kind === "scene" ? "image" : kind + "_image"];
    if (own) return own;
    const k = this._resolved.adapter.images[kind];
    return k ? evcImg(k) : "";
  }

  // ── Rendering ───────────────────────────────────────────────
  _renderAll() {
    if (!this._hass || !this._resolved) return;
    const r = this.shadowRoot, ad = this._resolved.adapter;
    if (!this._resolved.deviceId && !Object.keys(this._cfg.entities).length) {
      r.innerHTML = `<style>${EVC_CSS}</style><div class="glass err">No ${evcEsc(ad.name)} car was found. Check that its integration is set up, or set <code>vehicle: generic</code> and choose the entities in the card's settings.</div>`;
      return;
    }
    const scene = this._image("scene"), custom = !!this._cfg.image || !ad.sceneCar;
    const nav = [["home", "home", "Overview"], ["charging", "bolt", "Charging"], ["location", "nav", "Location"], ["energy", "chart", "Energy and costs"], ["controls", "grid", "Controls"]];
    r.innerHTML = `<style>${EVC_CSS}</style>
      <div class="frame" id="frame">
        <div class="scene">${scene ? `<img id="photo" class="${custom ? "cover" : ""}" src="${evcEsc(scene)}" alt="">` : ""}<div class="shade"></div></div>
        <nav class="rail" aria-label="Sections">
          ${this._cfg.vehicle === "tesla" ? EVC_TESLA_LOGO : `<span class="logo">${evcIc("bolt")}</span>`}
          ${nav.map(([v, i, t]) => `<button data-go="${v}" data-tip="${t}" aria-label="${t}">${evcIc(i)}</button>`).join("")}
          <span class="sp"></span>
          <button data-go="settings" data-tip="Card settings" aria-label="Card settings">${evcIc("gear")}</button>
          ${this.hasAttribute("fullscreen") || this._peek ? `<button data-peek data-tip="${this._peek ? "Full screen" : "Show Home Assistant menus"}" aria-label="Toggle Home Assistant menus">${evcIc("exit")}</button>` : `<div class="me" title="${evcEsc(this._name())}">${evcEsc(this._name().slice(0, 1))}</div>`}
        </nav>
        <div class="main"><div class="top" id="top"></div><div class="view" id="view"></div></div>
        <div class="toast" id="toast" role="status"></div>
      </div>`;
    const img = r.getElementById("photo");
    if (img) img.addEventListener("load", () => this._placeScene());
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(() => { this._placeScene(); if (this._view === "energy") this._drawCharts(); });
    this._ro.observe(r.getElementById("frame"));
    this._renderDynamic();
  }

  _renderDynamic() {
    const r = this.shadowRoot;
    if (!r.getElementById("view")) return;
    r.getElementById("frame").classList.toggle("dim", this._view !== "home");
    r.querySelectorAll(".rail [data-go]").forEach(b => b.classList.toggle("on", b.dataset.go === this._view));
    r.getElementById("top").innerHTML = this._topHtml();
    const v = r.getElementById("view");
    const html = { home: this._homeHtml, charging: this._chargingHtml, location: this._locationHtml, energy: this._energyHtml, controls: this._controlsHtml, settings: this._settingsHtml }[this._view].call(this);
    v.className = "view " + (this._view === "home" ? "home" : "page") + (this._view === "location" ? " fill" : "");
    v.innerHTML = html;
    if (this._view === "location") this._mountMap();
    if (this._view === "energy") this._drawCharts();
    requestAnimationFrame(() => this._placeScene());
  }

  _placeScene() {
    const r = this.shadowRoot, img = r && r.getElementById("photo"), hero = r && r.getElementById("hero");
    const meta = this._resolved && this._resolved.adapter.sceneCar;
    if (!img || !hero || !meta || this._cfg.image) return;
    const f = r.getElementById("frame").getBoundingClientRect(), h = hero.getBoundingClientRect();
    if (!h.width) return;
    // On phones the hero is short: fit the car to it and let the scene fill the width
    const fit = (h.height + 40) / (meta.tyres - meta.roof);
    const s = Math.max(f.width / meta.w, Math.min(fit, (f.width * 0.96) / (meta.carW || meta.w), 2.4));
    let left = h.left - f.left + h.width / 2 - meta.cx * s;
    left = Math.min(0, Math.max(f.width - meta.w * s, left));
    img.style.width = meta.w * s + "px";
    img.style.left = left + "px";
    const frame = r.getElementById("frame");   // the frame itself scrolls on phones
    const phone = f.width <= 760 || f.height <= 500;
    img.style.top = (h.bottom - f.top + frame.scrollTop + (phone ? 8 : 28) - meta.tyres * s) + "px";
  }

  _topHtml() {
    const b = this._num("battery"), rg = this._num("range"), lim = this._num("charge_limit"), ch = this._isCharging(), left = this._secondsLeft();
    const st = ch ? "Charging" : this._chargeState() === "complete" ? "Charge complete" : this._plugged() ? "Plugged in" : "Parked";
    const where = this._whereText();
    const sub = ch ? (left ? `${this._fmt(lim)}% by ${this._clock(left)}` : `Charging to ${this._fmt(lim)}%`) : this._plugged() ? `${where} · limit ${this._fmt(lim)}%` : `${where}${this._ok("lock") ? " · " + (this._locked() ? "locked" : "unlocked") : ""}`;
    const C = 2 * Math.PI * 21, frac = (b || 0) / 100;
    const lo = this._limitOptions(), presets = lo ? (this._cfg.limit_presets || []).filter(p => lo.includes(p)).concat([]).slice(0, 3) : (this._cfg.limit_presets || []);
    const limName = lim == null ? "" : lim <= 80 ? "Daily" : lim < 100 ? "Trip" : "Max";
    return `
      <button class="pill glass pbatt" data-go="charging">
        <div class="ico"><i style="height:${b || 0}%"></i></div>
        <div><div class="lbl">Battery</div><div class="big">${this._fmt(b)}%</div></div>
        <div><div class="big" style="text-align:right">${this._fmt(rg)} <span class="lbl">${evcEsc(this._unit("range"))}</span></div><div class="bar6"><i style="width:${b || 0}%"></i>${lim != null ? `<u style="left:calc(${lim}% - 1px)"></u>` : ""}</div></div>
        ${evcIc("chev", "chev")}
      </button>
      <button class="pill glass pstate" data-go="charging">
        <div class="mini"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="4"/><circle cx="26" cy="26" r="21" fill="none" stroke="var(--lime)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C * frac} ${C}" transform="rotate(-90 26 26)"/></svg><span data-mini>${ch && left ? this._hm(left) : `${this._fmt(b)}%`}</span></div>
        <div><h2>${st}</h2><div class="lbl">${evcEsc(sub)}</div></div>
      </button>
      ${this._id("charge_limit") ? `<div class="pill glass plimit">
        <div><div class="lbl">Charge limit</div><div style="font-size:calc(var(--u)*.88);margin-top:2px">${limName}</div></div>
        <div class="seg">${presets.map(p => `<button data-limit="${p}" class="${lim === p ? "on" : ""}">${p}%</button>`).join("")}</div>
        <button class="ibtn" data-go="charging" aria-label="More charging settings">${evcIc("chev")}</button>
      </div>` : ""}`;
  }

  _whereText() {
    const v = this._st("location");
    if (!v || v === "unknown" || v === "unavailable") return "";
    if (v === "home") return "Home";
    if (v === "not_home") return "Away";
    const z = Object.values(this._hass.states).find(s => s.entity_id.startsWith("zone.") && s.attributes.friendly_name && s.attributes.friendly_name.toLowerCase() === v.toLowerCase());
    return z ? z.attributes.friendly_name : v;
  }
  _clock(sec) { return new Date(Date.now() + sec * 1000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
  _hm(sec) { return `${Math.floor(sec / 3600)}:${String(Math.floor(sec % 3600 / 60)).padStart(2, "0")}`; }
  _hms(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}<span>:${String(s).padStart(2, "0")}</span>`; }

  _everySecond() {
    if (!this.shadowRoot || !this._hass || !this._isCharging()) return;
    const left = this._secondsLeft();
    if (left == null) return;
    this.shadowRoot.querySelectorAll("[data-clock]").forEach(c => { c.innerHTML = this._hms(left); });
  }

  // ── Overview ────────────────────────────────────────────────
  _homeHtml() {
    const side = this._image("side"), xray = this._image("xray"), b = this._num("battery"), lim = this._num("charge_limit");
    const ch = this._isCharging(), where = this._whereText();
    const status = ch ? `Charging${where ? " · " + where : ""}` : this._plugged() ? `Plugged in${where ? " · " + where : ""}` : `Parked${where ? " · " + where : ""}`;
    const online = this._st("online");
    const stat = (label, role, dp, unitFallback) => this._id(role) ? `<div><small>${label}</small><b>${this._fmt(this._num(role), dp)}</b><small>${evcEsc(this._unit(role) || unitFallback)}</small></div>` : "";
    return `
      <div class="hero" id="hero" aria-hidden="true"></div>
      <div>
        <div class="heads">
          <button data-go="controls">${evcIc("car")}Vehicle Status${evcIc("arrow", "ar")}</button>
          <button data-go="charging">${evcIc("bolt")}Charging${evcIc("arrow", "ar")}</button>
          <button data-go="energy">${evcIc("bulb")}${this._energyOn() ? "Energy Insights" : "Car Health"}${evcIc("arrow", "ar")}</button>
        </div>
        <div class="row3">
          <div class="glass panel">
            <button class="well vs-top hov" data-go="controls">
              ${side ? `<img src="${evcEsc(side)}" alt="">` : ""}
              <div style="flex:1;min-width:0"><h3>${evcEsc(this._model())}</h3><div class="lbl" style="margin-top:2px">${evcEsc(this._name())}</div>
                <div class="dot ${ch ? "" : "off"}">${online === "off" ? "Asleep" : status}</div></div>
              ${evcIc("chev", "chev")}
            </button>
            <div class="stats4">
              ${stat("Range", "range", 0, "")}${stat("Inside", "inside_temp", 1, "°C")}${stat("Outside", "outside_temp", 1, "°C")}${stat(ch ? "This session" : "Last session", "energy_added", 1, "kWh")}
            </div>
            <button class="well foot hov" data-go="controls">
              ${evcIc(this._ok("lock") && !this._locked() ? "unlock" : "lock", "i")}
              <div><div>${!this._ok("lock") ? "Lock unavailable" : this._locked() ? "Locked" : "Unlocked"}</div>
                ${this._id("sentry") ? `<div class="${this._st("sentry") === "on" ? "g" : "lbl"}">Sentry mode ${this._st("sentry") === "on" ? "on" : "off"}</div>` : this._id("something_open") ? `<div class="${this._st("something_open") === "on" ? "" : "g"}" style="${this._st("something_open") === "on" ? "color:var(--amber)" : ""}">${this._st("something_open") === "on" ? "Something is open" : "All closed"}</div>` : ""}</div>
              <span class="r">${this._id("climate") ? (this._climateOn() ? `Climate on${this._attr("climate", "temperature") != null ? " · " + this._fmt(this._attr("climate", "temperature"), 1) + "°" : ""}` : "Climate off") : ""}</span>
              ${evcIc("chev", "chev")}
            </button>
          </div>
          <div class="dialwrap"><div class="dial">${this._dialInner()}</div></div>
          <div class="glass panel p3">
            <div class="well tips">${this._tipsHtml()}</div>
            <div class="well xray">
              ${xray ? `<img src="${evcEsc(xray)}" alt="">` : `<div class="lbl" style="padding:12px">Battery</div>`}
              <div class="k">
                <div>Battery<b>${this._fmt(b)}%</b><i style="--w:${b || 0}%"></i></div>
                ${lim != null ? `<div>Charge limit<b>${this._fmt(lim)}%</b><i style="--w:${lim}%"></i></div>` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  _ticks(frac, live) {
    let s = "";
    for (let i = 0; i < 72; i++) {
      const a = i / 72 * 2 * Math.PI - Math.PI / 2, on = i / 72 < frac;
      s += `<circle class="tick ${on && live ? "live" : ""}" cx="${(100 + 92 * Math.cos(a)).toFixed(2)}" cy="${(100 + 92 * Math.sin(a)).toFixed(2)}" r="${on ? 2.3 : 1.4}" fill="${on ? "var(--lime)" : "rgba(255,255,255,.2)"}"/>`;
    }
    const lim = this._num("charge_limit");
    if (lim != null) {
      const la = lim / 100 * 2 * Math.PI - Math.PI / 2;
      s += `<line x1="${(100 + 84 * Math.cos(la)).toFixed(2)}" y1="${(100 + 84 * Math.sin(la)).toFixed(2)}" x2="${(100 + 99 * Math.cos(la)).toFixed(2)}" y2="${(100 + 99 * Math.sin(la)).toFixed(2)}" stroke="#fff" stroke-width="2"/>`;
    }
    return `<svg viewBox="0 0 200 200">${s}</svg>`;
  }

  _dialInner() {
    const b = this._num("battery"), lim = this._num("charge_limit"), ch = this._isCharging(), left = this._secondsLeft();
    const kw = this._num("charger_power"), added = this._num("energy_added"), amps = this._num("charge_current");
    if (ch) {
      return `${this._ticks((b || 0) / 100, true)}<div class="in"><div class="cap">Charging to ${this._fmt(lim)}%</div>
        <div class="clock" data-clock>${left ? this._hms(left) : `${this._fmt(b)}<span>%</span>`}</div>
        <div class="tri"><div>${evcIc("bolt")}${this._fmt(kw, 1)} kW<small>Power</small></div><div>${evcIc("plus")}${this._fmt(added, 1)} kWh<small>Added</small></div><div>${evcIc("clock")}${left ? this._clock(left) : "--"}<small>Finish</small></div></div>
        ${(this._id("charge_switch") || this._id("charge_stop")) ? `<button class="go" data-act="charge_off" aria-label="Stop charging"><svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg></button>` : ""}</div>`;
    }
    const plugged = this._plugged(), cs = this._chargeState();
    const cap = cs === "complete" ? "Charge complete" : plugged ? "Plugged in · not charging" : "Not plugged in";
    const t = this._cfg.tariff, off = EvcModel.inWindow(new Date().getHours(), t.offpeak_start, t.offpeak_end);
    let btn = "";
    if (plugged && cs !== "complete" && this._canCharge()) btn = `<button class="go" data-act="charge_on">Start charging</button>`;
    else if (!plugged && this._id("charge_port")) btn = this._st("charge_port") === "open" ? `<button class="go ghost" data-act="port_close">Close charge port</button>` : `<button class="go" data-act="port_open">Open charge port</button>`;
    return `${this._ticks((b || 0) / 100, false)}<div class="in"><div class="cap">${cap}</div><div class="clock">${this._fmt(b)}<span>%</span></div>
      <div class="tri"><div>${evcIc("amp")}${this._fmt(amps)} A<small>Current</small></div><div>${evcIc("bolt")}${this._rate(off ? t.offpeak_rate : t.peak_rate)}<small>${off ? "Off-peak now" : "Off-peak " + this._hh(t.offpeak_start)}</small></div><div>${evcIc("lock")}${this._fmt(lim)}%<small>Limit</small></div></div>
      ${btn}</div>`;
  }

  _energyOn() { return !!(this._cfg.energy && this._cfg.energy.car_statistic); }

  _tipsHtml() {
    const ok = (t, v, go) => `<button data-go="${go}"><span class="ck">${`<svg viewBox="0 0 12 12">${EVC_ICON.check}</svg>`}</span>${evcEsc(t)}<b>${evcEsc(v)}</b></button>`;
    const warn = (t, v, go) => `<button data-go="${go}"><span class="ck w"><svg viewBox="0 0 12 12">${EVC_ICON.bang}</svg></span>${evcEsc(t)}<b>${evcEsc(v)}</b></button>`;
    const out = [];
    const E = this._energy;
    if (this._energyOn() && E) {
      const mk = E.monthKeys[E.monthKeys.length - 1], m = E.months[mk], kwh = m.car.off + m.car.peak;
      const share = kwh ? Math.round(m.car.off / kwh * 100) : 0;
      out.push((share >= 70 ? ok : warn)("Charged off-peak this month", `${share}%`, "energy"));
      out.push(ok(`Home charging · ${this._monthName(mk)}`, `${Math.round(kwh)} kWh · ${this._money(this._cost(m.car))}`, "energy"));
      const best = this._bestSaving();
      if (best) out.push(warn(best.label, `${this._money(best.save, 0)} / yr`, "energy"));
    }
    if (out.length < 3 && this._ok("something_open")) out.push(this._st("something_open") === "on" ? warn("Something is open", "Check", "controls") : ok("Doors, windows and boot", "Closed", "controls"));
    if (out.length < 3 && this._ok("lock")) out.push(this._locked() ? ok("Doors locked", "Locked", "controls") : warn("Doors unlocked", this._lockCtl() ? "Lock now" : "Unlocked", "controls"));
    if (out.length < 3 && this._ok("windows")) out.push(this._st("windows") === "closed" ? ok("Windows closed", "Closed", "controls") : warn("Windows open", "Close", "controls"));
    if (out.length < 3 && this._ok("sentry")) out.push(this._st("sentry") === "on" ? ok("Sentry mode", "On", "controls") : warn("Sentry mode", "Off", "controls"));
    if (out.length < 3 && this._ok("update")) out.push(this._st("update") === "off" ? ok("Software", "Up to date", "controls") : warn("Software update", "Available", "controls"));
    return out.slice(0, 3).join("") || `<div class="lbl">No checks available for this car.</div>`;
  }

  // ── Charging page ───────────────────────────────────────────
  _chargingHtml() {
    const lim = this._num("charge_limit"), amps = this._num("charge_current"), t = this._cfg.tariff;
    const lo = this._limitOptions();
    const limMin = lo ? lo[0] : (this._attr("charge_limit", "min") ?? 50), limMax = lo ? lo[lo.length - 1] : (this._attr("charge_limit", "max") ?? 100);
    const limStep = lo && lo.length > 1 ? lo[1] - lo[0] : (this._attr("charge_limit", "step") || 1);
    const ch = this._isCharging(), plugged = this._plugged(), now = new Date(), off = EvcModel.inWindow(now.getHours(), t.offpeak_start, t.offpeak_end);
    const added = this._num("energy_added"), rate = off ? t.offpeak_rate : t.peak_rate, left = this._secondsLeft();
    const span = t.offpeak_start <= t.offpeak_end
      ? `<div class="off" style="left:${t.offpeak_start / 24 * 100}%;width:${(t.offpeak_end - t.offpeak_start) / 24 * 100}%"></div>`
      : `<div class="off" style="left:${t.offpeak_start / 24 * 100}%;right:0"></div><div class="off" style="left:0;width:${t.offpeak_end / 24 * 100}%"></div>`;
    const line = (a, b) => `<div class="line"><span>${a}</span><b>${b}</b></div>`;
    return `<div class="g3" style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:calc(var(--u)*1.1);align-items:start">
      <div class="dialwrap" style="grid-row:span 2"><div class="dial lg">${this._dialInner()}</div></div>
      <div class="glass card">
        <h4>Charging controls</h4>
        ${this._id("charge_current") ? `<div><div class="lbl" style="margin-bottom:8px">Charge current</div><div class="stepper"><button data-act="amp_down" aria-label="Lower charge current">−</button><span>${this._fmt(amps)} A</span><button data-act="amp_up" aria-label="Raise charge current">+</button></div></div>` : ""}
        ${this._id("charge_limit") ? `<div><div class="lbl" style="margin-bottom:8px;display:flex;justify-content:space-between">Charge limit <b style="font-weight:400;color:var(--ink)" data-limtxt>${this._fmt(lim)}%</b></div>
          <input type="range" data-range="charge_limit" min="${limMin}" max="${limMax}" step="${limStep}" value="${lim ?? 80}" aria-label="Charge limit"></div>` : ""}
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${this._canCharge() ? `<button class="go" style="flex:1;margin:0" data-act="${ch ? "charge_off" : "charge_on"}" ${!plugged && !ch ? "disabled" : ""}>${ch ? "Stop charging" : "Start charging"}</button>` : ""}
          ${this._id("charge_port") ? `<button class="go ghost" style="flex:1;margin:0" data-act="${this._st("charge_port") === "open" ? "port_close" : "port_open"}" ${ch ? "disabled" : ""}>${this._st("charge_port") === "open" ? "Close charge port" : "Open charge port"}</button>` : ""}
        </div>
      </div>
      <div class="glass card">
        <h4>${ch ? "This session" : "Last session"}</h4>
        <div>
          ${line("Power", `${this._fmt(this._num("charger_power"), 1)} kW`)}
          ${this._id("charger_current") ? line("Current", `${this._fmt(this._num("charger_current"))} A`) : ""}
          ${this._id("charger_voltage") ? line("Voltage", `${this._fmt(this._num("charger_voltage"))} V`) : ""}
          ${line("Energy added", `${this._fmt(added, 1)} kWh`)}
          ${line(ch ? "Cost so far (at today's rate)" : "Cost at today's rate", this._money((added || 0) * rate))}
          ${line(`Time to ${this._fmt(lim)}%`, ch && left ? `${Math.floor(left / 3600)} h ${Math.floor(left % 3600 / 60)} min` : "—")}
        </div>
      </div>
      <div class="glass card" style="grid-column:span 2">
        <h4>Today's tariff <span class="lbl">${off ? "Off-peak now" : "Peak now"} · ${this._rate(rate)} per kWh</span></h4>
        <div class="timeline">${span}<div class="now" style="left:${(now.getHours() + now.getMinutes() / 60) / 24 * 100}%"></div></div>
        <div class="hours"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
        <div class="key"><span><i style="background:rgba(200,245,60,.6)"></i>Off-peak ${this._rate(t.offpeak_rate)} · ${this._hh(t.offpeak_start)} to ${this._hh(t.offpeak_end)}</span><span><i style="background:rgba(255,255,255,.25)"></i>Peak ${this._rate(t.peak_rate)}</span><span><i style="background:#fff;width:2px"></i>Now</span></div>
        ${ch && !off ? `<div class="empty" style="color:var(--amber)">Charging at the peak rate. Off-peak starts at ${this._hh(t.offpeak_start)}.</div>` : ""}
      </div>
    </div>`;
  }

  // ── Location page ───────────────────────────────────────────
  _locationHtml() {
    const loc = this._so("location");
    if (!loc) return `<div class="glass card empty">No location tracker was found for this car. Set <code>entities.location</code> in the card's settings.</div>`;
    const a = loc.attributes || {}, home = this._hass.states["zone.home"];
    let dist = null;
    if (a.latitude != null && home) {
      const R = 6371, toR = x => x * Math.PI / 180, dLa = toR(a.latitude - home.attributes.latitude), dLo = toR(a.longitude - home.attributes.longitude);
      const h = Math.sin(dLa / 2) ** 2 + Math.cos(toR(home.attributes.latitude)) * Math.cos(toR(a.latitude)) * Math.sin(dLo / 2) ** 2;
      dist = 2 * R * Math.asin(Math.sqrt(h));
    }
    const miles = (this._hass.config.unit_system || {}).length === "mi";
    const dTxt = dist == null ? "--" : miles ? `${(dist * 0.621371).toFixed(1)} mi` : `${dist.toFixed(1)} km`;
    const since = loc.last_changed ? this._ago(new Date(loc.last_changed)) : "--";
    const where = this._whereText() || "Unknown";
    const btn = (role, act, label) => this._id(role) ? `<button class="go ghost" style="flex:1;margin:0" data-act="${act}">${this._arm === act ? "Tap again to " + label.toLowerCase() : label}</button>` : "";
    return `<div class="g2" style="display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:calc(var(--u)*1.1);height:100%;min-height:0">
      <div class="map" id="mapbox"></div>
      <div style="display:grid;gap:calc(var(--u)*1.1);align-content:start">
        <div class="glass card"><h4>Where it is <span class="dot ${where === "Home" ? "" : "off"}">${evcEsc(where)}</span></h4>
          <div><div class="line"><span>Distance from home</span><b>${dTxt}</b></div>
          <div class="line"><span>${where === "Home" ? "Home for" : "Here for"}</span><b>${since}</b></div>
          ${a.heading != null ? `<div class="line"><span>Heading</span><b>${Math.round(a.heading)}°</b></div>` : ""}</div></div>
        <div class="glass card"><h4>Find it</h4><div style="display:flex;gap:10px;flex-wrap:wrap">${btn("flash", "flash", "Flash lights")}${btn("honk", "honk", "Honk horn")}</div></div>
      </div></div>`;
  }
  _ago(d) {
    const m = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    return h < 48 ? `${h} h ${m % 60} min` : `${Math.floor(h / 24)} days`;
  }
  async _mountMap() {
    const box = this.shadowRoot.getElementById("mapbox");
    if (!box) return;
    try {
      if (!this._mapEl) {
        const helpers = await window.loadCardHelpers();
        this._mapEl = helpers.createCardElement({ type: "map", entities: [{ entity: this._id("location") }, "zone.home"], theme_mode: "dark", hours_to_show: 12, default_zoom: 14 });
      }
      this._mapEl.hass = this._hass;
      if (this._mapEl.parentNode !== box) box.appendChild(this._mapEl);
    } catch (e) {
      box.innerHTML = `<div class="empty" style="padding:16px">The map couldn't load here.</div>`;
    }
  }

  // ── Controls page ───────────────────────────────────────────
  _controlsHtml() {
    const S = r => this._st(r), on = (r, v = "on") => S(r) === v;
    const T = [
      ["lock", this._locked() ? "lock" : "unlock", "Doors", (this._locked() ? "Locked" : "Unlocked") + (this._lockCtl() ? "" : " · read only"), this._locked(), "lock"],
      ["something_open", "car", "Doors and boot", on("something_open") ? "Something open" : "All closed", !on("something_open"), "noop"],
      ["sentry", "eye", "Sentry mode", on("sentry") ? "On" : "Off", on("sentry"), "sentry"],
      ["climate", "fan", "Climate", this._climateOn() ? `On${this._attr("climate", "temperature") != null ? " · " + this._fmt(this._attr("climate", "temperature"), 1) + "°" : ""}` : "Off", this._climateOn(), "climate"],
      ["defrost", "snow", "Defrost", on("defrost") ? "On" : "Off", on("defrost"), "defrost"],
      ["frunk", "car", "Front trunk", on("frunk", "open") ? "Open" : "Closed", on("frunk", "open"), "frunk"],
      ["trunk", "car", "Boot", on("trunk", "open") ? "Open" : "Closed", on("trunk", "open"), "trunk"],
      ["windows", "win", "Windows", on("windows", "open") ? "Vented" : "Closed", on("windows", "open"), "windows"],
      ["charge_port", "plug", "Charge port", on("charge_port", "open") ? "Open" : "Closed", on("charge_port", "open"), "port"],
      ["flash", "light", "Flash lights", "Tap to flash", false, "flash"],
      ["honk", "horn", "Honk horn", "Tap twice to honk", false, "honk"],
    ].filter(t => this._id(t[0]));
    const tiles = T.map(([role, i, n, s, active, act]) => {
      const armed = this._arm === act;
      return `<button class="glass tile hov ${active ? "on" : ""} ${armed ? "arm" : ""}" data-act="${act}" ${(this._ok(role) || ["flash", "honk", "wake"].includes(act)) && act !== "noop" && !(act === "climate" && !this._climateCtl()) ? "" : "disabled"}>${evcIc(i)}<div><div class="tn">${n}</div><div class="ts">${armed ? "Tap again to confirm" : s}</div></div></button>`;
    }).join("");
    const sel = (role, label) => {
      const opts = this._attr(role, "options");
      if (!this._id(role) || !opts) return "";
      return `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><span class="lbl">${label}</span>
        <span class="seg">${opts.map(o => `<button data-select="${role}" data-v="${evcEsc(o)}" class="${S(role) === o ? "on" : ""}">${evcEsc(o.replace(/_/g, " "))}</button>`).join("")}</span></div>`;
    };
    const ct = this._attr("climate", "temperature");
    return `<div class="tiles">${tiles}</div>
      <div class="g3" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:calc(var(--u)*1.1)">
        ${this._id("climate") && this._id("climate").startsWith("climate.") ? `<div class="glass card"><h4>Cabin temperature <span class="lbl">Inside ${this._fmt(this._num("inside_temp"), 1)}° · Outside ${this._fmt(this._num("outside_temp"), 1)}°</span></h4>
          <div class="stepper"><button data-act="temp_down" aria-label="Cooler">−</button><span>${ct == null ? "--" : Number(ct).toFixed(1) + "°"}</span><button data-act="temp_up" aria-label="Warmer">+</button></div></div>` : ""}
        ${this._id("seat_left") || this._id("wheel_heater") ? `<div class="glass card"><h4>Heaters</h4>${sel("seat_left", "Driver seat")}${sel("seat_right", "Passenger seat")}${sel("wheel_heater", "Steering wheel")}</div>` : ""}
        <div class="glass card"><h4>Car</h4><div>
          ${this._id("odometer") ? `<div class="line"><span>Odometer</span><b>${this._fmt(this._num("odometer"))} ${evcEsc(this._unit("odometer"))}</b></div>` : ""}
          ${this._id("update") ? `<div class="line"><span>Software</span><b>${S("update") === "on" ? "Update available" : "Up to date"}</b></div>` : ""}
          ${this._id("online") ? `<div class="line"><span>Connection</span><b>${S("online") === "on" ? "Online" : "Asleep"}</b></div>` : ""}
        </div>${this._id("wake") ? `<button class="go ghost" style="margin:0" data-act="wake">${this._resolved.adapter.wakeLabel || "Wake car"}</button>` : ""}</div>
      </div>`;
  }

  // ── Energy page ─────────────────────────────────────────────
  _monthName(k, long) { const [y, m] = k.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: long ? "long" : "short" }); }
  _cost(b) { const t = this._cfg.tariff; return b.off * t.offpeak_rate + b.peak * t.peak_rate; }
  _standing() {
    const t = this._cfg.tariff, id = t.standing_charge_entity, s = id && this._hass.states[id];
    const v = s ? parseFloat(s.state) : NaN;
    return isNaN(v) ? t.standing_charge : v;
  }

  async _loadEnergy() {
    this._eLoading = true; this._eAt = Date.now();
    try { this._energy = await evcLoadEnergy(this._hass, this._cfg); this._eErr = null; }
    catch (e) { this._eErr = (e && e.message) || "Couldn't load energy statistics"; }
    this._eLoading = false;
    if (this._view === "energy" || this._view === "home") this._renderDynamic();
  }

  _scenarios() {
    const c = this._cfg, t = c.tariff;
    const now = { off: t.offpeak_rate, peak: t.peak_rate, s: t.offpeak_start, e: t.offpeak_end, standing: this._standing() };
    const cmp = c.compare ? { off: c.compare.offpeak_rate, peak: c.compare.peak_rate, s: c.compare.offpeak_start, e: c.compare.offpeak_end, standing: c.compare.standing_charge ?? now.standing } : null;
    const base = cmp || now;
    const hb = c.home_battery;
    const inv = this._ui.inv || (hb && (hb.inverter_options || [6])[0]);
    const batt = hb ? { usable: hb.kwh * (hb.usable ?? 0.95), eff: hb.efficiency ?? 0.9, kw: inv } : null;
    const chg = c.ev_charger_kw ? { kw: c.ev_charger_kw } : null;
    const out = { today: { tariff: now, battery: null, charger: null, t: "Today", d: "Your current tariff" } };
    if (cmp) out.cmp = { tariff: cmp, battery: null, charger: null, t: `Switch to ${c.compare.name || "new tariff"}`, d: `${this._rate(cmp.off)} from ${this._hh(cmp.s)} to ${this._hh(cmp.e)}` };
    if (batt) out.battery = { tariff: base, battery: batt, charger: null, t: "+ Home battery", d: `${hb.name || hb.kwh + " kWh battery"}, ${inv} kW inverter` };
    if (chg) out.charger = { tariff: base, battery: null, charger: chg, t: `+ ${chg.kw} kW car charger`, d: "All car charging moved off-peak" };
    if (batt && chg) out.both = { tariff: base, battery: batt, charger: chg, t: "+ Battery and charger", d: "Both of the above" };
    return out;
  }
  _yearCosts() {
    const E = this._energy;
    if (!E || !Object.keys(E.days).length) return null;
    const first = Object.keys(E.days).sort()[0], [fy, fm] = first.split("-").map(Number), keys = [];
    for (let i = 0; i < 12; i++) { const d = new Date(fy, fm - 1 + i, 1); keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`); }
    const sc = this._scenarios(), months = EvcModel.months(E.days, keys, sc), year = {};
    Object.keys(sc).forEach(id => { year[id] = months.reduce((a, m) => a + m.cost[id], 0); });
    return { sc, year, n: Object.keys(E.days).length };
  }
  _bestSaving() {
    const y = this._yearCosts();
    if (!y) return null;
    const ids = Object.keys(y.year).filter(i => i !== "today");
    if (!ids.length) return null;
    const best = ids.reduce((b, i) => y.year[i] < y.year[b] ? i : b, ids[0]), save = y.year.today - y.year[best];
    return save > 0 ? { label: `${y.sc[best].t.replace(/^\+ /, "")} would save`, save } : null;
  }

  _energyHtml() {
    if (!this._energyOn()) return `<div class="glass card empty"><h4>Energy and costs</h4>
      Add your charging statistics to see monthly charging, costs and what a different tariff, home battery or charger would save. In the card's settings, set
      <code>energy.car_statistic</code> to a sensor that counts the car's home charging in kWh, and optionally <code>energy.home_statistic</code> to your whole-house meter.</div>`;
    if (this._eErr) return `<div class="glass card empty">${evcEsc(this._eErr)}</div>`;
    const E = this._energy;
    if (!E) return `<div class="glass card empty">Loading energy history…</div>`;
    const keys = E.monthKeys;
    if (this._ui.mon == null || !keys.includes(this._ui.mon)) this._ui.mon = keys[keys.length - 1];
    const mk = this._ui.mon, m = E.months[mk], kwh = m.car.off + m.car.peak, cost = this._cost(m.car);
    const prevK = keys[keys.indexOf(mk) - 1], prev = prevK && E.months[prevK], prevShare = prev && (prev.car.off + prev.car.peak) ? prev.car.off / (prev.car.off + prev.car.peak) * 100 : null;
    const share = kwh ? m.car.off / kwh * 100 : 0;
    const homeCost = m.hasHome ? this._cost(m.carMetered) + this._cost(m.home) : 0;
    const invs = (this._cfg.home_battery && this._cfg.home_battery.inverter_options) || [];
    if (this._ui.inv == null && invs.length) this._ui.inv = invs[0];
    const y = this._yearCosts(), seg = (k, opts) => `<span class="seg">${opts.map(([v, l]) => `<button data-ui="${k}" data-v="${v}" class="${String(this._ui[k]) === String(v) ? "on" : ""}">${l}</button>`).join("")}</span>`;
    let what = `<div class="empty">The comparison needs at least one full day of readings from both the car and the house meter${this._cfg.energy.home_statistic ? "" : " (set <code>energy.home_statistic</code>)"}.</div>`;
    if (y && Object.keys(y.sc).length > 1) {
      const div = this._ui.per === "year" ? 1 : 12, ids = Object.keys(y.sc), max = Math.max(...ids.map(i => y.year[i])), best = ids.reduce((b, i) => y.year[i] < y.year[b] ? i : b, "today");
      what = ids.map(id => `<div class="opt ${id === "today" ? "now" : ""}"><div><div class="t">${evcEsc(y.sc[id].t)}${id === best && id !== "today" ? "<em>Cheapest</em>" : ""}</div><small>${evcEsc(y.sc[id].d)}</small></div>
        <div><div class="v">${this._money(y.year[id] / div, 0)}</div><div class="s" style="${id === "today" ? "color:var(--t3)" : ""}">${id === "today" ? (div === 1 ? "a year" : "a month") : (y.year.today - y.year[id] >= 0 ? "save " : "costs ") + this._money(Math.abs(y.year.today - y.year[id]) / div, 0)}</div></div>
        <div class="bar"><i style="width:${y.year[id] / max * 100}%"></i></div></div>`).join("")
        + `<div class="lbl">Based on ${y.n} day${y.n === 1 ? "" : "s"} of your real usage. Months without readings use your average day.</div>`;
      const hb = this._cfg.home_battery;
      if (hb && y.sc.battery) {
        const without = y.sc.cmp ? "cmp" : "today", save = y.year[without] - y.year.battery, yrs = save > 0 ? hb.cost / save : null;
        what += `<div style="margin-top:auto;padding-top:10px;border-top:1px solid var(--edge)"><div class="lbl">Battery payback</div>
          <div class="big" style="font-size:calc(var(--u)*2.4);margin-top:4px">${yrs == null ? "Doesn't pay back" : yrs.toFixed(1)} <span class="lbl">${yrs == null ? "" : `years to earn back ${this._money(hb.cost, 0)}`}</span></div>
          <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.1);margin-top:10px;overflow:hidden"><i style="display:block;height:100%;width:${yrs == null ? 100 : Math.min(100, yrs / 15 * 100)}%;background:linear-gradient(90deg,var(--lime-d),var(--lime))"></i></div>
          <div class="key" style="justify-content:space-between;margin-top:6px"><span>0</span><span>5</span><span>10</span><span>15 yrs</span></div></div>`;
      }
    }
    return `<div class="g4" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:calc(var(--u)*1.1)">
        <div class="glass card kpi"><span class="lbl">Home charging · ${this._monthName(mk, true)}</span><b>${Math.round(kwh)} kWh</b><small>${this._money(this._cost(m.car))} at your tariff</small></div>
        <div class="glass card kpi"><span class="lbl">Average price</span><b>${kwh ? this._rate(cost / kwh) : "--"}</b><small>per kWh</small></div>
        <div class="glass card kpi"><span class="lbl">Charged off-peak</span><b style="color:var(--lime)">${Math.round(share)}%</b><small>${prevShare == null ? "" : (() => { const d = Math.abs(Math.round(share - prevShare)); return d === 0 ? `Same as ${this._monthName(prevK)}` : `${share >= prevShare ? "Up" : "Down"} ${d} point${d === 1 ? "" : "s"} on ${this._monthName(prevK)}`; })()}</small></div>
        <div class="glass card kpi"><span class="lbl">Car's share of the bill</span><b>${m.hasHome && homeCost ? Math.round(this._cost(m.carMetered) / homeCost * 100) + "%" : "--"}</b><small>${m.hasHome ? this._money(homeCost) + " electricity used" : "Needs the house meter"}</small></div>
      </div>
      <div class="g2" style="display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:calc(var(--u)*1.1);min-height:0">
        <div style="display:grid;gap:calc(var(--u)*1.1);grid-template-rows:minmax(0,1fr) minmax(0,1fr);min-height:0">
          <div class="glass card"><h4>Usage · last 30 days <span style="display:flex;gap:8px;flex-wrap:wrap">${seg("who", [["both", "Combined"], ["car", "Car"], ["home", "House"]])}${seg("unit", [["kwh", "kWh"], ["money", this._cfg.currency]])}</span></h4>
            <div class="chart" id="usage"></div>
            <div class="key"><span><i style="background:var(--lime)"></i>Off-peak</span><span><i style="background:rgba(255,255,255,.35)"></i>Peak</span><span id="usageSum" style="margin-left:auto"></span></div></div>
          <div class="glass card"><h4>Monthly home charging <span class="lbl">Tap a month</span></h4><div class="chart" id="months"></div></div>
        </div>
        <div class="glass card"><h4>What if you switched? ${seg("per", [["year", "Year"], ["month", "Month"]])}</h4>
          ${invs.length > 1 ? seg("inv", invs.map(k => [k, `${k} kW inverter`])) : ""}
          ${what}</div>
      </div>`;
  }

  _drawCharts() {
    const E = this._energy, r = this.shadowRoot;
    if (!E || !r.getElementById("usage")) return;
    const t = this._cfg.tariff, money = this._ui.unit === "money", who = this._ui.who, u = E.usage, rows = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, v = u[k];
      let o = 0, p = 0;
      if (v) { if (who !== "home") { o += v.car.off; p += v.car.peak; } if (who !== "car") { o += v.home.off; p += v.home.peak; } }
      if (money) { o *= t.offpeak_rate; p *= t.peak_rate; }
      rows.push({ l: i % 5 === 0 ? String(d.getDate()) : "", a: o, b: p });
    }
    this._bars("usage", rows, 4, null, null, money);
    const tot = rows.reduce((a, x) => a + x.a + x.b, 0);
    r.getElementById("usageSum").textContent = `30 days: ${money ? this._money(tot) : Math.round(tot) + " kWh"}`;
    const mrows = E.monthKeys.map(k => ({ l: this._monthName(k), a: E.months[k].car.off, b: E.months[k].car.peak }));
    this._bars("months", mrows, 18, E.monthKeys.indexOf(this._ui.mon), i => { this._ui.mon = E.monthKeys[i]; this._renderDynamic(); }, false);
  }
  _bars(id, rows, gap, sel, onPick, money) {
    const el = this.shadowRoot.getElementById(id), W = el.clientWidth || 500, H = el.clientHeight || 160, pl = 38, pb = 18, iw = W - pl, ih = H - pb - 6;
    const max = Math.max(0.01, ...rows.map(r => r.a + r.b)) * 1.08, bw = iw / rows.length;
    let s = "";
    for (let k = 0; k <= 3; k++) {
      const yy = 6 + ih - ih * k / 3, v = max * k / 3;
      s += `<line x1="${pl}" x2="${W}" y1="${yy}" y2="${yy}" stroke="rgba(255,255,255,.07)"/><text x="${pl - 8}" y="${yy + 3}" text-anchor="end" font-size="10" fill="rgba(226,233,240,.45)">${money ? this._cfg.currency + v.toFixed(v < 10 ? 1 : 0) : Math.round(v)}</text>`;
    }
    rows.forEach((r, i) => {
      const x = pl + i * bw + gap / 2, w = Math.max(2, bw - gap), ha = ih * r.a / max, hb = ih * r.b / max, y0 = 6 + ih, dim = sel != null && sel !== i ? 0.45 : 1;
      s += `<g data-i="${i}" style="cursor:${onPick ? "pointer" : "default"}" opacity="${dim}"><rect x="${x - gap / 2}" y="6" width="${bw}" height="${ih}" fill="transparent"/><rect x="${x}" y="${y0 - ha}" width="${w}" height="${ha}" rx="2" fill="var(--lime)"/><rect x="${x}" y="${y0 - ha - hb - (hb ? 1 : 0)}" width="${w}" height="${hb}" rx="2" fill="rgba(255,255,255,.32)"/></g>`;
      if (r.l) s += `<text x="${x + w / 2}" y="${H - 3}" text-anchor="middle" font-size="10" fill="rgba(226,233,240,.45)">${r.l}</text>`;
    });
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" font-family="inherit">${s}</svg>`;
    if (onPick) el.querySelectorAll("g[data-i]").forEach(g => g.addEventListener("click", () => onPick(+g.dataset.i)));
  }

  // ── Settings page ───────────────────────────────────────────
  _settingsHtml() {
    const c = this._cfg, t = c.tariff, line = (a, b) => `<div class="line"><span>${a}</span><b>${b}</b></div>`;
    const devs = this._resolved.devices, dn = id => { const d = this._hass.devices && this._hass.devices[id]; return d ? (d.name_by_user || d.name) : id; };
    const ents = Object.keys(EVC_ROLES).map(r => `<div class="line"><span>${evcEsc(EVC_ROLES[r])}</span><b>${this._id(r) ? evcEsc(this._id(r)) : '<span style="color:var(--t3)">Not found</span>'}</b></div>`).join("");
    return `<div class="g3" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:calc(var(--u)*1.1);align-items:start">
      <div class="glass card"><h4>Car</h4><div>
        ${line("Make", evcEsc(this._resolved.adapter.name))}${line("Name", evcEsc(this._name()))}
        ${devs.length > 1 ? `<div class="line"><span>Show</span><span class="seg">${devs.map(d => `<button data-device="${d}" class="${d === this._resolved.deviceId ? "on" : ""}">${evcEsc(dn(d))}</button>`).join("")}</span></div>` : ""}
        ${line("Full screen", c.fullscreen ? "On" : "Off")}${line("Card version", EVC_VERSION)}</div>
        <div class="lbl">To change these settings, edit the card. ${c.fullscreen ? "Use the button at the bottom of the side bar to show Home Assistant's menus." : ""}</div></div>
      <div class="glass card"><h4>Tariff</h4><div>
        ${line("Off-peak", `${this._rate(t.offpeak_rate)} · ${this._hh(t.offpeak_start)} to ${this._hh(t.offpeak_end)}`)}${line("Peak", this._rate(t.peak_rate))}${line("Standing charge", `${this._rate(this._standing())} a day`)}
        ${c.compare ? line(`Compare with ${evcEsc(c.compare.name || "")}`, `${this._rate(c.compare.offpeak_rate)} / ${this._rate(c.compare.peak_rate)}`) : ""}
        ${c.home_battery ? line("Home battery", `${c.home_battery.kwh} kWh · ${this._money(c.home_battery.cost, 0)}`) : ""}
        ${c.ev_charger_kw ? line("Car charger", `${c.ev_charger_kw} kW`) : ""}
        ${line("Charging statistic", c.energy && c.energy.car_statistic ? evcEsc(c.energy.car_statistic) : "Not set")}</div></div>
      <div class="glass card"><h4>Entities found <span class="lbl">${Object.keys(this._resolved.entities).length} of ${Object.keys(EVC_ROLES).length}</span></h4><div style="max-height:calc(var(--u)*26);overflow:auto">${ents}</div></div>
    </div>`;
  }

  // ── Actions ─────────────────────────────────────────────────
  _toast(t) {
    const e = this.shadowRoot.getElementById("toast");
    if (!e) return;
    e.textContent = t; e.classList.add("on");
    clearTimeout(this._tt); this._tt = setTimeout(() => e.classList.remove("on"), 2400);
  }
  async _call(domain, service, role, data = {}, done) {
    const id = this._id(role);
    if (!id) return;
    try { await this._hass.callService(domain, service, Object.assign({ entity_id: id }, data)); if (done) this._toast(done); }
    catch (e) { this._toast((e && e.message) || "The car didn't respond"); }
  }
  // Risky actions need a second tap within 4 seconds
  _confirm(act) {
    if (this._arm === act) { this._arm = null; clearTimeout(this._armT); return true; }
    this._arm = act; clearTimeout(this._armT);
    this._armT = setTimeout(() => { this._arm = null; this._renderDynamic(); }, 4000);
    this._renderDynamic();
    return false;
  }

  _onClick(e) {
    const t = e.target.closest("button,[data-i]");
    if (!t || t.disabled) return;
    if (t.dataset.go) { this._view = t.dataset.go; this._arm = null; this._renderDynamic(); return; }
    if (t.hasAttribute("data-peek")) { this._peek = !this._peek; this._applyFullscreen(); this._renderAll(); return; }
    if (t.dataset.limit) { this._setLimit(+t.dataset.limit); return; }
    if (t.dataset.ui) { const k = t.dataset.ui, v = t.dataset.v; this._ui[k] = k === "inv" ? +v : v; this._renderDynamic(); return; }
    if (t.dataset.device) { this._deviceOverride = t.dataset.device; this._resolved = evcResolve(this._hass, Object.assign({}, this._cfg, { device_id: t.dataset.device })); this._mapEl = null; this._renderAll(); return; }
    if (t.dataset.select) { this._call("select", "select_option", t.dataset.select, { option: t.dataset.v }); return; }
    const a = t.dataset.act;
    if (!a) return;
    const S = r => this._st(r);
    const step = r => this._attr(r, "step") || 1;
    switch (a) {
      case "charge_on": return this._id("charge_switch") ? this._call("switch", "turn_on", "charge_switch", {}, "Charging started") : this._call("button", "press", "charge_start", {}, "Asked the car to start charging");
      case "charge_off": return this._id("charge_switch") ? this._call("switch", "turn_off", "charge_switch", {}, "Charging stopped") : this._call("button", "press", "charge_stop", {}, "Asked the car to stop charging");
      case "port_open": return this._call("cover", "open_cover", "charge_port", {}, "Charge port opening");
      case "port_close": return this._call("cover", "close_cover", "charge_port", {}, "Charge port closing");
      case "port": return S("charge_port") === "open" ? this._call("cover", "close_cover", "charge_port", {}, "Charge port closing") : this._call("cover", "open_cover", "charge_port", {}, "Charge port opening");
      case "amp_up": case "amp_down": {
        const cur = this._num("charge_current"); if (cur == null) return;
        const v = Math.max(this._attr("charge_current", "min") ?? 0, Math.min(this._attr("charge_current", "max") ?? 32, cur + (a === "amp_up" ? 1 : -1) * step("charge_current")));
        return this._call("number", "set_value", "charge_current", { value: v }, `Charge current set to ${v} A`);
      }
      case "temp_up": case "temp_down": {
        const cur = parseFloat(this._attr("climate", "temperature")); if (isNaN(cur)) return;
        const st = this._attr("climate", "target_temp_step") || 0.5;
        return this._call("climate", "set_temperature", "climate", { temperature: cur + (a === "temp_up" ? st : -st) });
      }
      case "lock": if (!this._lockCtl()) return this._toast("This car's lock can only be read, not changed, from Home Assistant");
        if (this._locked()) { if (!this._confirm(a)) return; return this._call("lock", "unlock", "lock", {}, "Unlocking"); } return this._call("lock", "lock", "lock", {}, "Locking");
      case "sentry": return this._call("switch", S("sentry") === "on" ? "turn_off" : "turn_on", "sentry");
      case "defrost": return this._call("switch", S("defrost") === "on" ? "turn_off" : "turn_on", "defrost");
      case "climate": {
        const id = this._id("climate"), on = this._climateOn();
        if (id.startsWith("climate.")) return this._call("climate", on ? "turn_off" : "turn_on", "climate");
        if (id.startsWith("switch.")) return this._call("switch", on ? "turn_off" : "turn_on", "climate");
        return this._call("button", "press", on ? "climate_stop" : "climate_start", {}, on ? "Asked the car to stop climate" : "Asked the car to start climate");
      }
      case "frunk": if (S("frunk") === "open") return this._toast("Close the front trunk by hand"); if (!this._confirm(a)) return; return this._call("cover", "open_cover", "frunk", {}, "Opening the front trunk");
      case "trunk": if (!this._confirm(a)) return; return this._call("cover", S("trunk") === "open" ? "close_cover" : "open_cover", "trunk", {}, S("trunk") === "open" ? "Closing the boot" : "Opening the boot");
      case "windows": return this._call("cover", S("windows") === "open" ? "close_cover" : "open_cover", "windows", {}, S("windows") === "open" ? "Closing windows" : "Venting windows");
      case "flash": return this._call("button", "press", "flash", {}, "Flashing lights");
      case "honk": if (!this._confirm(a)) return; return this._call("button", "press", "honk", {}, "Honking");
      case "wake": return this._call("button", "press", "wake", {}, this._resolved.adapter.wakeLabel ? "Syncing with the car" : "Waking the car");
    }
  }
  _onChange(e) {
    const r = e.target.dataset && e.target.dataset.range;
    if (!r) return;
    this._setLimit(+e.target.value);
  }
}

// ---- 50-editor.js ----
// ── Visual editor (Edit card) ───────────────────────────────────
// Built on Home Assistant's own ha-form, so it looks and behaves like the built-in card editors.
class EvCockpitCardEditor extends HTMLElement {
  setConfig(config) { this._config = Object.assign({}, config); this._render(); }
  set hass(hass) { this._hass = hass; if (this._form) this._form.hass = hass; else this._render(); }

  _schema() {
    const adapter = EVC_ADAPTERS[this._config.vehicle] || EVC_ADAPTERS.tesla;
    const integ = adapter.platforms[0];
    const num = (name, label, step = 0.001) => ({ name, label, selector: { number: { mode: "box", step } } });
    const hour = (name, label) => ({ name, label, selector: { number: { min: 0, max: 23, mode: "box" } } });
    return [
      { name: "vehicle", label: "Car make", selector: { select: { mode: "dropdown", options: Object.entries(EVC_ADAPTERS).map(([v, a]) => ({ value: v, label: a.name })) } } },
      { name: "device_id", label: "Car (leave empty to use the first one found)", selector: { device: integ ? { filter: adapter.platforms.map(p => ({ integration: p })) } : {} } },
      { type: "grid", name: "", schema: [
        { name: "name", label: "Name shown on the card", selector: { text: {} } },
        { name: "model", label: "Model shown on the card", selector: { text: {} } },
      ] },
      { type: "grid", name: "", schema: [
        { name: "fullscreen", label: "Full screen (hides the header and sidebar)", selector: { boolean: {} } },
        { name: "currency", label: "Currency symbol", selector: { text: {} } },
      ] },
      { name: "", type: "expandable", title: "Pictures", schema: [
        { name: "image", label: "Scene photo URL (e.g. /local/my-car.jpg)", selector: { text: {} } },
        { name: "side_image", label: "Side view picture URL", selector: { text: {} } },
        { name: "xray_image", label: "Battery x-ray picture URL", selector: { text: {} } },
      ] },
      { name: "tariff", type: "expandable", title: "Your electricity tariff", schema: [
        { type: "grid", name: "", schema: [num("offpeak_rate", "Off-peak rate (per kWh)"), num("peak_rate", "Peak rate (per kWh)"), hour("offpeak_start", "Off-peak starts (hour)"), hour("offpeak_end", "Off-peak ends (hour)"), num("standing_charge", "Standing charge (per day)")] },
        { name: "standing_charge_entity", label: "Standing charge sensor (optional)", selector: { entity: { domain: "sensor" } } },
      ] },
      { name: "energy", type: "expandable", title: "Charging history and costs", schema: [
        { name: "car_statistic", label: "Car's home charging energy (kWh, total increasing)", selector: { statistic: {} } },
        { name: "home_statistic", label: "Whole-house electricity meter (optional)", selector: { statistic: {} } },
        { name: "months", label: "Months of history", selector: { number: { min: 2, max: 24, mode: "box" } } },
      ] },
      { name: "compare", type: "expandable", title: "Tariff to compare with (optional)", schema: [
        { name: "name", label: "Tariff name", selector: { text: {} } },
        { type: "grid", name: "", schema: [num("offpeak_rate", "Off-peak rate"), num("peak_rate", "Peak rate"), hour("offpeak_start", "Off-peak starts"), hour("offpeak_end", "Off-peak ends"), num("standing_charge", "Standing charge")] },
      ] },
      { name: "home_battery", type: "expandable", title: "Home battery to compare (optional)", schema: [
        { name: "name", label: "Battery name", selector: { text: {} } },
        { type: "grid", name: "", schema: [num("kwh", "Capacity (kWh)", 0.1), num("cost", "Installed cost", 1), num("usable", "Usable share (0–1)", 0.01), num("efficiency", "Round-trip efficiency (0–1)", 0.01)] },
      ] },
      { name: "ev_charger_kw", label: "Home car charger to compare, kW (optional)", selector: { number: { min: 0, max: 22, step: 0.1, mode: "box" } } },
      { name: "entities", type: "expandable", title: "Entities (override what was found)", schema:
        Object.entries(EVC_ROLES).map(([role, label]) => ({ name: role, label, selector: { entity: {} } })) },
    ];
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = s => s.label || s.name;
      this._form.addEventListener("value-changed", ev => {
        const cfg = this._clean(ev.detail.value);
        this._config = cfg;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: cfg }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = Object.assign({ vehicle: "tesla", fullscreen: true }, this._config);
    this._form.schema = this._schema();
  }

  // Drop empty values so the saved YAML stays short
  _clean(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      const o = {};
      Object.entries(v).forEach(([k, x]) => {
        const c = this._clean(x);
        if (c === "" || c == null || (typeof c === "object" && !Array.isArray(c) && !Object.keys(c).length)) return;
        o[k] = c;
      });
      return o;
    }
    return v;
  }
}

// ---- 90-register.js ----
// ── Registration ────────────────────────────────────────────────
if (!customElements.get("ev-cockpit-card")) customElements.define("ev-cockpit-card", EvCockpitCard);
if (!customElements.get("ev-cockpit-card-editor")) customElements.define("ev-cockpit-card-editor", EvCockpitCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === "ev-cockpit-card")) {
  window.customCards.push({
    type: "ev-cockpit-card",
    name: "EV Cockpit Card",
    description: "Full-screen cockpit for your electric car: charging, controls, location and energy costs.",
    preview: false,
    documentationURL: "https://github.com/Muji86/ev-cockpit-card",
  });
}
console.info(`%c EV-COCKPIT-CARD %c ${EVC_VERSION} `, "background:#c8f53c;color:#14200a;font-weight:700", "background:#1c2533;color:#fff");

})();
