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
    documentationURL: "https://github.com/__REPO__",
  });
}
console.info(`%c EV-COCKPIT-CARD %c ${EVC_VERSION} `, "background:#c8f53c;color:#14200a;font-weight:700", "background:#1c2533;color:#fff");
