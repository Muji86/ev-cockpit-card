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
      outside_temp: "outside_temperature", frunk: "frunk", trunk: "trunk", windows: "windows",
      seat_left: "seat_heater_front_left", seat_right: "seat_heater_front_right", wheel_heater: "steering_wheel_heater",
      location: "location", flash: "flash_lights", honk: "honk_horn", wake: "wake", online: "status",
      update: "update", odometer: "odometer",
    },
    images: { scene: "tesla/scene", side: "tesla/side", xray: "tesla/xray" },
    // Where the car sits in the scene photo (photo pixels), so the card can frame it
    sceneCar: { w: 1310, h: 490, cx: 640, roof: 72, tyres: 440 },
    model: "Tesla",
  },
  // Volkswagen ID. family (ID.3, ID.4, ID.5, ID.7, ID. Buzz) through the community
  // "Volkswagen We Connect ID" integration (volkswagen_we_connect_id) or "Volkswagen Car-Net"
  // (volkswagencarnet). Neither sets translation keys, so entities are matched on their
  // English entity_id endings. Not yet checked against a real car: report gaps in an issue.
  volkswagen: {
    name: "Volkswagen ID.",
    platforms: ["volkswagen_we_connect_id", "volkswagencarnet"],
    keys: {},
    suffixes: {
      battery: "state_of_charge", range: "range", charging: "charging_state", charger_power: "charge_power",
      time_to_full: "remaining_charging_time", charge_limit: "target_state_of_charge", charge_current: "max_charge_current_ac",
      charge_switch: "charging", charge_cable: "plug_connection_state", lock: "door_lock",
      climate: "climatisation", inside_temp: "inside_temperature", outside_temp: "outside_temperature",
      location: "position", odometer: "odometer", windows: "window_heating", online: "online",
    },
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

const EVC_DOMAINS = {
  charge_limit: "number", charge_current: "number", charge_switch: "switch", charge_port: "cover", charge_cable: "binary_sensor",
  lock: "lock", sentry: "switch", climate: "climate", defrost: "switch", frunk: "cover", trunk: "cover", windows: "cover",
  seat_left: "select", seat_right: "select", wheel_heater: "select", location: "device_tracker", flash: "button",
  honk: "button", wake: "button", online: "binary_sensor", update: "update",
};

// Find the car and map every role to an entity_id. Returns { adapter, deviceId, entities, devices }.
function evcResolve(hass, cfg) {
  const adapter = EVC_ADAPTERS[cfg.vehicle] || EVC_ADAPTERS.tesla;
  const reg = Object.values(hass.entities || {});
  const mine = reg.filter(e => adapter.platforms.includes(e.platform) && e.device_id);
  const devices = [...new Set(mine.map(e => e.device_id))];
  // Prefer the configured car, else the first one that reports a battery level
  let deviceId = cfg.device_id && devices.includes(cfg.device_id) ? cfg.device_id : null;
  if (!deviceId) {
    deviceId = devices.find(d => mine.some(e => e.device_id === d && e.translation_key === adapter.keys.battery)) || devices[0] || null;
  }
  const onDevice = mine.filter(e => e.device_id === deviceId);
  const entities = {};
  Object.keys(EVC_ROLES).forEach(role => {
    const key = adapter.keys[role];
    const domain = EVC_DOMAINS[role];
    let hit = key && onDevice.find(e => e.translation_key === key && (!domain || e.entity_id.startsWith(domain + ".")));
    if (!hit && adapter.suffixes[role]) {
      const suf = "_" + adapter.suffixes[role];
      const byKey = !!key;   // with keys, only untranslated entities fall back to names
      hit = onDevice.find(e => (!byKey || !e.translation_key) && e.entity_id.endsWith(suf) && (!domain || e.entity_id.startsWith(domain + ".")));
    }
    if (hit) entities[role] = hit.entity_id;
  });
  Object.entries(cfg.entities || {}).forEach(([role, id]) => { if (id) entities[role] = id; });
  return { adapter, deviceId, entities, devices };
}
