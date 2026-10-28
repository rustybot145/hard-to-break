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
const fmtDate = (d, o = { month: "short", day: "numeric" }) => new Date(d).toLocaleDateString(undefined, o);
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
  // Foundations and Strength if they need them, then their skills in program order
  const road = [...(start <= 2 ? [2] : []), ...(start <= 3 ? [3] : []), ...(start >= 4 && !goals.includes(start) ? [start] : []), ...goals];
  let why;
  if (tested) why = !foundations ? "Your bar hang, push-ups or hollow hold aren't at Josh's Foundations targets yet, so that's where you build first."
    : !strength ? "Your foundations are there. Pull-ups and dips under 10 mean Building Strength comes next."
    : "You hit every quick-test target, so you go straight to your skills.";
  else why = { new: "Brand new is the right place to start: Foundations builds everything from zero.", some: "With some experience, you start by building real pull-up, dip and L-sit strength.", trained: "You already train, so you go straight to your skills." }[a.level];
  return { start, road, why, v, tested };
}

// spread the module's sessions over the person's days; extra days become mobility
function week(mod, days) {
  const chosen = DEFAULT_DAYS[days];
  const need = Math.min(mod.freq ?? days, days);
  const train = Array.from({ length: need }, (_, i) => chosen[Math.round((i * days) / need)]);
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    d, what: train.includes(d) ? mod.sessions[train.indexOf(d) % mod.sessions.length] : chosen.includes(d) ? "Mobility: foam roll and stretch" : "Rest",
    kind: train.includes(d) ? "train" : chosen.includes(d) ? "mobility" : "off",
  }));
}

function build(fresh) {
  if (fresh) { try { localStorage.setItem(STORE, JSON.stringify({ at: Date.now(), A })); } catch {} }
  const { start, road, why, v, tested } = place(A);
  const mod = MODULES[start], lesson = mod.lessons[0], ctx = { v, w: A.weight };
  tint(mod.color);

  $("[data-num]").textContent = start;
  $("[data-plan-title]").textContent = `Module ${start}: ${mod.title}`;
  $("[data-lesson]").textContent = mod.lessons.length > 1 ? `Begin with lesson 1: ${lesson.title}` : "Train all three lessons together";
  $("[data-why]").textContent = why;

  // the week
  const days = A.days || 3, plan = week(mod, days);
  $("[data-days-note]").textContent = mod.freq && days < mod.freq
    ? `Josh trains this module ${mod.freq} days a week. With ${days}, your sessions rotate, so each comes up a little less often.`
    : mod.freq && days > mod.freq ? `Josh trains this module ${mod.freq} days a week, so your other days are for mobility.`
    : `${days} training days a week.`;
  $("[data-sched]").replaceChildren(...plan.map((p) => { const li = el("li", p.kind); li.append(el("span", "when", DAY_NAMES[p.d]), el("span", "what", p.what)); return li; }));

  // the sessions, with every line that adapts set from their numbers and weight
  $("[data-sessions]").replaceChildren(...mod.sessions.map((name, s) => {
    const box = el("div", "session");
    box.append(el("h4", "", name));
    const ul = el("ul");
    ul.append(...lesson.items.filter((it) => it.s === s).map((it) => {
      // tag the lines their own numbers actually changed: a quick-test score, or their weight
      const personal = typeof it.rx === "function" && (tested || (it.weight && A.weight));
      const li = el("li", personal ? "yours" : "");
      li.append(el("b", "", it.name), el("span", "", typeof it.rx === "function" ? it.rx(ctx) : it.rx));
      return li;
    }));
    box.append(ul);
    return box;
  }));
  $("[data-rest]").textContent = [`Rest ${mod.rest}.`, mod.extra && `${mod.extra}.`].filter(Boolean).join(" ");

  // the road: each module, its weeks and dates
  let t = Date.now();
  $("[data-road]").replaceChildren(...road.map((n) => {
    const m = MODULES[n], li = el("li", m.comingSoon ? "soon" : "");
    li.style.setProperty("--c", m.color);
    const when = m.comingSoon ? "Coming soon" : `${m.weeks}+ weeks · from ${fmtDate(t)}`;
    if (!m.comingSoon) t += m.weeks * 7 * 864e5;
    li.append(el("span", "n", n), el("b", "", m.title), el("span", "when", when + (m.partial ? ` · ${m.partial}` : "")));
    return li;
  }));

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
