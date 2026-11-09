// Free guide: home (pick a skill) → skill intro → one step per screen → finish + program button.
// The place lives in the URL hash (#handstand/3), so Back, refresh and shared links all work.
import { SKILLS, CHECKOUT } from "./guide-data.js";

const app = document.getElementById("app");
const KEY = "h2b-guide";
const nb = (t) => t.replace(/-/g, "&#8209;");

// remembered step per skill: a convenience only, so the page works without storage
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = (id, i) => { try { localStorage.setItem(KEY, JSON.stringify({ ...load(), [id]: i })); } catch {} };

const video = (c, cls = "") => `<video class="${cls}" src="${c}.mp4" poster="${c}.jpg" muted loop autoplay playsinline preload="auto" aria-hidden="true"></video>`;
const figure = (c) => `<figure class="fig"><img class="blur" src="${c}.jpg" alt="">${video(c)}</figure>`;

function home() {
  const seen = load();
  app.className = "home";
  app.innerHTML = `
    <img class="logo" src="media/logo.png" alt="Hard 2 Break" width="150" height="150">
    <p class="eyebrow">Free guide · Joshua Heald</p>
    <h1>Pick your<em>first skill</em></h1>
    <p class="sub">Every step from my three most&#8209;watched tutorials, plus two extra steps on each. How much to do, and when you're ready for the next step.</p>
    <ul class="skills">${SKILLS.map((s) => {
      const at = seen[s.id];
      return `<li><a href="#${s.id}${at ? `/${at}` : ""}">
        <img src="${s.cover}.jpg" alt="" width="84" height="84">
        <span><b>${nb(s.name)}</b><small>${at && at <= s.steps.length ? `Continue at step ${at} of ${s.steps.length}` : `${s.steps.length} steps`}</small></span>
        <i aria-hidden="true">&rarr;</i></a></li>`;
    }).join("")}</ul>
    <p class="legal">Not medical advice. Train at your own risk and stop if something hurts. <a href="terms.html">Terms</a></p>`;
}

function bar(s, i) {
  const n = s.steps.length, last = n + 1;
  const back = i === 0 ? `<a class="back" href="#">All skills</a>` : `<a class="back" href="#${s.id}/${i - 1}">Back</a>`;
  const next = i === 0 ? "Start" : i === n ? "Finish" : "Next";
  return `<nav class="bar">${back}${i < last ? `<a class="next" href="#${s.id}/${i + 1}">${next}</a>` : ""}</nav>`;
}

function rail(s, i) {
  return `<div class="rail">${s.steps.map((_, k) => {
    const n = k + 1;
    return `<a class="${n < i ? "done" : n === i ? "on" : ""}" href="#${s.id}/${n}" aria-label="Step ${n}"${n === i ? ' aria-current="step"' : ""}></a>`;
  }).join("")}</div>`;
}

function intro(s) {
  app.className = "screen";
  app.innerHTML = `${figure(s.cover)}
    <div class="sheet">
      <a class="all" href="#">All skills</a>
      <p class="where">${s.steps.length} steps · start at step 1</p>
      <h1>${nb(s.title)}</h1>
      <dl>
        <div><dt>How often</dt><dd>${s.how}</dd></div>
        <div><dt>How long</dt><dd>${s.long}</dd></div>
        <div><dt>You need</dt><dd>${s.need}</dd></div>
      </dl>
      <p class="rule">Hit the goal on each step before you move on. That way you don't injure yourself.</p>
      <a class="reel" href="${s.reel}" target="_blank" rel="noopener">Watch the original tutorial</a>
      ${bar(s, 0)}
    </div>`;
}

function step(s, i) {
  const t = s.steps[i - 1];
  app.className = "screen";
  app.innerHTML = `${figure(t.clip)}
    <div class="sheet">
      ${rail(s, i)}
      <p class="where">Step ${i} of ${s.steps.length}${t.added ? `<span>Added step</span>` : ""}</p>
      <h1>${nb(t.name)}</h1>
      <p class="goal"><b>${t.dose}</b><span>${t.unit}<small>${i < s.steps.length ? "Your goal before the next step" : "Your goal"}</small></span></p>
      <ol>${t.cues.map((c) => `<li>${c}</li>`).join("")}</ol>
      ${t.tip ? `<p class="tip">${t.tip}</p>` : ""}
      ${bar(s, i)}
    </div>`;
}

function finish(s) {
  const n = s.steps.length;
  app.className = "screen";
  app.innerHTML = `${figure(s.cover)}
    <div class="sheet">
      ${rail(s, n + 1)}
      <p class="where">You hit every step</p>
      <h1>${nb(s.title)}</h1>
      <p class="lede">${nb(s.finish)}</p>
      <div class="offer">
        <h2>Ready for the<em>next skill?</em></h2>
        <p>The Hard to Break Program is six skills, every step from zero, with your workouts planned out.</p>
        <a class="cta" href="${CHECKOUT}">Get the program <span>$48</span></a>
        <p class="micro">Instant access on Whop · All sales are final</p>
      </div>
      <a class="reel" href="#">Try another skill</a>
      ${bar(s, n + 1)}
    </div>`;
}

function route() {
  const [id, raw] = location.hash.slice(1).split("/");
  const s = SKILLS.find((x) => x.id === id);
  if (!s) { document.title = "Free step-by-step guide · Hard 2 Break"; home(); }
  else {
    const n = s.steps.length;
    const i = Math.min(Math.max(parseInt(raw, 10) || 0, 0), n + 1);
    document.title = `${s.name} · Hard 2 Break`;
    if (i === 0) intro(s); else if (i > n) finish(s); else step(s, i);
    if (i >= 1 && i <= n) save(s.id, i);
  }
  scrollTo(0, 0);
  // Safari ignores the muted attribute on videos added through innerHTML, so set the property and retry once it can play
  app.querySelectorAll("video").forEach((v) => {
    v.muted = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const play = () => v.play().catch(() => {});
    v.addEventListener("canplay", play, { once: true });
    play();
  });
}

addEventListener("hashchange", route);
addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") app.querySelector(".next")?.click();
  if (e.key === "ArrowLeft") app.querySelector(".back")?.click();
});
// iPhone can refuse the first autoplay; retry on the first touch
addEventListener("pointerdown", () => { app.querySelector("video")?.play().catch(() => {}); }, { passive: true });
const retry = () => { if (!document.hidden) app.querySelector("video")?.play().catch(() => {}); };
addEventListener("pageshow", retry);
document.addEventListener("visibilitychange", retry);
// First visit: the one-time bonus offer (offer.html) comes before the guide. It marks itself gone when they leave.
let offerGone = true;
try { offerGone = localStorage.getItem("h2b-offer") === "gone"; } catch {}
if (offerGone) route(); else location.replace("offer.html");
