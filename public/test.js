// Day 0 starting test. Every target, schedule and lesson below comes from Josh's lesson videos
// (raw/lesson-transcripts in the vault). Modules are tested in order; the first module where you
// miss a target is where you start.
//   concurrent modules: all lessons are trained together, so every test in the module is taken
//   sequential modules: lessons build on each other, so the first miss sets the lesson and ends the test
const MODULES = [
  { n: 2, color: "#ff8a3d", title: "Calisthenics Foundations",
    weeks: 6,
    tests: [
      { id: "hang", name: "Bar hang", kind: "secs", target: 60, how: "Feet off the ground, arms straight. Chalk helps." },
      { id: "scap", name: "Scapular pull-ups", kind: "reps", target: 15, how: "From a dead hang, pull your shoulder blades down, then let them back up. Arms stay straight." },
      { id: "row", name: "Inverted rows", kind: "reps", target: 15, how: "Bar on the tower, feet in front of you. Pull your chest to the bar." },
      { id: "pike", name: "Pike push-ups", kind: "reps", target: 15, how: "Butt as high as you can, feet close to your hands. Head to the ground, push back up, elbows in." },
      { id: "hollow", name: "Hollow body hold", kind: "secs", target: 60, how: "Only your lower back and upper butt on the ground. Arms and legs straight at about 45°." },
      { id: "legraise", name: "Leg raises", kind: "reps", target: 15, how: "Lying down, hands by your butt, toes pointed. Straight legs all the way up and back down." },
      { id: "narrow", name: "Narrow squats", kind: "reps", target: 15, how: "Feet all the way together. Sit all the way down, come back up." },
    ] },
  { n: 3, color: "#ff5252", title: "Building Strength",
    weeks: 6,
    tests: [
      { id: "c2b", name: "Chest-to-bar pull-ups", kind: "reps", target: 10, how: "Start each rep with a scapular pull-up, then drive your chest all the way up to touch the bar." },
      { id: "sbdip", name: "Straight-bar dips", kind: "reps", target: 10, how: "Arms straight on top of the bar. Dip until your chest reaches the bar, then press back up." },
      { id: "lsit", name: "L-sit", kind: "secs", target: 30, how: "On dip bars or parallettes, legs straight out in front of you, feet off the ground." },
      { id: "t2b", name: "Toes to bar", kind: "reps", target: 10, how: "Hang, push the bar away from you, arms straight. Toes all the way up to touch the bar." },
    ] },
  { n: 4, color: "#5b9dff", title: "The Handstand", sequential: true,
    lessons: ["Wall Handstand", "Freestanding Balance", "Handstand Fixes"],
    weeks: 6,
    tests: [
      { id: "wallhs", name: "Wall handstand", kind: "secs", target: 30, lesson: 0, how: "Hands close to the wall, kick up and let your heels touch. Legs together, shoulders pushed up." },
      // ponytail: Josh gives no freestanding hold time in the lesson; 10 seconds is a placeholder until he confirms
      { id: "freehs", name: "Freestanding handstand", kind: "secs", target: 10, lesson: 1, how: "No wall. Kick up, legs together, toes pointed. Balance with your fingertips and palms." },
    ] },
  { n: 5, color: "#a77bff", title: "The Muscle-Up", sequential: true,
    lessons: ["Muscle-Up Strength", "The Transition", "Clean Reps"],
    weeks: 6,
    tests: [
      { id: "lpull", name: "L-sit pull-ups", kind: "reps", target: 10, lesson: 0, how: "Legs straight out in an L, shoulders back, chest out. Pull the bar to your lower chest." },
      // 0 muscle-ups: learn the transition. 1 to 9: go straight to clean reps.
      { id: "mu", name: "Clean muscle-ups", kind: "reps", target: 10, lesson: 1, partial: [1, 2], how: "A little momentum is fine. Both arms go over the bar together on every rep." },
    ] },
  { n: 6, color: "#b8f04a", title: "The Dragon Flag", sequential: true,
    lessons: ["Tuck Dragon Flag", "Dragon Flag Negatives", "Full Dragon Flag"],
    weeks: 3,
    tests: [
      { id: "tuckdf", name: "Tuck dragon flag hold", kind: "secs", target: 15, lesson: 0, how: "Holding a bench behind your head, hips up, knees tucked to your chest." },
      { id: "negdf", name: "Full dragon flag negatives", kind: "reps", target: 5, lesson: 1, how: "Legs straight and together, hips up. Lower with control, come back up." },
      { id: "fulldf", name: "Dragon flag hold", kind: "secs", target: 15, lesson: 2, how: "Body straight from shoulders to toes, hips up, legs together." },
    ] },
];
const PAST_ALL = { n: 7, color: "#ff6fae", title: "Pike Press to Handstand", lessons: ["Straight Leg Stretch"], weeks: 3 };
const INTRO_COLOR = "#4fdcb0";
const STORE = "h2b-tests";
const TESTS = Object.fromEntries(MODULES.flatMap((m) => m.tests.map((t) => [t.id, t])));
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];  // weeks start on Monday
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmtDate = (d, o = { month: "long", day: "numeric" }) => new Date(d).toLocaleDateString(undefined, o);

const $ = (s) => document.querySelector(s);
const screens = { intro: $("#intro"), question: $("#question"), result: $("#result") };
const tint = (c) => document.documentElement.style.setProperty("--accent", c);
const unit = (t, v) => (t.kind === "secs" ? `${v}s` : `${v}`);
const goalText = (t) => (t.kind === "secs" ? `${t.target} seconds` : `${t.target} reps`);

let path = [];      // [{ m, t }] tests taken so far, in order
let values = {};    // test id -> number

function show(name) {
  for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
  scrollTo(0, 0);
}

// ---- walking the test ----
function nextTest() {
  if (!path.length) return { m: 0, t: 0 };
  const { m, t } = path.at(-1);
  const mod = MODULES[m], test = mod.tests[t], missed = values[test.id] < test.target;
  if (missed && mod.sequential) return null;                       // the first miss sets the lesson
  if (t + 1 < mod.tests.length) return { m, t: t + 1 };
  if (mod.tests.some((x) => values[x.id] < x.target)) return null;  // finished a module with a miss
  return m + 1 < MODULES.length ? { m: m + 1, t: 0 } : null;
}

function ask(pos) {
  const mod = MODULES[pos.m], test = mod.tests[pos.t];
  tint(mod.color);
  $("[data-module]").textContent = `Module ${mod.n}`;
  $("[data-step]").textContent = `Test ${pos.t + 1} of ${mod.tests.length}`;
  $("[data-name]").textContent = test.name;
  $("[data-goal]").textContent = goalText(test);
  $("[data-how]").textContent = test.how;
  $("[data-unit]").textContent = test.kind === "secs" ? "seconds" : "reps";
  setValue(values[test.id] ?? 0);
  $(".progress").replaceChildren(...MODULES.map((m, i) => {
    const seg = document.createElement("i");
    seg.style.setProperty("--c", m.color);
    seg.style.setProperty("--p", i < pos.m ? 1 : i === pos.m ? pos.t / m.tests.length : 0);
    return seg;
  }));
  show("question");
  const card = screens.question;
  card.classList.remove("enter"); void card.offsetWidth; card.classList.add("enter");
}

const current = () => { const { m, t } = path.at(-1); return MODULES[m].tests[t]; };

function setValue(v) {
  const test = current();
  v = Math.max(0, Math.min(test.kind === "secs" ? 600 : 200, Math.round(v) || 0));
  $("[data-value]").value = v;
  $("[data-fill]").style.width = Math.min(100, (v / test.target) * 100) + "%";
  screens.question.classList.toggle("hit", v >= test.target);
  return v;
}
const readValue = () => Number($("[data-value]").value) || 0;

function save(v) {
  values[current().id] = v;
  const next = nextTest();
  if (next) { path.push(next); ask(next); } else finish(true);
}

// ---- result ----
function placement(vals) {
  for (const mod of MODULES) {
    const missed = mod.tests.filter((t) => t.id in vals && vals[t.id] < t.target);
    if (!missed.length) continue;
    if (!mod.sequential) return { mod, lesson: null, missed };
    const t = missed[0];
    const lesson = t.partial && vals[t.id] >= t.partial[0] ? t.partial[1] : t.lesson;
    return { mod, lesson, missed };
  }
  return { mod: PAST_ALL, lesson: 0, missed: [] };
}

function finish(fresh, brandNew = false) {
  let history = load();
  if (fresh) {
    history.push({ at: Date.now(), values, ...(brandNew && { brandNew }) });
    try { localStorage.setItem(STORE, JSON.stringify(history.slice(-20))); } catch {}
  }
  const last = history.at(-1), prev = history.at(-2);
  const { mod, lesson, missed } = placement(last.values);
  tint(mod.color);

  $("[data-num]").textContent = mod.n;
  $("[data-title]").textContent = `Start at Module ${mod.n}: ${mod.title}`;
  $("[data-lesson]").textContent = lesson === null ? "Train all three lessons together" : `Begin with lesson ${lesson + 1}: ${mod.lessons[lesson]}`;
  $("[data-why]").textContent = last.brandNew
    ? "Brand new is the right place to start. Module 2 builds every foundation from zero, with a band to help on anything you can't do yet."
    : missed.length
    ? `You hit ${countHits(mod, last.values)} of ${mod.tests.filter((t) => t.id in last.values).length} targets in this module. Close the gaps below and you're ready for the next one.`
    : "You hit every target in the test. Your foundations, strength, handstand, muscle-up and dragon flag are already there.";

  // every test taken, as a bar against its target, with the change since last time
  const taken = MODULES.flatMap((m) => m.tests.filter((t) => t.id in last.values).map((t) => ({ m, t })));
  $("[data-scores]").replaceChildren(...taken.map(({ m, t }) => {
    const v = last.values[t.id], li = document.createElement("li");
    li.className = v >= t.target ? "pass" : "miss";
    li.style.setProperty("--c", m.color);
    li.style.setProperty("--p", Math.min(1, v / t.target));
    const delta = prev && t.id in prev.values ? v - prev.values[t.id] : null;
    li.innerHTML = `<span class="name"></span><span class="val"></span><span class="bar"><i></i></span>`;
    li.querySelector(".name").textContent = t.name;
    li.querySelector(".val").textContent = `${unit(t, v)} / ${unit(t, t.target)}` + (delta ? ` (${delta > 0 ? "+" : ""}${unit(t, delta)})` : "");
    return li;
  }));

  // biggest gaps first
  const gaps = missed.map((t) => ({ t, p: last.values[t.id] / t.target })).sort((a, b) => a.p - b.p);
  $("[data-focus-block]").hidden = !gaps.length || last.brandNew;
  $("[data-scores-block]").hidden = !!last.brandNew;
  $("[data-focus]").replaceChildren(...gaps.map(({ t }) => {
    const li = document.createElement("li");
    const v = last.values[t.id];
    li.textContent = `${t.name}: ${t.kind === "secs" ? `${t.target - v} more seconds` : `${t.target - v} more reps`}`;
    return li;
  }));

  const weeks = mod.weeks;
  $("[data-retest]").textContent = `Retest on ${fmtDate(last.at + weeks * 7 * 864e5)}, after ${weeks} weeks` + (prev ? ` · Last test ${fmtDate(prev.at)}` : "");
  renderWeek(mod, lesson, last.values);
  renderDays(mod);
  show("result");
}
// the starting module's training, with every tested exercise set from that person's own number
function renderWeek(mod, lesson, vals) {
  const tr = TRAINING[mod.n];
  const items = tr.lessons ? tr.lessons[lesson ?? 0] : tr.items;
  $("[data-week]").replaceChildren(...tr.sessions.map((name, s) => {
    const box = document.createElement("div");
    box.className = "session";
    if (tr.sessions.length > 1) { const h = document.createElement("h4"); h.textContent = name; box.append(h); }
    const ul = document.createElement("ul");
    ul.append(...items.filter((it) => it.s === s).map((it) => {
      const li = document.createElement("li"), t = TESTS[it.test], v = vals[it.test];
      const scored = t && v !== undefined;
      li.className = scored ? "yours" : "";
      li.innerHTML = `<b></b><span></span>`;
      li.querySelector("b").textContent = it.name;
      li.querySelector("span").textContent = scored && v < t.target && it.low ? it.low(v) : it.rx;
      return li;
    }));
    box.append(ul);
    return box;
  }));
  $("[data-rest]").textContent = [`Rest ${tr.rest}.`, tr.extra && `${tr.extra}.`].filter(Boolean).join(" ");
}

// pick training days; the next 7 days are laid out with the session for each
function renderDays(mod) {
  const tr = TRAINING[mod.n], key = `h2b-days-${mod.n}`;
  $("[data-days-block]").hidden = !tr.days;
  if (!tr.days) return;
  let days;
  try { days = JSON.parse(localStorage.getItem(key)) || tr.days; } catch { days = tr.days; }
  $("[data-days-hint]").textContent = `Josh's plan is ${tr.days.length} days a week${tr.sessions.length > 1 ? `, alternating ${tr.sessions.join(" and ")}` : ""}. Tap to change your days.`;
  $("[data-daypick]").replaceChildren(...DAY_ORDER.map((d) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = DAY_NAMES[d];
    b.setAttribute("aria-pressed", days.includes(d));
    b.addEventListener("click", () => {
      days = days.includes(d) ? days.filter((x) => x !== d) : [...days, d];
      try { localStorage.setItem(key, JSON.stringify(days)); } catch {}
      renderDays(mod);
    });
    return b;
  }));
  // sessions rotate through the chosen days in week order: Mon A, Tue B, Thu A, Fri B
  const order = DAY_ORDER.filter((d) => days.includes(d));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $("[data-sched]").replaceChildren(...Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today.getTime() + i * 864e5), d = date.getDay(), li = document.createElement("li");
    const train = days.includes(d);
    li.className = train ? "train" : "off";
    li.innerHTML = `<span class="when"></span><span class="what"></span>`;
    li.querySelector(".when").textContent = i === 0 ? "Today" : fmtDate(date, { weekday: "short", day: "numeric" });
    li.querySelector(".what").textContent = train ? tr.sessions[order.indexOf(d) % tr.sessions.length] : "Rest";
    return li;
  }));
}

const countHits = (mod, vals) => mod.tests.filter((t) => t.id in vals && vals[t.id] >= t.target).length;
function load() { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } }

// ---- wiring ----
$("[data-start]").addEventListener("click", () => { path = [{ m: 0, t: 0 }]; values = {}; ask(path[0]); });
// brand new: no point failing seven tests in a row, so record zeros for Module 2 and go to the plan
$("[data-new]").addEventListener("click", () => { values = Object.fromEntries(MODULES[0].tests.map((t) => [t.id, 0])); finish(true, true); });
$("[data-restart]").addEventListener("click", () => { tint(INTRO_COLOR); show("intro"); });
$("[data-clear]").addEventListener("click", () => { try { localStorage.removeItem(STORE); } catch {} tint(INTRO_COLOR); show("intro"); });
$("[data-back]").addEventListener("click", () => {
  path.pop();
  if (path.length) ask(path.at(-1)); else { tint(INTRO_COLOR); show("intro"); }
});
// holds step by 5 seconds, reps by 1
for (const b of document.querySelectorAll("[data-step-by]")) b.addEventListener("click", () => setValue(readValue() + Number(b.dataset.stepBy) * (current().kind === "secs" ? 5 : 1)));
$("[data-value]").addEventListener("input", (e) => setValue(e.target.value));
$("[data-save]").addEventListener("click", () => save(setValue(readValue())));
$("[data-zero]").addEventListener("click", () => save(0));

tint(INTRO_COLOR);
// came back later: show the last result (with progress since the one before) instead of a blank test
if (load().length) finish(false);
