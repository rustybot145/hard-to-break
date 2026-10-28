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
let INTRO_COLOR_OVERRIDE = INTRO_COLOR;

// /test?lesson=4-1 runs one lesson's check (CHECKS in test-plan.js) instead of the full Day 0 test
const CHECK_KEY = new URLSearchParams(location.search).get("lesson");
const CHECK = CHECKS[CHECK_KEY] || null;
const COLORS = { 2: "#ff8a3d", 3: "#ff5252", 4: "#5b9dff", 5: "#a77bff", 6: "#b8f04a", 7: "#ff6fae", 8: "#5fe3f0", 9: "#ffb347" };
const FLOW = CHECK ? [{ n: CHECK.module, color: COLORS[CHECK.module], title: CHECK.title, sequential: !!CHECK.steps, tests: CHECK.tests }] : MODULES;
const STORE = CHECK ? `h2b-check-${CHECK_KEY}` : "h2b-tests";
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
  const mod = FLOW[m], test = mod.tests[t], missed = values[test.id] < test.target;
  if (missed && mod.sequential) return null;                       // the first miss sets the lesson
  if (t + 1 < mod.tests.length) return { m, t: t + 1 };
  if (mod.tests.some((x) => values[x.id] < x.target)) return null;  // finished a module with a miss
  return m + 1 < FLOW.length ? { m: m + 1, t: 0 } : null;
}

function ask(pos) {
  const mod = FLOW[pos.m], test = mod.tests[pos.t];
  tint(mod.color);
  $("[data-module]").textContent = CHECK ? CHECK.title : `Module ${mod.n}`;
  $("[data-step]").textContent = `${CHECK?.steps ? "Step" : "Test"} ${pos.t + 1} of ${mod.tests.length}`;
  $("[data-name]").textContent = test.name;
  $("[data-goal]").textContent = goalText(test);
  $("[data-how]").textContent = test.how;
  $("[data-unit]").textContent = test.kind === "secs" ? "seconds" : "reps";
  const per = (test.how.match(/^Per (\w+)/) || [])[1];
  $("[data-ask]").textContent = test.kind === "secs" ? `How many seconds can you hold it${per ? ` per ${per}` : ""}?` : `How many can you do ${per ? `per ${per}` : "in a row"}?`;
  setValue(values[test.id] ?? "");
  // full test: a segment per module; lesson check: a segment per step
  const segs = CHECK ? mod.tests.map((_, i) => [mod.color, i < pos.t ? 1 : 0]) : FLOW.map((m, i) => [m.color, i < pos.m ? 1 : i === pos.m ? pos.t / m.tests.length : 0]);
  $(".progress").replaceChildren(...segs.map(([c, p]) => {
    const seg = document.createElement("i");
    seg.style.setProperty("--c", c); seg.style.setProperty("--p", p);
    return seg;
  }));
  show("question");
  const card = screens.question;
  card.classList.remove("enter"); void card.offsetWidth; card.classList.add("enter");
  $("[data-value]").focus({ preventScroll: true });
}

const current = () => { const { m, t } = path.at(-1); return FLOW[m].tests[t]; };

// typed answer: digits only; "" stays empty so they have to answer
function setValue(v) {
  const test = current(), input = $("[data-value]");
  const digits = String(v).replace(/\D/g, "").slice(0, 3);
  input.value = digits;
  v = Math.min(test.kind === "secs" ? 600 : 200, Number(digits) || 0);
  $("[data-fill]").style.width = Math.min(100, (v / test.target) * 100) + "%";
  screens.question.classList.toggle("hit", v >= test.target);
  return v;
}
const readValue = () => Number($("[data-value]").value) || 0;
const answered = () => $("[data-value]").value !== "";

function save(v) {
  values[current().id] = v;
  const next = nextTest();
  if (next) { path.push(next); ask(next); } else (CHECK ? finishCheck : finish)(true);
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

function finish(fresh) {
  let history = load();
  if (fresh) {
    history.push({ at: Date.now(), values });
    try { localStorage.setItem(STORE, JSON.stringify(history.slice(-20))); } catch {}
  }
  const last = history.at(-1), prev = history.at(-2);
  const { mod, lesson, missed } = placement(last.values);
  tint(mod.color);

  $("[data-num]").textContent = mod.n;
  $("[data-title]").textContent = `Start at Module ${mod.n}: ${mod.title}`;
  $("[data-lesson]").textContent = lesson === null ? "Train all three lessons together" : `Begin with lesson ${lesson + 1}: ${mod.lessons[lesson]}`;
  $("[data-why]").textContent = missed.length
    ? `You hit ${countHits(mod, last.values)} of ${mod.tests.filter((t) => t.id in last.values).length} targets in this module. Close the gaps below and you're ready for the next one.`
    : "You hit every target in the test. Your foundations, strength, handstand, muscle-up and dragon flag are already there.";

  renderScores(MODULES.flatMap((m) => m.tests.filter((t) => t.id in last.values).map((t) => ({ m, t }))), last, prev);
  renderFocus(missed, last.values);
  $("[data-scores-block]").hidden = false;

  const weeks = mod.weeks;
  $("[data-retest]").textContent = `Retest on ${fmtDate(last.at + weeks * 7 * 864e5)}, after ${weeks} weeks` + (prev ? ` · Last test ${fmtDate(prev.at)}` : "");
  $("[data-note]").hidden = false;
  $("[data-retest]").hidden = false;
  show("result");
}
// every test taken, as a bar against its target, with the change since last time
function renderScores(taken, last, prev) {
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
}

// biggest gaps first
function renderFocus(missed, vals) {
  const gaps = missed.map((t) => ({ t, p: vals[t.id] / t.target })).sort((a, b) => a.p - b.p);
  $("[data-focus-block]").hidden = !gaps.length;
  $("[data-focus]").replaceChildren(...gaps.map(({ t }) => {
    const li = document.createElement("li"), v = vals[t.id];
    li.textContent = `${t.name}: ${t.target - v} more ${t.kind === "secs" ? "seconds" : "reps"}`;
    return li;
  }));
}

// one lesson's check: where you are in that video's steps, and what's next
function finishCheck(fresh) {
  const history = load();
  if (fresh) {
    history.push({ at: Date.now(), values });
    try { localStorage.setItem(STORE, JSON.stringify(history.slice(-20))); } catch {}
  }
  const last = history.at(-1), prev = history.at(-2), mod = FLOW[0], tests = mod.tests;
  const missed = tests.filter((t) => t.id in last.values && last.values[t.id] < t.target);
  const hits = tests.filter((t) => last.values[t.id] >= t.target).length;
  const step = CHECK.steps && missed.length ? tests.indexOf(missed[0]) : -1;
  tint(mod.color);

  $("#result .eyebrow").textContent = "Your lesson check";
  $(".badge").classList.add("score");
  $("[data-num]").textContent = `${hits}/${tests.length}`;
  $("[data-title]").textContent = !missed.length ? "Lesson passed" : step >= 0 ? `You're on step ${step + 1} of ${tests.length}` : "Keep training this lesson";
  $("[data-lesson]").textContent = step >= 0 ? `Step ${step + 1}: ${tests[step].name}` : `Module ${mod.n} · ${CHECK.title}`;
  $("[data-why]").textContent = !missed.length ? CHECK.after
    : step >= 0 ? `Train every step up to this one each session. Move on when you hit ${goalText(tests[step])}${(tests[step].how.match(/^Per (\w+)/) || ["", ""])[1].replace(/^./, " per $&")}.`
    : "Close these gaps, then check again.";

  renderScores(tests.filter((t) => t.id in last.values).map((t) => ({ m: mod, t })), last, prev);
  renderFocus(step >= 0 ? [] : missed, last.values);
  $("[data-scores-block]").hidden = false;
  $("[data-note]").hidden = true;
  $("[data-retest]").hidden = true;
  $("[data-check-retest]").hidden = !prev;
  $("[data-check-retest]").textContent = prev ? `Last check: ${fmtDate(prev.at)}` : "";
  $("[data-full]").hidden = false;
  show("result");
}

const countHits = (mod, vals) => mod.tests.filter((t) => t.id in vals && vals[t.id] >= t.target).length;
function load() { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } }

// ---- wiring ----
$("[data-start]").addEventListener("click", () => { path = [{ m: 0, t: 0 }]; values = {}; ask(path[0]); });
$("[data-restart]").addEventListener("click", () => { tint(INTRO_COLOR_OVERRIDE); show("intro"); });
$("[data-clear]").addEventListener("click", () => { try { localStorage.removeItem(STORE); } catch {} tint(INTRO_COLOR_OVERRIDE); show("intro"); });
$("[data-back]").addEventListener("click", () => {
  path.pop();
  if (path.length) ask(path.at(-1)); else { tint(INTRO_COLOR_OVERRIDE); show("intro"); }
});
$("[data-value]").addEventListener("input", (e) => setValue(e.target.value));
// no answer yet: point them back at the box instead of saving a zero by accident
const submit = () => { if (!answered()) { $("[data-value]").focus(); screens.question.classList.add("nudge"); setTimeout(() => screens.question.classList.remove("nudge"), 400); return; } save(setValue(readValue())); };
$("[data-value]").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } });
$("[data-save]").addEventListener("click", submit);
$("[data-zero]").addEventListener("click", () => save(0));

// lesson check: the intro talks about this video, not the whole program
if (CHECK) {
  document.title = `${CHECK.title} check · Hard 2 Break`;
  $("#intro .eyebrow").textContent = `Lesson check · Module ${CHECK.module}`;
  $("#intro h1").innerHTML = `Check your <em></em>`;
  $("#intro h1 em").textContent = CHECK.title;
  $("#intro .lead").textContent = "5 minutes to know if you're ready for the next video, or exactly what to work on first.";
  const gets = [
    ["Know when you're ready to move on.", "No guessing, and no moving on before your body is ready."],
    [CHECK.steps ? "Your exact step." : "Your gaps, biggest first.", CHECK.steps ? "See which step you're on and the number to hit before the next one." : "See how far you are from each of Josh's targets."],
    ["Proof you're improving.", "Your numbers are saved. Check again next session and watch them go up."],
  ];
  $("[data-gets]").replaceChildren(...gets.map(([b, t]) => { const li = document.createElement("li"), s = document.createElement("b"); s.textContent = b; li.append(s, " " + t); return li; }));
  // Josh's own rule, from his straddle planche tutorial (Voice.md)
  $("[data-quote]").textContent = "\u201cMake sure you hit the milestone for every single step before moving on. That way you don't injure yourself.\u201d \u2014 Josh";
  $("[data-quote]").hidden = false;
  $("#intro .micro").textContent = `About 5 minutes · ${CHECK.tests.length} ${CHECK.steps ? "steps" : "tests"}`;
  $("[data-restart]").textContent = "Check again";
  $("[data-start]").textContent = "Start the check";
  INTRO_COLOR_OVERRIDE = COLORS[CHECK.module];
}
tint(INTRO_COLOR_OVERRIDE);
// came back later: show the last result (with progress since the one before) instead of a blank test
if (load().length) (CHECK ? finishCheck : finish)(false);
