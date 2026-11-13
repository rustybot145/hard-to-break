// Builds the free guide's PDFs (public/pdf/hard-2-break-<skill>.pdf) from guide-data.js, so the PDF can't drift from the web guide.
// Phone-shaped pages (9:16), one step per page. Run after editing guide-data.js:  node pdf.mjs
import { writeFileSync, rmSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SKILLS } from "./public/guide-data.js";

const pub = fileURLToPath(new URL("public/", import.meta.url));
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SITE = "hardtobreakprogram.com/guide";

const css = `
@font-face { font-family: Knewave; src: url(fonts/knewave.woff2); }
@font-face { font-family: Barlow; src: url(fonts/barlow-400.woff2); font-weight: 400; }
@font-face { font-family: Barlow; src: url(fonts/barlow-600.woff2); font-weight: 600; }
@font-face { font-family: "Barlow Condensed"; src: url(fonts/barlow-cond-600.woff2); font-weight: 600; }
@page { size: 5in 8.889in; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { background: #121110; color: #f2eee4; font: 400 11pt/1.45 Barlow, sans-serif; }
a { color: #f5c842; }
.page { position: relative; width: 5in; height: 8.889in; overflow: hidden; break-after: page; background: #121110; }
.pad { padding: .4in .4in 0; }
.label, dt { font: 600 8.5pt/1.3 "Barlow Condensed", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #a39e92; }
h1 { margin-top: 6pt; font: 400 25pt/1.04 Knewave, sans-serif; text-transform: uppercase; }
h1 em { display: block; font-style: normal; color: #f5c842; }
.logo { display: block; width: 1.3in; margin: .35in auto .1in; }
.cover { text-align: center; }
.cover h1 { margin-top: 10pt; }
dl { margin-top: 16pt; text-align: left; border-top: 1px solid rgba(242,238,228,.14); }
dl div { padding: 8pt 0; border-bottom: 1px solid rgba(242,238,228,.14); }
dd { margin-top: 2pt; }
.rule { margin-top: 12pt; font-weight: 600; text-align: left; }
.fig { position: relative; height: 3.9in; overflow: hidden; background: #1a1917; }
.fig .shot { position: relative; display: block; height: 100%; margin: 0 auto; }
.rail { display: flex; gap: 2pt; margin-bottom: 9pt; }
.rail i { flex: 1; height: 3pt; border-radius: 2pt; background: rgba(242,238,228,.14); }
.rail .done { background: rgba(245,200,66,.45); } .rail .on { background: #f5c842; }
.added { margin-left: 6pt; padding-left: 6pt; border-left: 1px solid rgba(242,238,228,.14); color: #f5c842; }
.step h1 { font-size: 19pt; }
.goal { display: flex; align-items: center; gap: 10pt; margin-top: 10pt; padding: 8pt 0; border-block: 1px solid rgba(242,238,228,.14); }
.goal b { font: 400 26pt/1 Knewave, sans-serif; color: #f5c842; white-space: nowrap; }
.goal span { font: 600 11pt/1.15 "Barlow Condensed", sans-serif; text-transform: uppercase; }
.goal small { display: block; margin-top: 2pt; font: 400 8.5pt/1.2 Barlow, sans-serif; text-transform: none; color: #a39e92; }
ol { list-style: none; counter-reset: c; margin-top: 10pt; }
ol li { counter-increment: c; position: relative; padding: 0 0 6pt 20pt; font-size: 10.5pt; }
ol li::before { content: counter(c); position: absolute; left: 0; top: -1pt; font: 400 12pt/1.3 Knewave, sans-serif; color: #f5c842; }
.tip { margin-top: 2pt; padding: 8pt 10pt; background: #1a1917; border-radius: 6pt; font-size: 10pt; }
.foot { position: absolute; left: .4in; right: .4in; bottom: .25in; display: flex; justify-content: space-between; font: 600 7.5pt/1 "Barlow Condensed", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #6f6a60; }
.lede { margin-top: 12pt; font-size: 12pt; }
.offer { margin-top: 18pt; padding: 14pt; background: #1a1917; border: 1px solid rgba(242,238,228,.14); border-radius: 10pt; }
.offer h2 { font: 400 15pt/1.05 Knewave, sans-serif; text-transform: uppercase; }
.offer h2 em { font-style: normal; color: #f5c842; }
.offer p { margin-top: 8pt; font-size: 10pt; }
.btn { display: block; margin-top: 12pt; padding: 11pt; background: #f5c842; color: #121110; border-radius: 8pt; text-align: center; text-decoration: none; font: 400 13pt/1 Knewave, sans-serif; text-transform: uppercase; }
.legal { margin-top: 14pt; font-size: 8pt; color: #a39e92; }`;

const foot = (s, p) => `<div class="foot"><span>${s.name} · Free guide · @trainerjosh</span><span>${p}</span></div>`;

function html(s) {
  const n = s.steps.length;
  const cover = `<section class="page"><div class="pad cover">
    <img class="logo" src="media/logo.png" alt="">
    <p class="label">Free guide · Joshua Heald</p>
    <h1>${s.title}</h1>
    <dl>
      <div><dt>How often</dt><dd>${s.how}</dd></div>
      <div><dt>How long</dt><dd>${s.long}</dd></div>
      <div><dt>You need</dt><dd>${s.need}</dd></div>
    </dl>
    <p class="rule">Hit the goal on each step before you move on. That way you don't injure yourself.</p>
    <p class="rule"><a href="${s.reel}">Watch the original tutorial →</a></p>
  </div>${foot(s, `${n} steps`)}</section>`;

  const steps = s.steps.map((t, k) => `<section class="page step">
    <figure class="fig"><img class="shot" src="${t.clip}.jpg" alt=""></figure>
    <div class="pad">
      <div class="rail">${s.steps.map((_, j) => `<i class="${j < k ? "done" : j === k ? "on" : ""}"></i>`).join("")}</div>
      <p class="label">Step ${k + 1} of ${n}${t.added ? `<span class="added">Added step</span>` : ""}</p>
      <h1>${t.name}</h1>
      <p class="goal"><b>${t.dose}</b><span>${t.unit}<small>${k + 1 < n ? "Your goal before the next step" : "Your goal"}</small></span></p>
      <ol>${t.cues.map((c) => `<li>${c}</li>`).join("")}</ol>
      ${t.tip ? `<p class="tip">${t.tip}</p>` : ""}
    </div>${foot(s, `Step ${k + 1} / ${n}`)}</section>`).join("");

  const end = `<section class="page"><div class="pad">
    <img class="logo" src="media/logo.png" alt="">
    <p class="label">You hit every step</p>
    <h1>${s.title}</h1>
    <p class="lede">${s.finish}</p>
    <div class="offer">
      <h2>Ready for the <em>next skill?</em></h2>
      <p>The Hard to Break Program is six skills, every step from zero, with your workouts planned out. It's launching very soon. Join the waitlist and get two bonuses free: post-training stretching and rest-day mobility.</p>
      <a class="btn" href="https://www.${SITE}">Join the waitlist</a>
    </div>
    <p class="legal">Not medical advice. Train at your own risk and stop if something hurts. Terms: hardtobreakprogram.com/terms</p>
  </div>${foot(s, "")}</section>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${s.title} · Hard 2 Break free guide</title><style>${css}</style></head><body>${cover}${steps}${end}</body></html>`;
}

mkdirSync(pub + "pdf", { recursive: true });
for (const s of SKILLS) {
  const tmp = `${pub}_pdf-${s.id}.html`; // inside public/ so fonts and clips load by relative path; removed after
  writeFileSync(tmp, html(s));
  try {
    execFileSync(CHROME, ["--headless", "--disable-gpu", "--allow-file-access-from-files", "--no-pdf-header-footer",
      `--print-to-pdf=${pub}pdf/hard-2-break-${s.id}.pdf`, "--virtual-time-budget=5000", `file://${tmp}`], { stdio: "ignore" });
  } finally { rmSync(tmp); }
  console.log(`pdf/hard-2-break-${s.id}.pdf`);
}
