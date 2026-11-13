// Builds the free guide's PDFs (public/pdf/hard-2-break-<skill>.pdf) from guide-data.js, so the PDF can't drift from the web guide.
// ONE tall page per skill, phone width, steps grouped by the skill's `phases`. Run after editing guide-data.js:  node pdf.mjs
import { writeFileSync, rmSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { SKILLS } from "./public/guide-data.js";

const pub = fileURLToPath(new URL("public/", import.meta.url));
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SITE = "hardtobreakprogram.com/guide";
const W = "5.5in";

const css = `
@font-face { font-family: Knewave; src: url(fonts/knewave.woff2); }
@font-face { font-family: Barlow; src: url(fonts/barlow-400.woff2); font-weight: 400; }
@font-face { font-family: Barlow; src: url(fonts/barlow-600.woff2); font-weight: 600; }
@font-face { font-family: "Barlow Condensed"; src: url(fonts/barlow-cond-600.woff2); font-weight: 600; }
@page { margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #121110; }
body { width: ${W}; padding: .35in .35in .3in; background: #121110; color: #f2eee4; font: 400 10pt/1.4 Barlow, sans-serif; }
a { color: #f5c842; }
.label, dt { font: 600 8pt/1.3 "Barlow Condensed", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #a39e92; }
.head { display: flex; align-items: center; gap: 12pt; }
.head img { width: .85in; flex: none; }
h1 { margin-top: 3pt; font: 400 21pt/1.02 Knewave, sans-serif; text-transform: uppercase; }
dl { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10pt; margin-top: 14pt; padding: 9pt 0; border-block: 1px solid rgba(242,238,228,.14); }
dd { margin-top: 2pt; font-size: 8.5pt; line-height: 1.35; }
.rule { margin-top: 9pt; font-weight: 600; font-size: 9.5pt; }
.rule a { font-weight: 400; }
.phase { margin-top: 16pt; break-inside: avoid; }
.phase h2 { display: flex; align-items: baseline; gap: 8pt; padding-bottom: 5pt; border-bottom: 2px solid #f5c842; font: 400 14pt/1 Knewave, sans-serif; text-transform: uppercase; color: #f5c842; }
.phase h2 span { font: 600 8pt/1 "Barlow Condensed", sans-serif; letter-spacing: .14em; color: #a39e92; }
.step { display: grid; grid-template-columns: .62in 1fr; gap: 11pt; padding: 9pt 0; border-bottom: 1px solid rgba(242,238,228,.1); break-inside: avoid; }
.step img { width: .62in; height: 1.1in; object-fit: cover; border-radius: 5pt; background: #1a1917; }
.top { display: flex; justify-content: space-between; align-items: baseline; gap: 8pt; }
.top h3 { font: 400 12pt/1.1 Knewave, sans-serif; text-transform: uppercase; }
.top h3 small { display: block; margin-bottom: 2pt; font: 600 7.5pt/1 "Barlow Condensed", sans-serif; letter-spacing: .12em; color: #a39e92; }
.top h3 small em { font-style: normal; color: #f5c842; }
.goal { flex: none; text-align: right; }
.goal b { display: block; font: 400 15pt/1 Knewave, sans-serif; color: #f5c842; white-space: nowrap; }
.goal span { display: block; max-width: 1.25in; margin-top: 1pt; font: 600 7.5pt/1.15 "Barlow Condensed", sans-serif; text-transform: uppercase; color: #f2eee4; }
ol { list-style: none; counter-reset: c; margin-top: 5pt; }
ol li { counter-increment: c; position: relative; padding: 0 0 2pt 13pt; font-size: 9pt; line-height: 1.35; }
ol li::before { content: counter(c); position: absolute; left: 0; font: 400 9pt/1.5 Knewave, sans-serif; color: #f5c842; }
.tip { margin-top: 4pt; padding: 5pt 7pt; background: #1a1917; border-radius: 4pt; font-size: 8.5pt; }
.end { margin-top: 18pt; break-inside: avoid; }
.end h2 { font: 400 14pt/1.05 Knewave, sans-serif; text-transform: uppercase; }
.end > p { margin-top: 5pt; }
.offer { margin-top: 14pt; padding: 12pt; background: #1a1917; border: 1px solid rgba(242,238,228,.14); border-radius: 9pt; }
.offer h2 em { font-style: normal; color: #f5c842; }
.offer p { margin-top: 6pt; font-size: 9pt; }
.btn { display: block; margin-top: 10pt; padding: 9pt; background: #f5c842; color: #121110; border-radius: 7pt; text-align: center; text-decoration: none; font: 400 12pt/1 Knewave, sans-serif; text-transform: uppercase; }
.legal { margin-top: 12pt; font-size: 7.5pt; color: #a39e92; }`;

function html(s) {
  const total = s.phases.reduce((a, [, c]) => a + c, 0);
  if (total !== s.steps.length) throw new Error(`${s.id}: phases cover ${total} steps, guide has ${s.steps.length}`);
  let k = 0;
  const phases = s.phases.map(([name, count], p) => `<section class="phase">
    <h2>${name}<span>Phase ${p + 1}</span></h2>
    ${s.steps.slice(k, k + count).map((t) => { k++; return `<div class="step">
      <img src="${t.clip}.jpg" alt="">
      <div>
        <div class="top">
          <h3><small>Step ${k}${t.added ? " · <em>Added step</em>" : ""}</small>${t.name}</h3>
          <p class="goal"><b>${t.dose}</b><span>${t.unit}</span></p>
        </div>
        <ol>${t.cues.map((c) => `<li>${c}</li>`).join("")}</ol>
        ${t.tip ? `<p class="tip">${t.tip}</p>` : ""}
      </div>
    </div>`; }).join("")}
  </section>`).join("");

  // one page: after fonts and images load, size the page to the content's height
  const fit = `<script>addEventListener("load", async () => { await document.fonts.ready;
    const st = document.createElement("style"); st.textContent = "@page { size: ${W} " + Math.ceil(document.body.getBoundingClientRect().height + 2) + "px; }";
    document.head.append(st); });</script>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${s.title} · Hard 2 Break free guide</title><style>${css}</style></head><body>
  <header class="head"><img src="media/logo.png" alt=""><div><p class="label">Free guide · Joshua Heald</p><h1>${s.title}</h1></div></header>
  <dl>
    <div><dt>How often</dt><dd>${s.how}</dd></div>
    <div><dt>How long</dt><dd>${s.long}</dd></div>
    <div><dt>You need</dt><dd>${s.need}</dd></div>
  </dl>
  <p class="rule">Hit the goal on each step before you move on. That way you don't injure yourself. <a href="${s.reel}">Watch the original tutorial →</a></p>
  ${phases}
  <section class="end">
    <p class="label">After the last step</p>
    <p>${s.finish}</p>
    <div class="offer">
      <h2>Ready for the <em>next skill?</em></h2>
      <p>The Hard to Break Program is six skills, every step from zero, with your workouts planned out. It's launching very soon. Join the waitlist and get two bonuses free: post-training stretching and rest-day mobility.</p>
      <a class="btn" href="https://www.${SITE}">Join the waitlist</a>
    </div>
    <p class="legal">Not medical advice. Train at your own risk and stop if something hurts. Terms: hardtobreakprogram.com/terms · @trainerjosh</p>
  </section>${fit}</body></html>`;
}

mkdirSync(pub + "pdf", { recursive: true });
for (const s of SKILLS) {
  const tmp = `${pub}_pdf-${s.id}.html`; // inside public/ so fonts and clips load by relative path; removed after
  writeFileSync(tmp, html(s));
  try {
    execFileSync(CHROME, ["--headless", "--disable-gpu", "--allow-file-access-from-files", "--no-pdf-header-footer",
      `--print-to-pdf=${pub}pdf/hard-2-break-${s.id}.pdf`, "--virtual-time-budget=8000", `file://${tmp}`], { stdio: "ignore" });
  } finally { rmSync(tmp); }
  console.log(`pdf/hard-2-break-${s.id}.pdf`);
}
