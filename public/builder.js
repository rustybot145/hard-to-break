// Workout Builder: a few questions, optional quick tests, then a plan from builder-data.js.
// Rule-based on purpose: the same answers always give the same plan, straight from Joshua's videos.
const STORE = "h2b-builder";
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_DAYS = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 5], 5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6] };

const LEVELS = [
  ["new", "Brand new", "I can't do a pull-up or a dip yet"],
  ["some", "Some experience", "I can do some pull-ups, dips and push-ups"],
  ["trained", "I already train calisthenics", "Pull-ups, dips and core work are solid"],
];
const PROFILE = [
  { id: "weight", type: "number", title: "Your weight", ask: "What do you weigh?", unit: "lb", max: 500, optional: true, how: "Used to set loads, like the lat pulldown at half your body weight." },
  { id: "level", type: "choice", title: "Your experience", options: LEVELS.map(([v, l, d]) => ({ v, l, d })) },
  { id: "goals", type: "multi", title: "Skills you want", optional: true, layout: "two", how: "Pick any. Skip it and your plan covers every skill in the program.",
    options: GOALS.map((n) => ({ v: n, l: MODULES[n].title.replace(/^The /, "").replace(/ to Handstand$/, ""), d: `Module ${n}` })) },
  { id: "days", type: "choice", title: "Training days", how: "How many days a week can you train?", layout: "nums", options: [2, 3, 4, 5, 6].map((n) => ({ v: n, l: String(n), d: "days" })) },
  { id: "offer", type: "choice", title: "Add the quick tests?", how: "5 quick tests (bar hang, pull-ups, dips, push-ups, hollow hold) make your plan more exact. About 10 minutes. Warm up first.",
    options: [{ v: "yes", l: "Do the quick tests", d: "Most exact plan" }, { v: "no", l: "Skip and build my plan", d: "Based on your answers" }] },
];
const TEST_STEPS = TESTS.map((t) => ({ ...t, id: `t_${t.id}`, test: t, type: "number", title: t.name, unit: t.kind === "secs" ? "seconds" : "reps", max: t.kind === "secs" ? 600 : 200, zero: true }));

const $ = (s) => document.querySelector(s);
const screens = { intro: $("#intro"), question: $("#question"), result: $("#result") };
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

let A = {};       // answers
let at = 0;       // index into steps()
const steps = () => (A.offer === "yes" ? [...PROFILE, ...TEST_STEPS] : PROFILE);

// Saved after every answer in two places: localStorage, and the page's own URL (#weight=180&level=some&step=3).
// Inside Whop's iframe on phones the browser can block or wipe storage, so the URL is what survives a reload,
// and it doubles as a link that opens this exact plan anywhere (it rides along in the calendar events).
const ALL = [...PROFILE, ...TEST_STEPS];
function encode() {
  const q = new URLSearchParams();
  for (const st of ALL) if (A[st.id] != null) q.set(st.id, [].concat(A[st.id]).join(","));
  q.set("step", at);
  return q.toString();
}
// only values the questions could have produced get in, so a hand-edited link can't break the plan
function decode(str) {
  const q = new URLSearchParams(str), a = {};
  for (const st of ALL) {
    const raw = q.get(st.id), n = Number(raw);
    if (raw == null) continue;
    if (st.type === "number" && Number.isInteger(n) && n >= 0 && n <= st.max) a[st.id] = n;
    if (st.type === "choice") { const o = st.options.find((o) => String(o.v) === raw); if (o) a[st.id] = o.v; }
    if (st.type === "multi") { const vs = st.options.filter((o) => raw.split(",").includes(String(o.v))).map((o) => o.v); if (vs.length) a[st.id] = vs; }
  }
  return { a, step: Math.max(0, parseInt(q.get("step"), 10) || 0) };
}
const planLink = () => `${location.origin}${location.pathname}#${encode()}`;
function save() {
  const q = encode();
  try { localStorage.setItem(STORE, q); } catch {}
  try { history.replaceState(null, "", `#${q}`); } catch {}
}

function show(name) {
  for (const [key, s] of Object.entries(screens)) s.hidden = key !== name;
  scrollTo(0, 0);
}

// ---- asking ----
function ask() {
  save();
  const all = steps(), st = all[at];
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
  if (st.type === "choice" || st.type === "multi") renderChoices(st);

  // single choices move on by themselves; everything else needs Next
  $("[data-next]").hidden = st.type === "choice";
  $("[data-next]").textContent = at === all.length - 1 ? "Build my plan" : "Next";
  $("[data-skip]").hidden = !st.optional && !st.zero;
  $("[data-skip]").textContent = st.zero ? "Couldn't do one" : "Skip";
  screens.question.classList.toggle("typing", st.type === "number");
  show("question");
  const card = screens.question;
  card.classList.remove("enter"); void card.offsetWidth; card.classList.add("enter");
  if (st.type === "number") $("[data-value]").focus({ preventScroll: true });
}

function renderChoices(st) {
  const multi = st.type === "multi", picked = multi ? (A[st.id] || []) : [A[st.id]];
  $("[data-type=choice]").dataset.layout = st.layout || "";
  $("[data-type=choice]").replaceChildren(...st.options.map((o) => {
    const b = el("button", "choice");
    b.type = "button";
    b.setAttribute("aria-pressed", picked.includes(o.v));
    b.append(el("b", "", o.l), ...(o.d ? [el("span", "", o.d)] : []));
    b.addEventListener("click", () => {
      if (multi) { A[st.id] = picked.includes(o.v) ? picked.filter((x) => x !== o.v) : [...picked, o.v]; save(); renderChoices(st); }
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
  return true;
}

function next() {
  at++;
  if (at < steps().length) ask(); else build();
}
function nudge() { screens.question.classList.add("nudge"); setTimeout(() => screens.question.classList.remove("nudge"), 400); }

// ---- the plan ----
function testValues(a) { return Object.fromEntries(TESTS.filter((t) => `t_${t.id}` in a).map((t) => [t.id, a[`t_${t.id}`]])); }

function place(a) {
  const v = testValues(a), tested = Object.keys(v).length === TESTS.length;
  const foundations = tested ? v.hang >= 60 && v.pushups >= 15 && v.hollow >= 60 : a.level !== "new";
  const strength = tested ? v.pullups >= 10 && v.dips >= 10 : a.level === "trained";
  const goals = (a.goals?.length ? [...a.goals] : GOALS).sort((x, y) => x - y);
  const firstSkill = goals[0];
  const start = !foundations ? 2 : !strength ? 3 : firstSkill;
  return { start, v, tested };
}

// ---- the week: every training day gets its own full workout, all from Joshua's lessons ----
// Foundations is his own split (Push + Pull / Core + Legs). Later phases keep that balance around the skill,
// so nobody ends up with a week of upper body only.
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const F = MODULES[2].lessons[0].items;
const [PULLUPS, PDIPS, SDIPS, LSIT, T2B] = MODULES[3].lessons[0].items;
const PUSH = F.slice(0, 4), PULL = F.slice(4, 8), CORE = F.slice(8, 12), LEGS = F.slice(12, 16);
const WARM = { name: "Dynamic warm-up", rx: "About 10 minutes, before every workout" };
// skill phase: the skill twice a week (Joshua's frequency), the other days balance it
const SKILL_WEEK = { 2: ["skill", "skill"], 3: ["skill", "lower", "skill"], 4: ["skill", "lower", "skill", "upper"],
  5: ["skill", "lower", "upper", "skill", "lower"], 6: ["skill", "lower", "upper", "skill", "lower", "upper"] };

// the workout types for this phase: key -> [name, short label for the day tile, versions]. Six exercises max a day;
// a type that comes up twice a week alternates its versions, so every exercise in the lesson still gets trained.
const LOWER = [[LSIT, T2B, CORE[3], LEGS[0], LEGS[2], LEGS[3]], [LSIT, T2B, CORE[1], LEGS[1], LEGS[2], LEGS[3]]];
function types(start, days, li) {
  if (start === 2) return {
    upper: ["Push + Pull", "Push Pull", [[PUSH[0], PUSH[3], PUSH[1], PULL[0], PULL[2], PULL[1]], [PUSH[0], PUSH[3], PUSH[2], PULL[0], PULL[2], PULL[3]]]],
    lower: ["Core + Legs", "Core Legs", [[CORE[0], CORE[3], CORE[2], LEGS[0], LEGS[2], LEGS[3]], [CORE[1], CORE[3], CORE[2], LEGS[1], LEGS[2], LEGS[3]]]],
  };
  const lower = ["Core + Legs", "Core Legs", LOWER];
  if (start === 3) return { upper: ["Pull-ups + Dips", "Pull Push", [[PULLUPS, PDIPS, SDIPS, PUSH[3], PULL[2], PULL[1]]]], lower };
  const mod = MODULES[start];
  // "strength work from lesson 1" (muscle-up) is spelled out as the actual exercises
  const base = mod.lessons[li].items.flatMap((it) => (/^Strength work from lesson 1/.test(it.name) ? mod.lessons[0].items : [it]));
  // short skill lessons are topped up to six: pull-ups and dips (the muscle-up already has them), then core and legs
  const six = (head, fill) => [...head, ...fill.filter((x) => !head.includes(x))].slice(0, 6);
  const pulls = start === 5 ? [] : [PULLUPS, SDIPS];
  // two days a week: both days are skill days, so each keeps a core and a legs move and the lesson is split across them
  const skill = days === 2
    ? [six([...base.slice(0, 4), CORE[3], LEGS[2]], pulls), six([...base.slice(-4), CORE[3], LEGS[3]], pulls)]
    : base.length > 6 ? [base.slice(0, 6), base.slice(-6)]   // a long lesson: the two skill days split it
    : [six(base, [...pulls, CORE[3], LEGS[2], LEGS[3]])];
  return {
    skill: [mod.title.replace(/^The /, ""), "Skill", skill],
    upper: ["Push + Pull", "Push Pull", [[PULLUPS, PDIPS, SDIPS, PUSH[3], PULL[2], PULL[3]]]],
    lower,
  };
}
// each training day: which type, and which time this week that type comes up (picks the version)
function week(start, n) {
  const train = DEFAULT_DAYS[n], order = start <= 3 ? train.map((_, i) => (i % 2 ? "lower" : "upper")) : SKILL_WEEK[n];
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const i = train.indexOf(d);
    return { d, key: i < 0 ? "rest" : order[i], v: i < 0 ? 0 : order.slice(0, i).filter((k) => k === order[i]).length };
  });
}
const workout = (t, p) => { const vs = t[p.key][2]; return vs[p.v % vs.length]; };

// ---- ticking off exercises: kept for the current week (Monday to Sunday), then it starts fresh ----
const DONE = "h2b-done";
const weekOf = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.toDateString(); };
let done = {};
try { const o = JSON.parse(localStorage.getItem(DONE)); if (o?.wk === weekOf()) done = o.days || {}; } catch {}
function tick(d, k) {
  const list = new Set(done[d] || []);
  list.has(k) ? list.delete(k) : list.add(k);
  done[d] = [...list];
  try { localStorage.setItem(DONE, JSON.stringify({ wk: weekOf(), days: done })); } catch {}
  render();
}
// "3 × 15. Band if you need it." -> ["3 × 15", "Band if you need it."]
function splitRx(rx) {
  const m = rx.match(/^(\d+ × \d+s?(?: per (?:leg|side))?)[.,]?\s*(.*)$/);
  return m ? [m[1], m[2] && m[2][0].toUpperCase() + m[2].slice(1)] : ["", rx];
}

let plan = null;  // what's on screen: phase, week, lesson tab, picked day

function build() {
  save();
  const { start, v, tested } = place(A);
  const mod = MODULES[start], days = A.days || 3, wk = week(start, days);
  // open on today, or the next training day
  const today = new Date().getDay(), day = [0, 1, 2, 3, 4, 5, 6].map((k) => (today + k) % 7).find((d) => wk.find((p) => p.d === d).key !== "rest");
  plan = { start, mod, days, ctx: { v, w: A.weight, level: A.level }, tested, wk, li: 0, day };

  const next = start < 4 && A.goals?.length ? ` Then ${MODULES[Math.min(...A.goals)].title.replace(/^The /, "the ")}.` : "";
  $("[data-summary]").textContent = `${mod.title}: ${days} workouts a week for about ${mod.weeks} weeks.${next} Tap a day to see its workout.`;
  const lvl = LEVELS.find(([k]) => k === A.level)[1];
  // body weight only shows when something in this plan uses it (the muscle-up's lat pulldown)
  const usesWeight = mod.lessons.some((l) => l.items.some((it) => it.weight));
  $("[data-built]").textContent = "Set to you: " + [lvl, usesWeight && A.weight && `${A.weight} lb`, tested ? "your quick tests" : "no quick tests yet"].filter(Boolean).join(" · ");

  // modules with more than one lesson: one tab per stretch of weeks
  let w = 1;
  $("[data-phases]").replaceChildren(...(mod.lessons.length > 1 ? mod.lessons.map((l, i) => {
    const b = el("button", "", l.weeks ? `Weeks ${w}–${(w += l.weeks) - 1}` : i && !mod.lessons[i - 1].weeks ? `Then: ${l.title}` : `Week ${w} on`);
    b.type = "button";
    b.addEventListener("click", () => { plan.li = i; render(); });
    return b;
  }) : []));
  render();
  $("[data-rest]").textContent = `Rest ${mod.rest}.`;
  calendarLinks();

  // their quick-test numbers, if they did them
  $("[data-scores-block]").hidden = !tested;
  $("[data-scores]").replaceChildren(...TESTS.filter((x) => x.id in v).map((x) => {
    const li = el("li", v[x.id] >= x.target ? "pass" : "miss");
    li.style.setProperty("--p", Math.min(1, v[x.id] / x.target));
    li.append(el("span", "name", x.name), el("span", "val", `${v[x.id]}${x.kind === "secs" ? "s" : ""} / ${x.target}${x.kind === "secs" ? "s" : ""}`), Object.assign(el("span", "bar"), { innerHTML: "<i></i>" }));
    return li;
  }));
  show("result");
}

// the day tiles, then the picked day's workout: every exercise with Joshua's clip
function render() {
  const { ctx, tested, wk, mod } = plan, t = types(plan.start, plan.days, plan.li);
  const count = (p) => workout(t, p).length + 1;  // + the warm-up
  $("[data-days]").replaceChildren(...wk.map((p) => {
    const li = el("li"), finished = p.key !== "rest" && (done[p.d] || []).length >= count(p);
    const b = el("button", (p.key === "rest" ? "off" : "train") + (finished ? " finished" : ""));
    b.type = "button";
    b.setAttribute("aria-pressed", p.d === plan.day);
    b.setAttribute("aria-label", `${DAY_FULL[p.d]}: ${p.key === "rest" ? "rest" : t[p.key][0]}${finished ? ", done" : ""}`);
    b.append(el("b", "", DAY_NAMES[p.d]), el("span", "", finished ? "Done ✓" : p.key === "rest" ? "Rest" : t[p.key][1]));
    b.addEventListener("click", () => { plan.day = p.d; render(); });
    li.append(b);
    return li;
  }));
  [...$("[data-phases]").children].forEach((b, i) => b.setAttribute("aria-pressed", i === plan.li));

  const p = wk.find((x) => x.d === plan.day), box = el("div", "session"), head = el("header");
  if (p.key === "rest") {
    head.append(el("h4", "", "Rest day"), el("span", "on", DAY_FULL[p.d]));
    box.append(head, el("p", "restday", ["Recover today. Foam roll and stretch if you're sore.", mod.extra && `${mod.extra}.`].filter(Boolean).join(" ")));
    $("[data-sessions]").replaceChildren(box);
    return;
  }
  // "Set to you" = their answers changed this line from what an experienced, untested person would get
  const items = [WARM, ...workout(t, p)].map((it) => typeof it.rx !== "function" ? it
    : { ...it, rx: it.rx(ctx), yours: it.rx(ctx) !== it.rx({ v: {}, level: "trained" }) });
  const ticked = new Set(done[p.d] || []);
  head.append(el("h4", "", t[p.key][0]), el("span", "on", `${DAY_FULL[p.d]} · warm-up + ${items.length - 1} exercises${ticked.size ? ` · ${ticked.size} of ${items.length} done` : ""}`));
  const ol = el("ol");
  ol.append(...items.map((it, k) => {
    const li = el("li", "ex" + (it.yours ? " yours" : "") + (ticked.has(k) ? " done" : "")), txt = el("span");
    const [sets, note] = splitRx(it.rx);
    txt.append(el("b", "", it.name), ...(sets ? [el("em", "sets", sets)] : []), ...(note ? [el("span", "", note)] : []));
    const n = el("button", "n", ticked.has(k) ? "✓" : k ? String(k) : "–");
    n.type = "button";
    n.setAttribute("aria-pressed", ticked.has(k));
    n.setAttribute("aria-label", `Mark ${it.name} done`);
    n.addEventListener("click", () => tick(p.d, k));
    li.append(n, txt);
    if (it.clip) {
      const b = el("button", "demo", "Watch");
      b.type = "button";
      b.setAttribute("aria-label", `Watch Joshua do it: ${it.name}`);
      b.addEventListener("click", () => play(items, k));
      li.append(b);
    }
    return li;
  }));
  box.append(head, el("p", "tip", "Tap the number when you finish an exercise."), ol);
  const b = el("button", "cta watch", "▶  Watch the workout");
  b.type = "button";
  b.addEventListener("click", () => play(items, items.findIndex((it) => it.clip)));
  box.append(b);
  $("[data-sessions]").replaceChildren(box);
}

// ---- Joshua doing it ----
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
  const t = types(plan.start, plan.days, plan.li);
  return plan.wk.filter((p) => p.key !== "rest").map((p) => {
    const startAt = firstOn(p.d, hh, mm);
    return { p, startAt, endAt: new Date(startAt.getTime() + 60 * 6e4), title: `Hard 2 Break: ${t[p.key][0]}` };
  });
}

function calendarLinks() {
  const evs = calendarEvents(), first = evs.reduce((a, b) => (a.startAt < b.startAt ? a : b));
  const q = new URLSearchParams({
    action: "TEMPLATE", text: "Hard 2 Break workout",
    dates: `${local(first.startAt)}/${local(first.endAt)}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${evs.map((e) => ICS_DAY[e.p.d]).join(",")};COUNT=${evs.length * plan.mod.weeks}`,
    details: `Your workout plan: ${planLink()}`,
  });
  $("[data-gcal]").href = `https://calendar.google.com/calendar/render?${q}`;
  $("[data-cal-note]").textContent = `Repeats every week for ${plan.mod.weeks} weeks, starting tomorrow.`;
}

$("[data-time]").addEventListener("change", calendarLinks);
$("[data-ics]").addEventListener("click", () => {
  const esc = (t) => t.replace(/[\\,;]/g, (c) => "\\" + c);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hard 2 Break//Workout Builder//EN", "CALSCALE:GREGORIAN",
    ...calendarEvents().flatMap((e) => ["BEGIN:VEVENT", `UID:h2b-${e.p.d}-${Date.now()}@hardtobreakprogram.com`, `DTSTAMP:${stamp(new Date())}Z`,
      `DTSTART:${local(e.startAt)}`, `DTEND:${local(e.endAt)}`, `RRULE:FREQ=WEEKLY;COUNT=${plan.mod.weeks}`,
      `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(`Your workout plan: ${planLink()}`)}`, "END:VEVENT"]),
    "END:VCALENDAR"];
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" })), download: "hard-2-break-workouts.ics" });
  document.body.append(a); a.click(); a.remove();
});

// ---- keyboard: when it opens over the page, keep the answer and Next in view ----
function keepNextVisible() {
  const a = document.activeElement;
  if (!a || a.tagName !== "INPUT" || screens.question.hidden) return;
  $("[data-next]").scrollIntoView({ block: "nearest", behavior: "smooth" });
}
window.visualViewport?.addEventListener("resize", keepNextVisible);
document.addEventListener("focusin", () => setTimeout(keepNextVisible, 300));

// ---- wiring ----
$("[data-start]").addEventListener("click", () => { A = {}; at = 0; ask(); });
$("[data-next]").addEventListener("click", () => (capture() ? next() : nudge()));
$("[data-skip]").addEventListener("click", () => { const st = steps()[at]; if (st.zero) A[st.id] = 0; else delete A[st.id]; next(); });
$("[data-back]").addEventListener("click", () => { if (at === 0) show("intro"); else { at--; ask(); } });
$("[data-value]").addEventListener("input", (e) => setNumber(e.target.value));
for (const s of ["[data-value]"]) {
  $(s).addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("[data-next]").click(); } });
  $(s).addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, ""); });
}
$("[data-rebuild]").addEventListener("click", () => { at = 0; ask(); });
$("[data-clear]").addEventListener("click", () => {
  try { localStorage.removeItem(STORE); } catch {}
  try { history.replaceState(null, "", location.pathname + location.search); } catch {}
  A = {}; at = 0; show("intro");
});
// came back later: a plan link (or this page's own URL) wins over storage; pick up exactly where they left off
let saved = location.hash.slice(1);
try { saved ||= localStorage.getItem(STORE) || ""; } catch {}
if (saved.startsWith("{")) { try { const old = JSON.parse(saved); if (old?.A?.level) { A = old.A; at = steps().length; } } catch {} }  // pre-2026-11-14 format
else if (saved) { const d = decode(saved); A = d.a; at = Math.min(d.step, steps().length); }
if (at === steps().length && A.level) build();
else if (Object.keys(A).length) { at = Math.min(at, steps().length - 1); ask(); }
