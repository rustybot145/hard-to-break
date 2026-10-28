// What each module's training week looks like, straight from Josh's lesson videos
// (raw/lesson-transcripts in the vault). test.js turns this into "Your first week" on the result.
//   days:     default training days (0 = Sunday), from Josh's own examples; the user can change them
//   sessions: the session types, rotated across the chosen days
//   items:    exercises; with `test`, the prescription adapts to that test score:
//             pass = hit the target, low(v) = below it (v is their number)
const band = (sets) => (v) => `${sets} with a band${v ? ` (you did ${v})` : ""}. Lighter band each week.`;
const holdUp = (target) => (v) => `3 holds, as long as you can${v ? `: beat ${v}s` : ""}. Build to ${target}s.`;

const TRAINING = {
  2: {
    days: [1, 2, 4, 5], sessions: ["Push + Pull", "Core + Legs"], rest: "90 seconds between sets",
    items: [
      { s: 0, name: "Deep pseudo push-ups", rx: "3 × 15. Band if you need it." },
      { s: 0, name: "Straight-arm banded flies", rx: "3 × 15. Walk forward to make it harder." },
      { s: 0, name: "Dumbbell press to the hips", rx: "3 × 15. Start light, build to 25 lb." },
      { s: 0, name: "Pike push-ups", test: "pike", rx: "3 × 15", low: band("3 × 15") },
      { s: 0, name: "Bar hang", test: "hang", rx: "3 × 60s", low: holdUp(60) },
      { s: 0, name: "Scapular pull-ups", test: "scap", rx: "3 × 15", low: band("3 × 15") },
      { s: 0, name: "Inverted rows", test: "row", rx: "3 × 15. Lower the bar each week.", low: (v) => `3 × 15 with the bar raised${v ? ` (you did ${v})` : ""}. Lower it each week.` },
      { s: 0, name: "Band rows", rx: "3 × 15. Heavier band each week." },
      { s: 1, name: "Plank", rx: "3 × 60s. Band around your waist if you need it." },
      { s: 1, name: "Ab wheel rollouts", rx: "3 × 15. Band around your chest if you need it." },
      { s: 1, name: "Leg raises", test: "legraise", rx: "3 × 15, straight legs", low: (v) => `3 × 15 knee tucks${v ? ` (you did ${v} straight)` : ""}. Move up a version each time it's easy.` },
      { s: 1, name: "Hollow body hold", test: "hollow", rx: "3 × 60s", low: (v) => `3 holds with your feet planted${v ? ` (you held ${v}s)` : ""}. Move up a version each time it's easy.` },
      { s: 1, name: "Bodyweight squats", rx: "3 × 15" },
      { s: 1, name: "Narrow squats", test: "narrow", rx: "3 × 15", low: (v) => `3 × 15 holding a band for help${v ? ` (you did ${v})` : ""}` },
      { s: 1, name: "Cossack squats", rx: "3 × 15. Hold a band for help if you need it." },
      { s: 1, name: "Deep lunges", rx: "3 × 15 per leg" },
    ],
  },
  3: {
    days: [1, 3, 5], sessions: ["Pull-ups, dips and L-sit"], rest: "90 seconds between sets",
    items: [
      { s: 0, name: "Chest-to-bar pull-ups", test: "c2b", rx: "3 × 10 with added weight. Go heavier each time 10 is easy.", low: band("3 × 10") },
      { s: 0, name: "Parallette dips", rx: "3 × 10. Band if you need it, add weight once 10 is easy." },
      { s: 0, name: "Straight-bar dips", test: "sbdip", rx: "3 × 10 with added weight", low: band("3 × 10") },
      { s: 0, name: "L-sit", test: "lsit", rx: "3 × 30s hold",
        low: (v) => (v ? `Band-assisted L-sit, build to 30s (you held ${v}s)` : "Compression raises 3 × 10, single-leg L-sit 15s per side, bent-knee hold 15s") },
      { s: 0, name: "Toes to bar", test: "t2b", rx: "3 × 10",
        low: (v) => (v ? `3 sets of full reps, build to 10 (you did ${v})` : "Knee tuck kick-ups 3 × 10. Then halfway raises, then slow negatives.") },
    ],
  },
  4: {
    days: [1, 4], sessions: ["Handstand"], rest: "90 seconds between sets",
    lessons: [
      [
        { s: 0, name: "Elevated pike hold", rx: "3 × 30s" },
        { s: 0, name: "Elevated pike leg raises", rx: "3 × 10 per leg" },
        { s: 0, name: "Wall climbs", rx: "3 × 10, hold 2 to 5s" },
        { s: 0, name: "Pike kick-up to the wall", rx: "3 × 5 per leg" },
        { s: 0, name: "Wall handstand", test: "wallhs", rx: "3 × 30s", low: holdUp(30) },
      ],
      [
        { s: 0, name: "Heel taps", rx: "3 × 10" },
        { s: 0, name: "Kick-up floats", rx: "3 × 5 per leg" },
        { s: 0, name: "Kick up, bring the legs together", rx: "3 × 5 per leg" },
        { s: 0, name: "Wall-supported holds", rx: "5 to 6 holds, up to 30s" },
        { s: 0, name: "Bail-outs", rx: "3 × 5 per side" },
        { s: 0, name: "Freestanding handstand", test: "freehs", rx: "Practice holds, build your time", low: (v) => `Practice holds${v ? `: beat ${v}s` : ""}` },
      ],
    ],
  },
  5: {
    days: null, sessions: ["Muscle-up"], rest: "90 seconds between sets (up to 3 minutes for clean reps)",
    lessons: [
      [
        { s: 0, name: "Rock from the L position", rx: "3 × 10" },
        { s: 0, name: "L-sit pull-ups to the chest", test: "lpull", rx: "3 × 10", low: (v) => `3 sets, as many as you can${v ? ` (you did ${v})` : ""}. Build to 10.` },
        { s: 0, name: "Lat pulldown with press-down", rx: "3 × 10. Build to 50% of your body weight." },
        { s: 0, name: "Straight-bar dips to the chest line", rx: "3 × 10" },
      ],
      [
        { s: 0, name: "Strength work from lesson 1", rx: "3 × 10 each, first" },
        { s: 0, name: "Swing into a chest-to-bar pull-up", rx: "10 reps" },
        { s: 0, name: "Slow eccentric muscle-up", rx: "10 reps" },
        { s: 0, name: "Eccentric into a chest-to-bar pull-up", rx: "10 reps" },
      ],
      [
        { s: 0, name: "Strength work from lesson 1", rx: "3 × 10 each, first" },
        { s: 0, name: "Clean muscle-ups", test: "mu", rx: "3 × 10", low: (v) => `3 sets of clean reps only${v ? ` (you did ${v})` : ""}. Build to 10.` },
      ],
    ],
  },
  6: {
    days: [1, 4], sessions: ["Dragon flag"], rest: "90 seconds between sets (up to 3 minutes from lesson 2)",
    lessons: [
      [
        { s: 0, name: "Tuck drops", rx: "3 × 10. Band behind your knees if you need it." },
        { s: 0, name: "Tuck hold", test: "tuckdf", rx: "3 × 15s", low: holdUp(15) },
        { s: 0, name: "Advanced tuck drops", rx: "3 × 10" },
        { s: 0, name: "Advanced tuck hold", rx: "3 × 15s" },
      ],
      [
        { s: 0, name: "Lesson 1 work as your warm-up", rx: "1 round" },
        { s: 0, name: "Single-leg negatives", rx: "3 × 10 per leg" },
        { s: 0, name: "Single-leg hold", rx: "3 × 15s per leg" },
        { s: 0, name: "Straddle negatives", rx: "3 × 10" },
        { s: 0, name: "Straddle hold", rx: "3 × 15s" },
        { s: 0, name: "Full negatives", test: "negdf", rx: "3 × 5", low: (v) => `3 × 5 with a light band${v ? ` (you did ${v})` : ""}` },
      ],
      [
        { s: 0, name: "Lesson 1 and 2 work", rx: "1 round" },
        { s: 0, name: "Full negatives", rx: "3 sets, build from 5 to 10" },
        { s: 0, name: "Dragon flag hold", test: "fulldf", rx: "3 × 15s", low: holdUp(15) },
      ],
    ],
  },
  7: {
    days: [1, 4], sessions: ["Pike press work"], rest: "90 seconds to 3 minutes between sets",
    extra: "Straight leg stretch on 3 to 4 days a week",
    lessons: [[
      { s: 0, name: "Straight leg stretch protocol", rx: "4 rounds standing, 4 loaded, 4 pulses" },
      { s: 0, name: "Pike rocks", rx: "3 sets, as many as you can. Build to 10." },
      { s: 0, name: "Headstand reverse leg lifts", rx: "3 × 10. Start with the tuck version if you need to." },
    ]],
  },
};
