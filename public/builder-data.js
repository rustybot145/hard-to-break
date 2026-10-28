// Workout Builder data. Every exercise, number and schedule comes from Josh's lesson videos
// (raw/lesson-transcripts in the vault). builder.js picks the module, then lays this out as a week.
//   freq:     Josh's training days per week for the module (null = he doesn't set one)
//   sessions: the session types, rotated across the training days
//   lessons:  each lesson's exercises, in order; `weeks` is Josh's minimum time on it
//   rx:       a string, or a function of { v: test numbers, w: body weight in lb } for lines that adapt
//   clip:     clips/<clip>.mp4 + .jpg, a few seconds of Josh doing it, cut from the lesson video

// The 5 optional quick tests, and the target that counts as "has it"
const TESTS = [
  { id: "hang", name: "Bar hang", kind: "secs", target: 60, ask: "How many seconds can you hang from a bar?", how: "Feet off the ground, arms straight." },
  { id: "pullups", name: "Pull-ups", kind: "reps", target: 10, ask: "How many pull-ups can you do in a row?", how: "Full reps, chest toward the bar. No band, no kipping." },
  { id: "dips", name: "Dips", kind: "reps", target: 10, ask: "How many dips can you do in a row?", how: "On dip bars or a straight bar, all the way down and back up. No band." },
  { id: "pushups", name: "Push-ups", kind: "reps", target: 15, ask: "How many push-ups can you do in a row?", how: "Chest to the floor, body straight." },
  { id: "hollow", name: "Hollow body hold", kind: "secs", target: 60, ask: "How many seconds can you hold a hollow body?", how: "Lower back on the floor, arms and legs straight at about 45°." },
];

const below = (id, target) => ({ v }) => v[id] !== undefined && v[id] < target;
const did = (id, unit = "") => ({ v }) => (v[id] !== undefined ? ` (you did ${v[id]}${unit})` : "");

const MODULES = {
  2: {
    title: "Calisthenics Foundations", color: "#ff8a3d", weeks: 6, freq: 4, sessions: ["Push + Pull", "Core + Legs"], rest: "90 seconds between sets",
    lessons: [{ title: "Pushing, Pulling, Core and Legs", weeks: 6, items: [
      { s: 0, name: "Deep pseudo push-ups", clip: "m2-deep-pseudo-push-ups", rx: (c) => (below("pushups", 15)(c) ? `3 × 15 with a band${did("pushups")(c)}. Lighter band each week.` : "3 × 15") },
      { s: 0, name: "Straight-arm banded flies", clip: "m2-straight-arm-banded-flies", rx: "3 × 15. Walk forward to make it harder." },
      { s: 0, name: "Dumbbell press to the hips", clip: "m2-dumbbell-press-to-the-hips", rx: "3 × 15. Start light, build to 25 lb." },
      { s: 0, name: "Pike push-ups", clip: "m2-pike-push-ups", rx: "3 × 15. Band if you need it." },
      { s: 0, name: "Bar hang", clip: "m2-bar-hang", rx: (c) => (below("hang", 60)(c) ? `3 holds, as long as you can: beat ${c.v.hang}s. Build to 60s.` : "3 × 60s") },
      { s: 0, name: "Scapular pull-ups", clip: "m2-scapular-pull-ups", rx: "3 × 15. Band if you need it." },
      { s: 0, name: "Inverted rows", clip: "m2-inverted-rows", rx: "3 × 15. Lower the bar each week." },
      { s: 0, name: "Band rows", clip: "m2-band-rows", rx: "3 × 15. Heavier band each week." },
      { s: 1, name: "Plank", clip: "m2-plank", rx: "3 × 60s. Band around your waist if you need it." },
      { s: 1, name: "Ab wheel rollouts", clip: "m2-ab-wheel-rollouts", rx: "3 × 15. Band around your chest if you need it." },
      { s: 1, name: "Leg raises", clip: "m2-leg-raises", rx: "3 × 15. Start with knee tucks if straight legs are too hard." },
      { s: 1, name: "Hollow body hold", clip: "m2-hollow-body-hold", rx: (c) => (below("hollow", 60)(c) ? `3 holds with your feet planted${did("hollow", "s")(c)}. Move up a version each time it's easy.` : "3 × 60s") },
      { s: 1, name: "Bodyweight squats", clip: "m2-bodyweight-squats", rx: "3 × 15" },
      { s: 1, name: "Narrow squats", clip: "m2-narrow-squats", rx: "3 × 15. Hold a band for help if you need it." },
      { s: 1, name: "Cossack squats", clip: "m2-cossack-squats", rx: "3 × 15" },
      { s: 1, name: "Deep lunges", clip: "m2-deep-lunges", rx: "3 × 15 per leg" },
    ] }],
  },
  3: {
    title: "Building Strength", color: "#ff5252", weeks: 6, freq: 3, sessions: ["Pull-ups, dips and L-sit"], rest: "90 seconds between sets",
    lessons: [{ title: "Pull-Ups, Dips, L-Sit and Toes to Bar", weeks: 6, items: [
      { s: 0, name: "Chest-to-bar pull-ups", clip: "m3-chest-to-bar-pull-ups", rx: (c) => (below("pullups", 10)(c) ? `3 × 10 with a band${did("pullups")(c)}. Lighter band each week.` : c.v.pullups !== undefined ? "3 × 10 with added weight. Start around 5 lb and go up each time 10 is easy." : "3 × 10. Band if you need it, add weight once 10 is easy.") },
      { s: 0, name: "Parallette dips", clip: "m3-parallette-dips", rx: "3 × 10. Band if you need it, add weight once 10 is easy." },
      { s: 0, name: "Straight-bar dips", clip: "m3-straight-bar-dips", rx: (c) => (below("dips", 10)(c) ? `3 × 10 with a band${did("dips")(c)}. Lighter band each week.` : c.v.dips !== undefined ? "3 × 10 with added weight" : "3 × 10. Band if you need it.") },
      { s: 0, name: "L-sit", clip: "m3-l-sit", rx: "Build to a 30s hold. Start with compression raises, single-leg L-sits and bent-knee holds." },
      { s: 0, name: "Toes to bar", clip: "m3-toes-to-bar", rx: "3 × 10. Start with knee tuck kick-ups, then halfway raises, then slow negatives." },
    ] }],
  },
  4: {
    title: "The Handstand", color: "#5b9dff", weeks: 6, freq: 2, sessions: ["Handstand"], rest: "90 seconds between sets",
    lessons: [
      { title: "Wall Handstand", weeks: 3, items: [
        { s: 0, name: "Elevated pike hold", clip: "m4-elevated-pike-hold", rx: "3 × 30s" },
        { s: 0, name: "Elevated pike leg raises", clip: "m4-elevated-pike-leg-raises", rx: "3 × 10 per leg" },
        { s: 0, name: "Wall climbs", clip: "m4-wall-climbs", rx: "3 × 10, hold 2 to 5s" },
        { s: 0, name: "Pike kick-up to the wall", clip: "m4-pike-kick-up-to-the-wall", rx: "3 × 5 per leg" },
        { s: 0, name: "Wall handstand", clip: "m4-wall-handstand", rx: "3 × 30s" },
      ] },
      { title: "Freestanding Balance", weeks: 3, items: [
        { s: 0, name: "Heel taps", clip: "m4-heel-taps", rx: "3 × 10" },
        { s: 0, name: "Kick-up floats", clip: "m4-kick-up-floats", rx: "3 × 5 per leg" },
        { s: 0, name: "Kick up, bring the legs together", clip: "m4-kick-up-bring-the-legs-together", rx: "3 × 5 per leg" },
        { s: 0, name: "Wall-supported holds", clip: "m4-wall-supported-holds", rx: "5 to 6 holds, up to 30s" },
        { s: 0, name: "Bail-outs", clip: "m4-bail-outs", rx: "3 × 5 per side" },
        { s: 0, name: "Freestanding handstand", clip: "m4-freestanding-handstand", rx: "Practice holds, build your time" },
      ] },
    ],
  },
  5: {
    title: "The Muscle-Up", color: "#a77bff", weeks: 6, freq: null, sessions: ["Muscle-up"], rest: "90 seconds between sets (up to 3 minutes for clean reps)",
    lessons: [
      { title: "Muscle-Up Strength", weeks: 2, items: [
        { s: 0, name: "Rock from the L position", clip: "m5-rock-from-the-l-position", rx: "3 × 10" },
        { s: 0, name: "L-sit pull-ups to the chest", clip: "m5-l-sit-pull-ups-to-the-chest", rx: "3 × 10" },
        { s: 0, name: "Lat pulldown with press-down", clip: "m5-lat-pulldown-with-press-down", weight: true, rx: (c) => (c.w ? `3 × 10. Build to ${Math.round(c.w / 2)} lb (half your body weight).` : "3 × 10. Build to half your body weight.") },
        { s: 0, name: "Straight-bar dips to the chest line", clip: "m5-straight-bar-dips-to-the-chest-line", rx: "3 × 10" },
      ] },
      { title: "The Transition", weeks: 2, items: [
        { s: 0, name: "Strength work from lesson 1", rx: "3 × 10 each, first" },
        { s: 0, name: "Swing into a chest-to-bar pull-up", clip: "m5-swing-into-a-chest-to-bar-pull-up", rx: "10 reps" },
        { s: 0, name: "Slow eccentric muscle-up", clip: "m5-slow-eccentric-muscle-up", rx: "10 reps" },
        { s: 0, name: "Eccentric into a chest-to-bar pull-up", clip: "m5-eccentric-into-a-chest-to-bar-pull-up", rx: "10 reps" },
      ] },
      { title: "Clean Reps", weeks: 2, items: [
        { s: 0, name: "Strength work from lesson 1", rx: "3 × 10 each, first" },
        { s: 0, name: "Clean muscle-ups", clip: "m5-clean-muscle-ups", rx: "3 × 10, clean reps only" },
      ] },
    ],
  },
  6: {
    title: "The Dragon Flag", color: "#b8f04a", weeks: 9, freq: 2, sessions: ["Dragon flag"], rest: "90 seconds to 3 minutes between sets",
    lessons: [
      { title: "Tuck Dragon Flag", weeks: 3, items: [
        { s: 0, name: "Tuck drops", clip: "m6-tuck-drops", rx: "3 × 10. Band behind your knees if you need it." },
        { s: 0, name: "Tuck hold", clip: "m6-tuck-hold", rx: "3 × 15s" },
        { s: 0, name: "Advanced tuck drops", clip: "m6-advanced-tuck-drops", rx: "3 × 10" },
        { s: 0, name: "Advanced tuck hold", clip: "m6-advanced-tuck-hold", rx: "3 × 15s" },
      ] },
      { title: "Dragon Flag Negatives", weeks: 3, items: [
        { s: 0, name: "Lesson 1 work as your warm-up", rx: "1 round" },
        { s: 0, name: "Single-leg negatives", clip: "m6-single-leg-negatives", rx: "3 × 10 per leg" },
        { s: 0, name: "Single-leg hold", clip: "m6-single-leg-hold", rx: "3 × 15s per leg" },
        { s: 0, name: "Straddle negatives", clip: "m6-straddle-negatives", rx: "3 × 10" },
        { s: 0, name: "Straddle hold", clip: "m6-straddle-hold", rx: "3 × 15s" },
        { s: 0, name: "Full negatives", clip: "m6-full-negatives", rx: "3 × 5" },
      ] },
      { title: "Full Dragon Flag", weeks: 3, items: [
        { s: 0, name: "Lesson 1 and 2 work", rx: "1 round" },
        { s: 0, name: "Full negatives", clip: "m6-full-negatives", rx: "3 sets, build from 5 to 10" },
        { s: 0, name: "Dragon flag hold", clip: "m6-dragon-flag-hold", rx: "3 × 15s" },
      ] },
    ],
  },
  7: {
    title: "Pike Press to Handstand", color: "#ff6fae", weeks: 8, freq: 2, sessions: ["Pike press work"], rest: "90 seconds to 3 minutes between sets",
    extra: "Straight leg stretch on 3 to 4 days a week",
    lessons: [
      { title: "Straight Leg Stretch, Pike Rock and Reverse Leg Lift", weeks: 5, items: [
        { s: 0, name: "Straight leg stretch protocol", clip: "m7-straight-leg-stretch-protocol", rx: "4 rounds standing, 4 loaded, 4 pulses" },
        { s: 0, name: "Pike rocks", clip: "m7-pike-rocks", rx: "3 sets, as many as you can. Build to 10." },
        { s: 0, name: "Headstand reverse leg lifts", clip: "m7-headstand-reverse-leg-lifts", rx: "3 × 10. Tuck, then single leg, then straddle, then full." },
      ] },
      { title: "Pike Press", weeks: 3, items: [
        { s: 0, name: "Reverse leg lift into a wall handstand", clip: "m7-reverse-leg-lift-into-a-wall-handstand", rx: "3 × 5" },
        { s: 0, name: "Pike rock into a wall handstand", clip: "m7-pike-rock-into-a-wall-handstand", rx: "3 × 5" },
        { s: 0, name: "Slow pike press by the wall", clip: "m7-slow-pike-press-by-the-wall", rx: "3 × 5, without touching the wall" },
        { s: 0, name: "Pike press", clip: "m7-pike-press", rx: "3 sets, build to 5" },
      ] },
    ],
  },
  8: {
    title: "The Front Lever", color: "#5fe3f0", weeks: 6, freq: 2, sessions: ["Front lever"], rest: "90 seconds to 3 minutes between sets",
    lessons: [
      { title: "Tuck and Advanced Tuck", weeks: 3, items: [
        { s: 0, name: "Tuck front lever hold", clip: "m8-tuck-front-lever-hold", rx: "3 × 15s. Band if you need it." },
        { s: 0, name: "Advanced tuck front lever hold", clip: "m8-advanced-tuck-front-lever-hold", rx: "3 × 15s" },
      ] },
      { title: "One Leg and Straddle", weeks: 3, items: [
        { s: 0, name: "Single-leg lever raises", clip: "m8-single-leg-lever-raises", rx: "3 × 10 per leg" },
        { s: 0, name: "Single-leg lever negatives", clip: "m8-single-leg-lever-negatives", rx: "3 × 10 per leg" },
        { s: 0, name: "Single-leg lever hold", clip: "m8-single-leg-lever-hold", rx: "3 × 15s per leg" },
        { s: 0, name: "Straddle lever raises", clip: "m8-straddle-lever-raises", rx: "3 × 10" },
        { s: 0, name: "Straddle lever negatives", clip: "m8-straddle-lever-negatives", rx: "3 × 10" },
        { s: 0, name: "Straddle lever hold", clip: "m8-straddle-lever-hold", rx: "3 × 15s" },
      ] },
      // Josh sets no time for the full lever: you keep building hold time
      { title: "Full Front Lever", weeks: null, items: [
        { s: 0, name: "Front lever ups", clip: "m8-front-lever-ups", rx: "3 × 10. Band for the reps you can't do on your own." },
        { s: 0, name: "Front lever negatives", clip: "m8-front-lever-negatives", rx: "3 × 10, once you can do your lever ups with no band. Light band if you need it." },
        { s: 0, name: "Band-assisted front lever hold", clip: "m8-band-assisted-front-lever-hold", rx: "3 × 15s. Lighter band each week." },
        { s: 0, name: "Front lever hold", clip: "m8-front-lever-hold", rx: "3 holds, as long as you can. Build to 15s. Rest up to 3 minutes." },
      ] },
    ],
  },
  9: { title: "The Planche", color: "#ffb347", weeks: null, freq: null, sessions: [], comingSoon: true, lessons: [] },
};

// the skills people can pick as goals (Modules 4 to 9, in program order)
const GOALS = [4, 5, 6, 7, 8, 9];
