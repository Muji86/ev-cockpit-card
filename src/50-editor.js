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
        { name: "car_source", label: "The car statistic is…", selector: { select: { mode: "dropdown", options: [
          { value: "energy", label: "Energy (kWh counter)" }, { value: "power", label: "Charging power (kW)" }, { value: "soc", label: "Battery level (%)" }] } } },
        { name: "car_statistic", label: "Car's home charging statistic", selector: { statistic: {} } },
        { type: "grid", name: "", schema: [
          { name: "battery_kwh", label: "Battery size, kWh (for battery level)", selector: { number: { min: 10, max: 200, step: 0.1, mode: "box" } } },
          { name: "charge_efficiency", label: "Charging efficiency (0–1)", selector: { number: { min: 0.5, max: 1, step: 0.01, mode: "box" } } },
        ] },
        { name: "cost_statistic", label: "Hourly cost statistic (optional: finds the real off-peak hours)", selector: { statistic: {} } },
        { name: "dispatch_entity", label: "Smart charging sensor with completed slots (Octopus / EDF, optional)", selector: { entity: { domain: "binary_sensor" } } },
        { name: "measured_statistic", label: "Measured charging total, kWh (optional, replaces the estimate)", selector: { statistic: {} } },
        { name: "home_statistic", label: "Whole-house electricity meter (optional)", selector: { statistic: {} } },
        { name: "months", label: "Months of history", selector: { number: { min: 2, max: 24, mode: "box" } } },
        { name: "start_date", label: "Leave out readings before (optional, e.g. a tariff change)", selector: { date: {} } },
      ] },
      { name: "compare", type: "expandable", title: "Tariff to compare with (optional)", schema: [
        { name: "name", label: "Tariff name", selector: { text: {} } },
        { type: "grid", name: "", schema: [num("offpeak_rate", "Off-peak rate"), num("peak_rate", "Peak rate"), hour("offpeak_start", "Off-peak starts"), hour("offpeak_end", "Off-peak ends"), num("standing_charge", "Standing charge")] },
      ] },
      { name: "home_battery", type: "expandable", title: "Home battery to compare (optional)", schema: [
        { name: "quotes", label: "Quotes (pick one on the card; these replace the Fogstar prices)", selector: { object: { multiple: true, label_field: "source", fields: {
          source: { label: "Source (installer or shop)", required: true, selector: { text: {} } },
          battery_kwh: { label: "Battery capacity (kWh)", selector: { number: { min: 0, step: 0.1, mode: "box" } } },
          usable_kwh: { label: "Usable capacity (kWh, optional)", selector: { number: { min: 0, step: 0.1, mode: "box" } } },
          battery_cost: { label: "Battery cost", selector: { number: { min: 0, step: 1, mode: "box" } } },
          inverter_kw: { label: "Inverter power (kW)", selector: { number: { min: 0, step: 0.1, mode: "box" } } },
          inverter_cost: { label: "Inverter cost", selector: { number: { min: 0, step: 1, mode: "box" } } },
          install_cost: { label: "Installation cost", selector: { number: { min: 0, step: 1, mode: "box" } } },
          package_cost: { label: "All-in price, if the quote gives one (battery, inverter and fitting)", selector: { number: { min: 0, step: 1, mode: "box" } } },
          extras_cost: { label: "Add-ons", selector: { number: { min: 0, step: 1, mode: "box" } } },
          discount: { label: "Discount", selector: { number: { min: 0, step: 1, mode: "box" } } },
        } } } },
        { name: "preset", label: "Battery", selector: { select: { mode: "dropdown", options: [
          { value: "fogstar", label: "Fogstar 16.1 kWh + inverter bundles" }, { value: "custom", label: "My own battery (capacity and cost below)" }] } } },
        { type: "grid", name: "", schema: [num("install_cost", "Installation cost (default 2500 for Fogstar)", 1), num("usable", "Usable share (0–1, default 0.95)", 0.01),
          num("efficiency", "Round-trip efficiency (0–1)", 0.01), { name: "three_phase", label: "Three-phase supply", selector: { boolean: {} } }] },
        { name: "name", label: "Own battery: name", selector: { text: {} } },
        { type: "grid", name: "", schema: [num("kwh", "Own battery: capacity (kWh)", 0.1), num("cost", "Own battery: price", 1)] },
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
