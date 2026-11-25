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
    sceneCar: { w: 1310, h: 490, cx: 640, roof: 72, tyres: 440 },
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
    sceneCar: { w: 1310, h: 490, cx: 640, roof: 65, tyres: 445 },
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
