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
.chart{position:relative}
.chart .tip{position:absolute;pointer-events:none;z-index:3;display:flex;flex-direction:column;gap:2px;padding:7px 10px;border-radius:9px;background:rgba(8,12,16,.92);border:1px solid var(--edge2);font-size:12px;color:var(--t2);white-space:nowrap;box-shadow:0 6px 18px rgba(0,0,0,.4)}
.chart .tip[hidden]{display:none}
.chart .tip b{font-weight:500;color:var(--ink)}
.chart .tip i{display:inline-block;width:7px;height:7px;border-radius:2px;margin-right:5px}
.seg.wrap{flex-wrap:wrap;align-self:flex-start}
table.cmp{width:100%;border-collapse:collapse;font-size:calc(var(--u)*.74);color:var(--t2)}
table.cmp th{font-weight:400;color:var(--t3);text-align:right;padding:4px 0 4px 8px}
table.cmp td{text-align:right;padding:5px 0 5px 8px;border-top:1px solid var(--edge)}
table.cmp th:first-child,table.cmp td:first-child{text-align:left;padding-left:0}
table.cmp tr.on td{color:var(--ink)}
table.cmp small{color:var(--t3)}
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
/* tablets and narrow windows: the card scrolls inside itself; the side rail stays.
   Wide screens under 1000px keep the full-screen layout: Home Assistant Cast draws at 960×540 and scales it up to the TV. */
@media (max-width:1000px) and (max-aspect-ratio:3/2), (max-height:500px){
  .frame{height:auto;min-height:0;overflow:visible} .scene{border-radius:inherit}
  .rail{position:sticky;top:0;align-self:start;height:100vh;height:100dvh}
  /* full screen: the frame is fixed and only the content scrolls, so the menu never moves */
  :host([fullscreen]) .frame{position:fixed;inset:0;height:100vh;height:100dvh;overflow:hidden}
  :host([fullscreen]) .main{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
  :host([fullscreen]) .rail{position:relative;height:auto;align-self:stretch}
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
  .frame{display:flex;flex-direction:column;border-radius:18px}
  :host([fullscreen]) .frame{border-radius:0}
  :host([fullscreen]) .main{flex:1 1 auto;min-height:0}
  .main{order:1;flex:none;padding:calc(12px + env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) 16px max(12px,env(safe-area-inset-left,0px));gap:12px}
  .rail{order:2;position:sticky;bottom:0;top:auto;height:auto;align-self:stretch;z-index:6;flex:none;flex-direction:row;justify-content:space-around;gap:4px;
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
  :host([fullscreen]) .rail{position:relative}
}
@media (max-height:500px){ .hero{height:58vh} }
@media (max-width:380px){ .stats4{grid-template-columns:repeat(2,minmax(0,1fr))} .g4{grid-template-columns:minmax(0,1fr)!important} }
`;
