// Workout Builder: a few questions, optional quick tests, then a plan from builder-data.js.
// Rule-based on purpose: the same answers always give the same plan, straight from Josh's videos.
const STORE = "h2b-builder";
const INTRO_COLOR = "#5fb8ff";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_DAYS = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] };

const LEVELS = [
  ["new", "Brand new", "I can't do a pull-up or a dip yet"],
  ["some", "Some experience", "I can do some pull-ups, dips and push-ups"],
  ["trained", "I already train calisthenics", "Pull-ups, dips and core work are solid"],
];
const PROFILE = [
  { id: "weight", type: "number", title: "Your weight", ask: "What do you weigh?", unit: "lb", max: 500, optional: true, how: "Used to set loads, like the lat pulldown at half your body weight." },
  { id: "height", type: "height", title: "Your height", optional: true },
  { id: "level", type: "choice", title: "Your experience", options: LEVELS.map(([v, l, d]) => ({ v, l, d })) },
  { id: "goals", type: "multi", title: "Skills you want", optional: true, how: "Pick any. Skip it and your plan covers every skill in the program.",
    options: GOALS.map((n) => ({ v: n, l: MODULES[n].title.replace(/^The /, ""), d: MODULES[n].comingSoon ? "Coming soon" : `Module ${n}` })) },
  { id: "days", type: "choice", title: "Training days", how: "How many days a week can you train?", options: [2, 3, 4, 5, 6].map((n) => ({ v: n, l: `${n} days a week` })) },
  { id: "offer", type: "choice", title: "Add the quick tests?", how: "5 quick tests (bar hang, pull-ups, dips, push-ups, hollow hold) make your plan more exact. About 10 minutes. Warm up first.",
    options: [{ v: "yes", l: "Do the quick tests", d: "Most exact plan" }, { v: "no", l: "Skip and build my plan", d: "Based on your answers" }] },
];
const TEST_STEPS = TESTS.map((t) => ({ ...t, id: `t_${t.id}`, test: t, type: "number", title: t.name, unit: t.kind === "secs" ? "seconds" : "reps", max: t.kind === "secs" ? 600 : 200, zero: true }));

const $ = (s) => document.querySelector(s);
const screens = { intro: $("#intro"), question: $("#question"), result: $("#result") };
const tint = (c) => document.documentElement.style.setProperty("--accent", c);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

let A = {};       // answers
let at = 0;       // index into steps()
const steps = () => (A.offer === "yes" ? [...PROFILE, ...TEST_STEPS] : PROFILE);

function show(name) {
  for (const [key, s] of Object.entries(screens)) s.hidden = key !== name;
  scrollTo(0, 0);
}

// ---- asking ----
function ask() {
  const all = steps(), st = all[at];
  tint(st.test ? "#ff8a3d" : INTRO_COLOR);
  $("[data-step]").textContent = st.test ? `Quick test ${at - PROFILE.length + 1} of ${TESTS.length}` : `Question ${at + 1} of ${PROFILE.length}`;
  $("[data-title]").textContent = st.title;
  $("[data-how]").hidden = !st.how;
  $("[data-how]").textContent = st.how || "";
  for (const box of document.querySelectorAll("#question [data-type]")) box.hidden = box.dataset.type !== (st.type === "multi" ? "choice" : st.type);
  $(".progress").replaceChildren(...all.map((_, i) => { const seg = el("i"); seg.style.setProperty("--p", i < at ? 1 : 0); return seg; }));

  if (st.type === "number") {
    $("[data-ask]").textContent = st.ask;
    $("[data-unit]").textContent = st.unit;
    $("[data-bar]").hidden = !st.test;
    setNumber(A[st.id] ?? "");
  }
  if (st.type === "height") { $("[data-ft]").value = A.height?.ft ?? ""; $("[data-in]").value = A.height?.in ?? ""; }
  if (st.type === "choice" || st.type === "multi") renderChoices(st);

  // single choices move on by themselves; everything else needs Next
  $("[data-next]").hidden = st.type === "choice";
  $("[data-next]").textContent = at === all.length - 1 ? "Build my plan" : "Next";
  $("[data-skip]").hidden = !st.optional && !st.zero;
  $("[data-skip]").textContent = st.zero ? "Couldn't do one" : "Skip";
  show("question");
  const card = screens.question;
  card.classList.remove("enter"); void card.offsetWidth; card.classList.add("enter");
  if (st.type === "number") $("[data-value]").focus({ preventScroll: true });
  if (st.type === "height") $("[data-ft]").focus({ preventScroll: true });
}

function renderChoices(st) {
  const multi = st.type === "multi", picked = multi ? (A[st.id] || []) : [A[st.id]];
  $("[data-type=choice]").replaceChildren(...st.options.map((o) => {
    const b = el("button", "choice");
    b.type = "button";
    b.setAttribute("aria-pressed", picked.includes(o.v));
    b.append(el("b", "", o.l), ...(o.d ? [el("span", "", o.d)] : []));
    b.addEventListener("click", () => {
      if (multi) { A[st.id] = picked.includes(o.v) ? picked.filter((x) => x !== o.v) : [...picked, o.v]; renderChoices(st); }
      else { A[st.id] = o.v; next(); }
    });
    return b;
  }));
}

function setNumber(v) {
  const st = steps()[at], digits = String(v).replace(/\D/g, "").slice(0, 3);
  $("[data-value]").value = digits;
  if (st.test) {
    const n = Number(digits) || 0;
    $("[data-fill]").style.width = Math.min(100, (n / st.test.target) * 100) + "%";
    screens.question.classList.toggle("hit", n >= st.test.target);
  }
}

// store this step's answer; false = nothing usable typed yet
function capture() {
  const st = steps()[at];
  if (st.type === "number") {
    const raw = $("[data-value]").value;
    if (raw === "") return false;
    A[st.id] = Math.min(st.max, Number(raw));
  }
  if (st.type === "height") {
    const ft = Number($("[data-ft]").value), inch = Number($("[data-in]").value || 0);
    if (!ft || inch > 11) return false;
    A.height = { ft, in: inch };
  }
  return true;
}

function next() {
  at++;
  if (at < steps().length) ask(); else build(true);
}
function nudge() { screens.question.classList.add("nudge"); setTimeout(() => screens.question.classList.remove("nudge"), 400); }

// ---- the plan ----
function testValues(a) { return Object.fromEntries(TESTS.filter((t) => `t_${t.id}` in a).map((t) => [t.id, a[`t_${t.id}`]])); }

function place(a) {
  const v = testValues(a), tested = Object.keys(v).length === TESTS.length;
  const foundations = tested ? v.hang >= 60 && v.pushups >= 15 && v.hollow >= 60 : a.level !== "new";
  const strength = tested ? v.pullups >= 10 && v.dips >= 10 : a.level === "trained";
  const goals = (a.goals?.length ? [...a.goals] : GOALS).sort((x, y) => x - y);
  const firstSkill = goals.find((n) => !MODULES[n].comingSoon) ?? 4;
  const start = !foundations ? 2 : !strength ? 3 : firstSkill;
  return { start, v, tested };
}

// the module's sessions on evenly spaced days; their extra days become stretch days
function week(mod, days) {
  const train = DEFAULT_DAYS[Math.min(mod.freq ?? days, days)];
  const stretch = [1, 2, 3, 4, 5, 6, 0].filter((d) => !train.includes(d)).slice(0, days - train.length);
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    d, what: train.includes(d) ? mod.sessions[train.indexOf(d) % mod.sessions.length] : stretch.includes(d) ? "Stretch" : "Rest",
    kind: train.includes(d) ? "train" : stretch.includes(d) ? "mobility" : "off",
  }));
}

let plan = null;  // { mod, lesson index, days } of what's on screen, for the player and the calendar

function build(fresh) {
  if (fresh) { try { localStorage.setItem(STORE, JSON.stringify({ at: Date.now(), A })); } catch {} }
  const { start, v, tested } = place(A);
  const mod = MODULES[start], days = A.days || 3;
  plan = { mod, days, ctx: { v, w: A.weight }, tested, wk: week(mod, days) };
  tint(mod.color);

  const train = plan.wk.filter((p) => p.kind === "train").length;
  $("[data-summary]").textContent = `${train} workouts a week for about ${mod.weeks} weeks. Tap any exercise to watch Josh do it.`;
  $("[data-days]").replaceChildren(...plan.wk.map((p) => {
    const li = el("li", p.kind);
    li.append(el("b", "", DAY_NAMES[p.d]), el("span", "", p.kind === "train" ? "Train" : p.kind === "mobility" ? "Stretch" : "Rest"));
    return li;
  }));

  // modules with more than one lesson: one tab per stretch of weeks
  let w = 1;
  $("[data-phases]").replaceChildren(...(mod.lessons.length > 1 ? mod.lessons.map((l, i) => {
    const b = el("button", "", `Weeks ${w}–${(w += l.weeks) - 1}`);
    b.type = "button";
    b.addEventListener("click", () => sessions(i));
    return b;
  }) : []));
  sessions(0);
  $("[data-rest]").textContent = [`Rest ${mod.rest}.`, mod.extra && `${mod.extra}.`, plan.wk.some((p) => p.kind === "mobility") && "Stretch days: foam roll and stretch."].filter(Boolean).join(" ");
  calendarLinks();

  // their quick-test numbers, if they did them
  $("[data-scores-block]").hidden = !tested;
  $("[data-scores]").replaceChildren(...TESTS.filter((x) => x.id in v).map((x) => {
    const li = el("li", v[x.id] >= x.target ? "pass" : "miss");
    li.style.setProperty("--c", mod.color);
    li.style.setProperty("--p", Math.min(1, v[x.id] / x.target));
    li.append(el("span", "name", x.name), el("span", "val", `${v[x.id]}${x.kind === "secs" ? "s" : ""} / ${x.target}${x.kind === "secs" ? "s" : ""}`), Object.assign(el("span", "bar"), { innerHTML: "<i></i>" }));
    return li;
  }));
  show("result");
}

// one card per session: which days, then every exercise with Josh's clip
function sessions(li) {
  const { mod, ctx, tested, wk } = plan, lesson = mod.lessons[li];
  plan.li = li;
  [...$("[data-phases]").children].forEach((b, i) => b.setAttribute("aria-pressed", i === li));
  $("[data-sessions]").replaceChildren(...mod.sessions.map((name, s) => {
    const items = lesson.items.filter((it) => it.s === s).map((it) => ({ ...it, rx: typeof it.rx === "function" ? it.rx(ctx) : it.rx,
      // tag the lines their own numbers actually changed: a quick-test score, or their weight
      yours: typeof it.rx === "function" && (tested || (it.weight && A.weight)) }));
    const on = wk.filter((p) => p.what === name).map((p) => DAY_NAMES[p.d]);
    const box = el("div", "session"), head = el("header"), ol = el("ol");
    head.append(el("h4", "", name), el("span", "on", on.join(" · ")));
    ol.append(...items.map((it, k) => {
      const row = el(it.clip ? "button" : "div", "ex" + (it.yours ? " yours" : "")), pic = el("span", "pic"), txt = el("span");
      if (it.clip) {
        row.type = "button";
        row.addEventListener("click", () => play(items, k));
        pic.append(Object.assign(el("img"), { src: `clips/${it.clip}.jpg`, alt: "", loading: "lazy" }));
      }
      txt.append(el("b", "", it.name), el("span", "", it.rx));
      row.append(pic, txt);
      const li = el("li"); li.append(row); return li;
    }));
    box.append(head, ol);
    if (items.some((it) => it.clip)) {
      const b = el("button", "cta watch", "▶  Watch the workout");
      b.type = "button";
      b.addEventListener("click", () => play(items, items.findIndex((it) => it.clip)));
      box.append(b);
    }
    return box;
  }));
}

// ---- Josh doing it ----
const player = $("[data-player]"), video = $("[data-video]");
let queue = [], qi = 0;
function play(items, k) {
  queue = items.filter((it) => it.clip);
  qi = queue.indexOf(items[k]);
  clip();
  if (!player.open) player.showModal();
}
function clip() {
  const it = queue[qi];
  video.src = `clips/${it.clip}.mp4`;
  video.poster = `clips/${it.clip}.jpg`;
  video.play().catch(() => {});
  $("[data-count]").textContent = `${qi + 1} of ${queue.length}`;
  $("[data-pname]").textContent = it.name;
  $("[data-prx]").textContent = it.rx;
  $("[data-prev]").disabled = qi === 0;
  $("[data-fwd]").textContent = qi === queue.length - 1 ? "Done" : "Next";
}
$("[data-prev]").addEventListener("click", () => { if (qi > 0) { qi--; clip(); } });
$("[data-fwd]").addEventListener("click", () => { if (qi < queue.length - 1) { qi++; clip(); } else player.close(); });
$("[data-close]").addEventListener("click", () => player.close());
player.addEventListener("close", () => { video.pause(); video.removeAttribute("src"); video.load(); });
player.addEventListener("click", (e) => { if (e.target === player) player.close(); });  // tap outside

// ---- calendar: a weekly repeating event per workout day, for the module's weeks ----
const ICS_DAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const stamp = (d) => d.toISOString().replace(/[-:]/g, "").slice(0, 15);           // 20261102T170000 (local wall time, no zone)
const local = (d) => stamp(new Date(d.getTime() - d.getTimezoneOffset() * 6e4));

// the first time each weekday comes up, starting tomorrow
function firstOn(dow, hh, mm) {
  const d = new Date(); d.setHours(hh, mm, 0, 0); d.setDate(d.getDate() + 1);
  while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
  return d;
}

function calendarEvents() {
  const [hh, mm] = ($("[data-time]").value || "17:00").split(":").map(Number);
  return plan.wk.filter((p) => p.kind !== "off").map((p) => {
    const startAt = firstOn(p.d, hh, mm);
    return { p, startAt, endAt: new Date(startAt.getTime() + (p.kind === "train" ? 60 : 20) * 6e4),
      title: p.kind === "train" ? `Hard 2 Break: ${p.what}` : "Hard 2 Break: stretch day" };
  });
}

function calendarLinks() {
  const evs = calendarEvents().filter((e) => e.p.kind === "train"), first = evs.reduce((a, b) => (a.startAt < b.startAt ? a : b));
  const q = new URLSearchParams({
    action: "TEMPLATE", text: "Hard 2 Break workout",
    dates: `${local(first.startAt)}/${local(first.endAt)}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${evs.map((e) => ICS_DAY[e.p.d]).join(",")};COUNT=${evs.length * plan.mod.weeks}`,
    details: `Your workout is in the Workout Builder: ${location.origin}/builder`,
  });
  $("[data-gcal]").href = `https://calendar.google.com/calendar/render?${q}`;
  $("[data-cal-note]").textContent = `Repeats every week for ${plan.mod.weeks} weeks, starting tomorrow.`;
}

$("[data-time]").addEventListener("change", calendarLinks);
$("[data-ics]").addEventListener("click", () => {
  const esc = (t) => t.replace(/[\\,;]/g, (c) => "\\" + c);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hard 2 Break//Workout Builder//EN", "CALSCALE:GREGORIAN",
    ...calendarEvents().flatMap((e) => ["BEGIN:VEVENT", `UID:h2b-${e.p.d}-${Date.now()}@hard-to-break.vercel.app`, `DTSTAMP:${stamp(new Date())}Z`,
      `DTSTART:${local(e.startAt)}`, `DTEND:${local(e.endAt)}`, `RRULE:FREQ=WEEKLY;COUNT=${plan.mod.weeks}`,
      `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(`Your workout is in the Workout Builder: ${location.origin}/builder`)}`, "END:VEVENT"]),
    "END:VCALENDAR"];
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" })), download: "hard-2-break-workouts.ics" });
  document.body.append(a); a.click(); a.remove();
});

// ---- wiring ----
$("[data-start]").addEventListener("click", () => { A = {}; at = 0; ask(); });
$("[data-next]").addEventListener("click", () => (capture() ? next() : nudge()));
$("[data-skip]").addEventListener("click", () => { const st = steps()[at]; if (st.zero) A[st.id] = 0; else delete A[st.id]; next(); });
$("[data-back]").addEventListener("click", () => { if (at === 0) { tint(INTRO_COLOR); show("intro"); } else { at--; ask(); } });
$("[data-value]").addEventListener("input", (e) => setNumber(e.target.value));
for (const s of ["[data-value]", "[data-ft]", "[data-in]"]) {
  $(s).addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("[data-next]").click(); } });
  $(s).addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, ""); });
}
$("[data-ft]").addEventListener("input", (e) => { if (e.target.value) $("[data-in]").focus(); });
$("[data-rebuild]").addEventListener("click", () => { at = 0; ask(); });
$("[data-clear]").addEventListener("click", () => { try { localStorage.removeItem(STORE); } catch {} A = {}; tint(INTRO_COLOR); show("intro"); });

tint(INTRO_COLOR);
// came back later: show their plan; "Rebuild" starts from their saved answers
try { const saved = JSON.parse(localStorage.getItem(STORE)); if (saved?.A?.level) { A = saved.A; build(false); } } catch {}
