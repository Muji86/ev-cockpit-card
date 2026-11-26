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
    const r = { carOff: 0, carPeak: 0, homeOff: 0, homePeak: 0, battUsed: 0, battCharge: 0, gridEmpty: 0, gridPower: 0, emptyAt: null, overHours: 0, peakHome: 0 };
    const offHours = day.filter(x => this.isOff(x, tariff)).length;
    let carTotal = 0;
    day.forEach(x => { carTotal += x.car; });
    if (charger) {
      r.carOff = Math.min(carTotal, charger.kw * offHours);
      r.carPeak = carTotal - r.carOff;
    }
    // The battery fills off-peak, as far as the inverter can charge it in the off-peak hours
    let store = battery ? Math.min(battery.usable, battery.kw * offHours * battery.eff) : 0;
    const order = [...day].sort((a, b) => ((a.hour - tariff.e + 24) % 24) - ((b.hour - tariff.e + 24) % 24));
    order.forEach(x => {
      const off = this.isOff(x, tariff);
      if (!charger) r[off ? "carOff" : "carPeak"] += x.car;
      if (off) {
        r.homeOff += x.home;
        if (battery) store = Math.min(battery.usable, store + battery.kw * battery.eff);   // a cheap slot in the day tops it up
        return;
      }
      r.peakHome += x.home;
      const d = battery ? Math.min(store, battery.kw, x.home) : 0;
      store -= d;
      r.battUsed += d;
      r.homePeak += x.home - d;
      // Why the house still drew from the grid at peak: the battery was empty, or the house wanted more than the inverter gives
      const rest = x.home - d, over = battery ? Math.min(rest, Math.max(0, x.home - battery.kw)) : 0;
      if (battery && rest > 1e-6) {
        if (over > 1e-6) { r.gridPower += over; r.overHours++; }
        if (rest - over > 1e-6) { r.gridEmpty += rest - over; if (r.emptyAt == null) r.emptyAt = x.hour; }
      }
    });
    r.battCharge = battery ? r.battUsed / battery.eff : 0;
    r.offKwh = r.carOff + r.homeOff + r.battCharge;
    r.peakKwh = r.carPeak + r.homePeak;
    r.cost = r.offKwh * tariff.off + r.peakKwh * tariff.peak + tariff.standing;
    return r;
  },

  // How a battery copes on each real day: days it covers the whole peak, when it runs out, and what still comes from the grid.
  // days: { key: [{hour, home, car, off?}] }; battery: { usable, eff, kw }
  shortfall(days, tariff, battery) {
    const keys = Object.keys(days).sort(), n = keys.length;
    const out = { n, covered: 0, emptyDays: 0, powerDays: 0, emptyAt: [], gridEmpty: 0, gridPower: 0, carPeak: 0, overHours: 0, peakUse: [], maxHour: 0, worst: null };
    keys.forEach(k => {
      const r = this.dayCost(days[k], tariff, battery, null);
      days[k].forEach(x => { if (!this.isOff(x, tariff)) out.maxHour = Math.max(out.maxHour, x.home); });
      out.peakUse.push(r.peakHome);
      out.gridEmpty += r.gridEmpty; out.gridPower += r.gridPower; out.carPeak += r.carPeak; out.overHours += r.overHours;
      if (r.gridEmpty > 0.05) { out.emptyDays++; out.emptyAt.push(r.emptyAt); }
      if (r.gridPower > 0.05) out.powerDays++;
      if (r.gridEmpty + r.gridPower <= 0.05) out.covered++;
      const g = r.gridEmpty + r.gridPower;
      if (!out.worst || g > out.worst.grid) out.worst = { key: k, grid: g, peak: r.peakHome, emptyAt: r.emptyAt };
    });
    const q = (arr, p) => { if (!arr.length) return null; const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
    out.typicalEmpty = q(out.emptyAt, 0.5);
    out.peakMedian = q(out.peakUse, 0.5);
    out.peak90 = q(out.peakUse, 0.9);
    return out;
  },

  // Hourly car charging from a battery-level statistic: each rise in the hour's highest level
  // (the hourly mean lags by half an hour), converted to kWh from the wall. rows: [{ start, max?, mean }] by start.
  socToKwh(rows, batteryKwh, efficiency) {
    const out = {};
    let prev = null;
    rows.forEach(r => {
      const v = r.max != null ? r.max : r.mean;
      if (v == null) return;
      const d = prev == null ? 0 : v - prev;
      out[r.start] = d > 0 ? (d / 100) * batteryKwh / (efficiency || 0.9) : 0;
      prev = v;
    });
    return out;
  },

  // Battery levels reach Home Assistant when the car syncs, so a rise can be reported an hour after the
  // meter saw it. Where an hour has more car charging than the meter recorded, move the excess to the
  // neighbouring hours with room on the meter (earlier first), keeping `base` kWh for the house.
  // hours: [{ car, meter }] in time order; changes car in place.
  alignToMeter(hours, base = 0.1) {
    const room = i => { const h = hours[i]; return h && h.meter != null && h.car != null ? Math.max(0, h.meter - base - h.car) : 0; };
    hours.forEach((h, i) => {
      if (h.car == null || h.meter == null || h.car <= h.meter) return;
      let extra = h.car - h.meter;
      h.car = h.meter;
      for (const j of [i - 1, i - 2, i + 1, i + 2]) {
        if (extra <= 0) break;
        const take = Math.min(extra, room(j));
        if (take > 0) { hours[j].car += take; extra -= take; }
      }
    });
    return hours;
  },

  // Smart-charging slots reported by the supplier (Octopus / EDF "completed_dispatches"): the latest
  // figure for each half-hour wins, because slots are sometimes revised after they first appear.
  // attrsList: attribute objects in time order. Returns { [hourStartMs]: kWh }.
  dispatchHours(attrsList) {
    const slots = {};
    attrsList.forEach(a => (a && a.completed_dispatches || []).forEach(d => {
      const t = Date.parse(d.start), kwh = Math.abs(parseFloat(d.charge_in_kwh));
      if (!isNaN(t) && !isNaN(kwh)) slots[t] = kwh;
    }));
    const hours = {};
    Object.entries(slots).forEach(([t, kwh]) => { const h = Math.floor(t / 3600e3) * 3600e3; hours[h] = (hours[h] || 0) + kwh; });
    return hours;
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
  const ids = [e.car_statistic, e.home_statistic, e.cost_statistic, e.measured_statistic].filter(Boolean);
  const res = await hass.callWS({
    type: "recorder/statistics_during_period", start_time: new Date(start.getTime() - 3600e3).toISOString(), end_time: now.toISOString(),
    statistic_ids: ids, period: "hour", types: src === "energy" ? ["change"] : ["change", "mean", "max"], units: { energy: "kWh", power: "kW" },
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
  const hourOf = st => hours[st] || (hours[st] = { car: null, meter: null });
  // Measured charging replaces the estimate from the hour it starts. measured_statistic: a kWh total of the
  // supplier's smart-charging slots (reported late, so lined up with the meter below).
  if (e.measured_statistic) {
    const rows = (res[e.measured_statistic] || []).filter(r => r.change != null).sort((a, b) => a.start - b.start);
    if (rows.length) {
      Object.keys(hours).forEach(st => { if (+st >= rows[0].start) hours[st].car = 0; });
      rows.forEach(r => { const h = hourOf(r.start); h.car = Math.max(0, r.change); h.exact = true; });
    }
  }
  // dispatch_entity: the supplier's smart-charging sensor; its recent history gives every slot at its real time
  if (e.dispatch_entity) {
    try {
      const hist = await hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), end_time: now.toISOString(),
        entity_ids: [e.dispatch_entity], minimal_response: false, no_attributes: false, significant_changes_only: false });
      const states = hist[e.dispatch_entity] || [];
      const cur = hass.states[e.dispatch_entity];
      const attrs = states.map(x => x.a || x.attributes || {}).concat(cur ? [cur.attributes] : []);
      const slots = EvcModel.dispatchHours(attrs), times = Object.keys(slots).map(Number);
      const firstSeen = states.length ? (states[0].lu || states[0].last_updated_ts || 0) * 1000 : Date.now();
      const from = Math.floor(Math.min(firstSeen, ...(times.length ? times : [firstSeen])) / 3600e3) * 3600e3;
      Object.keys(hours).forEach(st => { if (+st >= from) { hours[st].car = 0; hours[st].exact = true; } });
      times.forEach(t => { const h = hourOf(t); h.car = slots[t]; h.exact = true; });
    } catch (err) { /* history unavailable: keep the other sources */ }
  }
  if (e.cost_statistic) (res[e.cost_statistic] || []).forEach(r => { (hours[r.start] || (hours[r.start] = { car: null, meter: null })).cost = r.change; });
  if (e.home_statistic) row(e.home_statistic, "meter");
  if (src !== "energy" || e.measured_statistic) EvcModel.alignToMeter(Object.keys(hours).sort((a, b) => a - b).map(k => hours[k]));
  // Counters and the supplier's slots are home charging; estimates only count where the house meter saw them
  const trusted = h => src === "energy" || h.exact;
  const usage = {}, days = {}, counts = {};
  Object.entries(hours).forEach(([st, h]) => {
    const p = parts(new Date(Number(st))), m = months[p.key];
    const realOff = EvcModel.offFromCost(h.cost, h.meter, t);
    const isOff = realOff == null ? windowOff(p.hour) : realOff, b = isOff ? "off" : "peak";
    // Battery level or power can't tell home from a public charger: only hours the house meter saw count
    if (m && h.car) m.car[b] += trusted(h) && h.meter == null ? h.car : (h.meter == null ? 0 : Math.min(h.car, h.meter));
    const u = usage[p.day] || (usage[p.day] = { car: { off: 0, peak: 0 }, home: { off: 0, peak: 0 }, meter: 0 });
    u.car[b] += h.meter == null ? (trusted(h) ? (h.car || 0) : 0) : Math.min(h.car || 0, h.meter);
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
