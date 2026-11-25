// ── Energy and cost model ────────────────────────────────────────
// Costs are worked out per hour from Home Assistant long-term statistics, so each
// tariff's off-peak window is priced correctly. Pure functions; no Home Assistant needed.

const EvcModel = {
  inWindow(hour, s, e) { return s <= e ? hour >= s && hour < e : hour >= s || hour < e; },

  // day: [{ hour, home, car, off? }]; tariff: { off, peak, s, e, standing, actual? }
  // With tariff.actual, a row's own `off` flag (from the real hourly cost) wins over the fixed window.
  // battery: null | { usable, eff, kw } — charged off-peak, runs the house (not the car) at peak
  // charger: null | { kw } — moves all car charging into the off-peak window, as far as it fits
  isOff(x, tariff) { return tariff.actual && x.off != null ? x.off : this.inWindow(x.hour, tariff.s, tariff.e); },

  dayCost(day, tariff, battery, charger) {
    const r = { carOff: 0, carPeak: 0, homeOff: 0, homePeak: 0, battUsed: 0, battCharge: 0 };
    const offHours = day.filter(x => this.isOff(x, tariff)).length;
    let carTotal = 0;
    day.forEach(x => { carTotal += x.car; });
    if (charger) {
      r.carOff = Math.min(carTotal, charger.kw * offHours);
      r.carPeak = carTotal - r.carOff;
    }
    let store = battery ? battery.usable : 0;
    const order = [...day].sort((a, b) => ((a.hour - tariff.e + 24) % 24) - ((b.hour - tariff.e + 24) % 24));
    order.forEach(x => {
      const off = this.isOff(x, tariff);
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

  // Hourly car charging from a battery-level statistic: each rise in the hourly mean,
  // converted to kWh from the wall. rows: [{ start, mean }] sorted by start.
  socToKwh(rows, batteryKwh, efficiency) {
    const out = {};
    let prev = null;
    rows.forEach(r => {
      if (r.mean == null) return;
      const d = prev == null ? 0 : r.mean - prev;
      out[r.start] = d > 0 ? (d / 100) * batteryKwh / (efficiency || 0.9) : 0;
      prev = r.mean;
    });
    return out;
  },

  // Off-peak or not, from the real price paid that hour (cost ÷ energy); null when it can't tell.
  offFromCost(cost, kwh, t) {
    if (cost == null || !(kwh > 0.2)) return null;   // costs are rounded to the penny: small hours are too noisy
    const rate = cost / kwh;
    if (rate > t.peak_rate * 1.25 || rate < 0) return null;   // e.g. the hour that also carries the standing charge
    return rate < (t.offpeak_rate + t.peak_rate) / 2;
  },

  averageDay(days) {
    const sums = {};
    days.forEach(d => d.forEach(x => {
      const s = sums[x.hour] || (sums[x.hour] = { hour: x.hour, home: 0, car: 0 });
      s.home += x.home; s.car += x.car;
      if (x.off != null) { s.offN = (s.offN || 0) + 1; s.offY = (s.offY || 0) + (x.off ? 1 : 0); }
    }));
    const n = days.length;
    return Object.values(sums).sort((a, b) => a.hour - b.hour)
      .map(s => ({ hour: s.hour, home: s.home / n, car: s.car / n, off: s.offN ? s.offY / s.offN >= 0.5 : undefined }));
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
  // car_source: "energy" (kWh counter, default), "power" (charging power in kW: the hourly mean is the kWh)
  // or "soc" (battery level: each rise × battery_kwh ÷ charge_efficiency)
  const src = e.car_source || "energy";
  const ids = [e.car_statistic, e.home_statistic, e.cost_statistic].filter(Boolean);
  const res = await hass.callWS({
    type: "recorder/statistics_during_period", start_time: new Date(start.getTime() - 3600e3).toISOString(), end_time: now.toISOString(),
    statistic_ids: ids, period: "hour", types: src === "energy" ? ["change"] : ["change", "mean"], units: { energy: "kWh", power: "kW" },
  });
  const windowOff = h => EvcModel.inWindow(h, t.offpeak_start, t.offpeak_end);
  const months = {};
  monthKeys.forEach(k => { months[k] = { car: { off: 0, peak: 0 }, carMetered: { off: 0, peak: 0 }, home: { off: 0, peak: 0 }, hasHome: false }; });
  const hours = {};
  const row = (id, field) => (res[id] || []).forEach(r => {
    const h = hours[r.start] || (hours[r.start] = { car: null, meter: null });
    h[field] = Math.max(0, r.change || 0);
  });
  if (src === "energy") row(e.car_statistic, "car");
  else {
    const rows = (res[e.car_statistic] || []).slice().sort((a, b) => a.start - b.start);
    const kwh = src === "soc" ? EvcModel.socToKwh(rows, e.battery_kwh || 75, e.charge_efficiency || 0.9)
      : Object.fromEntries(rows.map(r => [r.start, Math.max(0, r.mean || 0)]));
    Object.entries(kwh).forEach(([st, v]) => { (hours[st] || (hours[st] = { car: null, meter: null })).car = v; });
  }
  if (e.cost_statistic) (res[e.cost_statistic] || []).forEach(r => { (hours[r.start] || (hours[r.start] = { car: null, meter: null })).cost = r.change; });
  if (e.home_statistic) row(e.home_statistic, "meter");
  const usage = {}, days = {}, counts = {};
  Object.entries(hours).forEach(([st, h]) => {
    const p = parts(new Date(Number(st))), m = months[p.key];
    const realOff = EvcModel.offFromCost(h.cost, h.meter, t);
    const isOff = realOff == null ? windowOff(p.hour) : realOff, b = isOff ? "off" : "peak";
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
    (days[p.day] || (days[p.day] = [])).push({ hour: p.hour, home: h.meter - car, car, off: realOff == null ? undefined : realOff });
  });
  const complete = {};
  Object.entries(days).forEach(([d, rows]) => { if (counts[d].meter >= 23 && counts[d].car >= 23) complete[d] = rows; });
  return { months, monthKeys, days: complete, usage };
}
