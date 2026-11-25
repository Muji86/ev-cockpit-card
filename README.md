# EV Cockpit Card

A full-screen Home Assistant dashboard for your electric car. It shows charge, range and the
charging session at a glance, and has pages for charging controls, the car's location, energy
costs and remote controls. It is built to be cast to a Nest Hub or a TV and fits the screen without scrolling, and on phones it becomes an app-style layout with a bottom tab bar.

**Supported cars**

| Make | Integration | Status |
| --- | --- | --- |
| Tesla | [Tesla Fleet](https://www.home-assistant.io/integrations/tesla_fleet/), [Teslemetry](https://www.home-assistant.io/integrations/teslemetry/), Tessie | Tested with Tesla Fleet |
| Volkswagen ID. | An MQTT bridge with German entity names (tested on an ID.4); [We Connect ID](https://github.com/mitch-dc/volkswagen_we_connect_id) and Car-Net (early) | Charging, charge limit, climate and sync work through the car's buttons; the lock is read only |
| Any other car | Choose the entities yourself (`vehicle: generic`) | Works with whatever your car exposes |

## What it shows

- **Overview**: the car in its scene, battery and range, charging state, charge limit presets, vehicle status, a charging dial with a live countdown, and quick health checks.
- **Charging**: charge current, charge limit, start/stop, charge port, the session so far and today's tariff with off-peak hours.
- **Location**: a live map with the car and home, distance from home, and flash lights / honk horn.
- **Energy and costs** (optional): monthly home charging, the off-peak share, 30-day usage for the car and the house, and what a different tariff, a home battery or a faster home charger would save, worked out hour by hour from your own meter readings.
- **Controls**: doors, Sentry mode, climate and cabin temperature, defrost, front trunk, boot, windows, charge port, seat and steering wheel heaters.

Risky actions (unlocking, honking, opening the boot or front trunk) need a second tap.

## Install

### HACS

1. In HACS, open the menu ⋮ → **Custom repositories**.
2. Add `https://github.com/Muji86/ev-cockpit-card` with the type **Dashboard**.
3. Find **EV Cockpit Card**, install it and reload the browser.

### Manual

Copy `dist/ev-cockpit-card.js` to `/config/www/` and add it under **Settings → Dashboards → ⋮ → Resources** as `/local/ev-cockpit-card.js` (JavaScript module).

## Set up

Make a new dashboard for the car, add a view with the **Panel** layout and add the card. The minimum is:

```yaml
type: custom:ev-cockpit-card
vehicle: tesla
```

The card finds the car by itself. Everything else can be set in the visual editor.

### Full screen and casting

With `fullscreen: true` (the default) the card covers Home Assistant's header and sidebar.
It steps aside while you edit the dashboard. Use the button at the bottom of its side bar to show Home Assistant's menus.

To cast it to a Nest Hub or a TV, use the **Home Assistant Cast** integration and the `cast.show_lovelace_view` action:

```yaml
action: cast.show_lovelace_view
data:
  entity_id: media_player.kitchen_display
  dashboard_path: ev-cockpit
  view_path: car
```

### On phones

On a phone (or any screen under 760 px wide or 500 px tall) the sections stack and scroll inside the card,
with a tab bar at the bottom. In the Home Assistant Companion app, give the car its own dashboard so the card
can use the whole screen.

### Energy and costs

These pages need a statistic that counts the car's home charging in kWh (for example a
utility meter on the car's charge energy) and, for the comparisons, your whole-house meter.

```yaml
type: custom:ev-cockpit-card
vehicle: tesla
currency: "£"
tariff:
  offpeak_rate: 0.09        # per kWh
  peak_rate: 0.31
  offpeak_start: 0          # hour, local time
  offpeak_end: 5
  standing_charge: 0.4705   # per day
energy:
  car_statistic: sensor.my_car_home_charging
  home_statistic: sensor.electricity_meter_energy
compare:                    # optional: a tariff to compare with
  name: EDF overnight
  offpeak_rate: 0.066
  peak_rate: 0.36
  offpeak_start: 23
  offpeak_end: 6
home_battery:               # optional: a home battery to compare
  name: 16 kWh battery
  kwh: 16
  usable: 0.95
  efficiency: 0.9
  cost: 5000
  inverter_options: [6, 8]
ev_charger_kw: 7            # optional: a faster home charger to compare
```

### All options

| Option | Default | What it does |
| --- | --- | --- |
| `vehicle` | `tesla` | `tesla`, `volkswagen` or `generic` |
| `device_id` | first car found | Which car to show when you have more than one |
| `name`, `model` | from the device | Text shown on the card |
| `fullscreen` | `true` | Cover the header and sidebar |
| `image`, `side_image`, `xray_image` | built-in pictures | Your own pictures (URLs, e.g. `/local/car.jpg`) |
| `currency` | `£` | Currency symbol; with `£`, rates show in pence |
| `limit_presets` | `[80, 90, 100]` | Charge limit buttons |
| `tariff`, `energy`, `compare`, `home_battery`, `ev_charger_kw` | | See above |
| `entities` | | Override any entity the card found, e.g. `entities: { battery: sensor.my_soc }` |

The **Settings** page in the card lists every entity it found, which helps when something is missing.

## Adding another car

See [CONTRIBUTING.md](CONTRIBUTING.md). A new make is usually one block in `src/10-adapters.js` plus three pictures.

## Pictures

The Tesla and Volkswagen pictures included are illustrations of those cars. Tesla and Volkswagen are
trademarks of their owners; this project isn't affiliated with or endorsed by either company.
Set `image`, `side_image` and `xray_image` to use photos of your own car.

## Licence

MIT
