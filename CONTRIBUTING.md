# Contributing

## Build and check

No dependencies are needed, only Node 18 or later.

```bash
npm run check      # builds dist/ and runs scripts/test.mjs
```

`dev/harness.html` runs the built card against a mock Home Assistant. Open it in a browser, for example
`dev/harness.html?view=energy&state=charging` (views: home, charging, location, energy, controls, settings).

`dist/` is committed because HACS installs from it. Run `npm run build` before committing.

## Adding a car make

1. Add the car's integration to Home Assistant and open the card with `vehicle: generic`. The card's
   **Settings** page lists every role it can use.
2. Add an adapter to `EVC_ADAPTERS` in `src/10-adapters.js`:
   - `platforms`: the integration domains, as in `hass.entities[...].platform`.
   - `keys`: role → the entity's `translation_key`. Prefer these: they don't change when the car is renamed or with the language.
   - `suffixes`: role → the English end of the `entity_id`, for integrations that don't set translation keys.
   - `images`: `scene`, `side` and `xray` pictures, stored in `src/images/<make>/`.
   - `sceneCar`: where the car sits in the scene picture, in pixels (`w`, `h`, the car's centre `cx`, its `roof` and the bottom of its `tyres`), so the card can frame it.
3. Add a check for it in `scripts/test.mjs`, run `npm run check` and open a pull request.

The roles and what each one needs to be (sensor, number, switch, cover…) are listed in `EVC_ROLES` and `EVC_DOMAINS`.

## Releases

Bump `version` in `package.json`, run `npm run build`, commit, then tag `vX.Y.Z` and publish a GitHub release.
HACS offers the update to everyone who installed the card.
