// Free guide: home (pick a skill) → skill intro → one step per screen → finish + program button.
// The place lives in the URL hash (#handstand/3), so Back, refresh and shared links all work.
import { SKILLS } from "./guide-data.js";

const app = document.getElementById("app");
const topBar = document.querySelector("[data-top]");
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

// Rendered outside .sheet on purpose: .sheet animates a transform, which would un-pin this fixed bar mid-animation
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
      <p class="where">${s.steps.length} steps · start at step 1</p>
      <h1>${nb(s.title)}</h1>
      <dl>
        <div><dt>How often</dt><dd>${s.how}</dd></div>
        <div><dt>How long</dt><dd>${s.long}</dd></div>
        <div><dt>You need</dt><dd>${s.need}</dd></div>
      </dl>
      <p class="rule">Hit the goal on each step before you move on. That way you don't injure yourself.</p>
      <a class="reel" href="${s.reel}" target="_blank" rel="noopener">Watch the original tutorial</a>
    </div>
    ${bar(s, 0)}`;
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
    </div>
    ${bar(s, i)}`;
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
      <a class="pdf" href="pdf/hard-2-break-${s.id}.pdf" download>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16"/></svg>
        <span><b>Download the PDF</b><small>Every step in one file. Take it to the gym.</small></span>
      </a>
      <div class="offer">
        <h2>Ready for the<em>next skill?</em></h2>
        <p>The Hard to Break Program is six skills, every step from zero, with your workouts planned out. It's launching very soon. Join the waitlist and you also get these two bonuses free:</p>
        <ul class="ledger">
          <li><i aria-hidden="true"></i><div><b>Post-training stretching</b><small>Josh's cool-down after every hard session</small></div><em>Free</em></li>
          <li><i aria-hidden="true"></i><div><b>Rest-day mobility</b><small>His full rest-day routine, in three parts</small></div><em>Free</em></li>
        </ul>
        <a class="cta" href="#join" data-join>${onList() ? "Joined waitlist" : "Join the waitlist"}</a>
        <p class="micro">Free to join · Launching very soon</p>
      </div>
      <a class="reel" href="#">Try another skill</a>
    </div>
    ${bar(s, n + 1)}`;
}

// One-time popup: clicking handstand, front lever or muscle-up on the home screen opens Josh's video over that skill's
// first page, with "Join the waitlist" (waitlist.js). Never on a refresh, shared link or Back. Closing it any way marks it seen in this browser; anyone already on the waitlist never gets it.
const SEEN = "h2b-offer";
const onList = () => { try { return localStorage.getItem("h2b-waitlist") === "1"; } catch { return false; } };
const offerSeen = () => { try { return onList() || localStorage.getItem(SEEN) === "gone"; } catch { return true; } };
const pop = document.querySelector("[data-pop]"), popVideo = pop.querySelector("[data-vsl]");
const openPop = () => { if (pop.open) return; pop.showModal(); popVideo.start(); };
pop.addEventListener("close", () => { popVideo.stop(); try { localStorage.setItem(SEEN, "gone"); } catch {} });
pop.addEventListener("click", (e) => { if (e.target === pop) pop.close(); }); // a click off the video and button
pop.querySelector("[data-pop-close]").addEventListener("click", () => pop.close());
addEventListener("hashchange", () => { if (pop.open) pop.close(); });
let picked = false; // set by a click on a skill card, used by the route() that click triggers
app.addEventListener("click", (e) => { if (e.target.closest(".skills a")) picked = true; });

function route() {
  const [id, raw] = location.hash.slice(1).split("/");
  const s = SKILLS.find((x) => x.id === id);
  topBar.hidden = !s;
  topBar.querySelectorAll("nav a").forEach((a) => a.toggleAttribute("aria-current", a.hash === `#${id}`));
  if (!s) { document.title = "Free step-by-step guide · Hard 2 Break"; home(); }
  else {
    const n = s.steps.length;
    const i = Math.min(Math.max(parseInt(raw, 10) || 0, 0), n + 1);
    document.title = `${s.name} · Hard 2 Break`;
    if (i === 0) intro(s); else if (i > n) finish(s); else step(s, i);
    if (i >= 1 && i <= n) save(s.id, i);
    if (picked && !offerSeen()) openPop();
  }
  picked = false;
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
route();
