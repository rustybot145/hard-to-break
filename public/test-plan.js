// Lesson checks: one per video, linked from that lesson in Whop as /test?lesson=<module>-<lesson>.
// The targets are the ones Josh sets in that video.
//   steps: true  = Josh's sets build on each other, so the first miss is the step to work on
//   after        = what to do once it's all passed, in his words
const r = (id, name, target, how) => ({ id, name, kind: "reps", target, how });
const s = (id, name, target, how) => ({ id, name, kind: "secs", target, how });
const CHECKS = {
  "2-1": { module: 2, title: "Pushing Basics", after: "Keep it up 2 days a week alongside Pulling Basics and Core and Legs for the full 6 weeks.", tests: [
    r("pseudo", "Deep pseudo push-ups", 15, "Lean forward, hands as close to your hips as you can. No band."),
    r("dbpress", "Dumbbell press to the hips", 15, "With 25 lb dumbbells, lowered all the way to your hips."),
    r("pike", "Pike push-ups", 15, "Butt high, elbows in, head to the ground. No band."),
  ] },
  "2-2": { module: 2, title: "Pulling Basics", after: "Keep it up 2 days a week alongside Pushing Basics for the full 6 weeks.", tests: [
    s("hang", "Bar hang", 60, "Feet off the ground, arms straight. No band."),
    r("scap", "Scapular pull-ups", 15, "Shoulder blades down, then back up. Arms straight, no band."),
    r("row", "Inverted rows", 15, "Bar low, body close to parallel. Chest to the bar."),
  ] },
  "2-3": { module: 2, title: "Core and Legs", after: "Pass all three Foundations checks and you're ready for Module 3.", tests: [
    s("plank", "Plank", 60, "Forearms down, butt tucked, no band."),
    r("rollout", "Ab wheel rollouts", 15, "Roll out until your head nears the ground. Feet down, no band."),
    r("legraise", "Leg raises", 15, "Straight legs, toes pointed."),
    s("hollow", "Hollow body hold", 60, "Arms and legs straight at about 45°."),
    r("narrow", "Narrow squats", 15, "Feet together, all the way down. No band."),
    r("cossack", "Cossack squats", 15, "Wide base, heel stays down. No band."),
  ] },
  "3-1": { module: 3, title: "Pull-Ups", after: "Now add weight (a vest or a dumbbell between your thighs) and keep going up for the rest of the 6 weeks.", tests: [
    r("c2b", "Chest-to-bar pull-ups", 10, "Scapular pull-up first, then chest to the bar. No band."),
  ] },
  "3-2": { module: 3, title: "Dips", after: "Now add weight so 10 reps always feels like only 1 or 2 more are left.", tests: [
    r("pdip", "Parallette dips", 10, "Feet out, butt to the ground, shoulders pushed down at the top. No band."),
    r("sbdip", "Straight-bar dips", 10, "Chest to the bar, press back up. No band."),
  ] },
  "3-3": { module: 3, title: "L-Sit and Toes to Bar", after: "Pass all three strength checks and you're ready for Module 4.", tests: [
    s("lsit", "L-sit", 30, "Legs straight out, feet off the ground. No band."),
    r("t2b", "Toes to bar", 10, "Push the bar away, arms straight, toes touch the bar."),
  ] },
  "4-1": { module: 4, title: "Wall Handstand", steps: true, after: "You're ready for video 2: Freestanding Balance. Keep these steps in your training.", tests: [
    s("epike", "Elevated pike hold", 30, "Knees on a bench, pushing through the ground, looking at your feet."),
    r("epikelr", "Elevated pike leg raises", 10, "Per leg. As high and straight as you can, 2-second hold."),
    r("wallclimb", "Wall climbs", 10, "Walk up close to the wall, hold 2 to 5 seconds, fully pushed up."),
    r("kickwall", "Pike kick-ups to the wall", 5, "Per leg, from the bench. Hold about 5 seconds."),
    s("wallhs", "Wall handstand", 30, "Heels on the wall, legs together, shoulders pushed up."),
  ] },
  "4-2": { module: 4, title: "Freestanding Balance", steps: true, after: "Keep practicing your holds. Film them and use Handstand Fixes to clean up your line.", tests: [
    r("heeltap", "Heel taps", 10, "In a wall handstand, fingertips bring your heels just off the wall, palms bring them back."),
    r("float", "Kick-up floats", 5, "Per leg. Float 1 to 3 seconds without touching the wall."),
    r("kicktog", "Kick up and bring the legs together", 5, "Per leg, hands close to the wall."),
    s("wallfree", "Hold near the wall without touching it", 30, "Balance between fingertips and palms."),
    r("bail", "Bail-outs", 5, "Per side. Open one hand and fall to the side."),
    // ponytail: Josh gives no freestanding hold time; 10 seconds is a placeholder until he confirms
    s("freehs", "Freestanding handstand", 10, "No wall. Legs together, toes pointed."),
  ] },
  "5-1": { module: 5, title: "Muscle-Up Strength", after: "You're ready for video 2: The Transition. Keep this strength work in every session.", tests: [
    r("rockl", "Rock from the L position", 10, "Arms at 90°, feet out. Pull toward your face, push away."),
    r("lpull", "L-sit pull-ups", 10, "Pull to your lower chest every rep."),
    r("dipchest", "Straight-bar dips to the chest line", 10, "Feet up, dip to your chest line, hold a second."),
  ] },
  "5-2": { module: 5, title: "The Transition", steps: true, after: "You're ready for video 3: Clean Reps.", tests: [
    r("swingc2b", "Swing into a chest-to-bar pull-up", 10, "On the backswing, pull the bar hard to your chest."),
    r("eccmu", "Slow eccentric muscle-ups", 10, "From the top, lower as slowly as you can through the rotation."),
    r("ecc2c2b", "Eccentric into a chest-to-bar pull-up", 10, "Lower slowly, rotate, swing, chest to the bar."),
  ] },
  "5-3": { module: 5, title: "Clean Reps", after: "10 clean reps with momentum sets you up for the strict muscle-up.", tests: [
    r("mu", "Clean muscle-ups", 10, "Both arms over together on every rep."),
  ] },
  "6-1": { module: 6, title: "Tuck Dragon Flag", steps: true, after: "Train it all unassisted, 2 days a week for 3 weeks, then move on to Dragon Flag Negatives.", tests: [
    r("tuckdrop", "Tuck drops", 10, "Knees to your chest, hips up, lower your feet and pull back. No band."),
    s("tuckdf", "Tuck hold", 15, "Hips up, knees tucked. No band."),
    r("advdrop", "Advanced tuck drops", 10, "Knees away from your chest, feet reaching out. No band."),
    s("advhold", "Advanced tuck hold", 15, "No band."),
  ] },
  "6-2": { module: 6, title: "Dragon Flag Negatives", steps: true, after: "Train it all unassisted, 2 days a week for 3 weeks, then move on to Full Dragon Flag.", tests: [
    r("slneg", "Single-leg negatives", 10, "Per leg. One knee to your chest, hips up. No band."),
    s("slhold", "Single-leg hold", 15, "Per leg. No band."),
    r("stneg", "Straddle negatives", 10, "Legs straddled, hips up. No band."),
    s("sthold", "Straddle hold", 15, "No band."),
    r("negdf", "Full negatives", 5, "Legs straight and together, hips up. No band."),
  ] },
  "6-3": { module: 6, title: "Full Dragon Flag", steps: true, after: "Train it 2 days a week for 3 weeks. Once the hold feels easy, add a light dumbbell between your feet.", tests: [
    r("negdf10", "Full negatives", 10, "Steady rhythm, legs together. No band."),
    s("fulldf", "Dragon flag hold", 15, "Hips up, body straight. No band."),
  ] },
  "7-2": { module: 7, title: "Pike Rock", after: "Keep doing pike rocks for 3 weeks before the pike press video.", tests: [
    r("pikerock", "Pike rocks", 10, "Legs straight, butt high. Dive until your feet lift off."),
  ] },
  "7-3": { module: 7, title: "Headstand Reverse Leg Lift", steps: true, after: "Do at least 2 weeks at each version before moving on. Then go to the pike press video.", tests: [
    r("rlltuck", "Tuck reverse leg lifts", 10, "From your knees, knees tight to your chest."),
    r("rllsingle", "Single-leg reverse leg lifts", 10, "Per leg."),
    r("rllstraddle", "Straddle reverse leg lifts", 10, "Legs straddled, lean toward the wall."),
    r("rll", "Reverse leg lifts", 10, "From a pike headstand, lift to the top, lower without touching the floor."),
  ] },
  "7-4": { module: 7, title: "Pike Press", steps: true, after: "Stay on the full program for 3 weeks, 2 days a week, to lock in your pike press.", tests: [
    r("rllpress", "Reverse leg lift into a wall handstand", 5, "From the headstand, use the momentum to press up to the wall. (Can't yet? Build to 10 negatives first.)"),
    r("rockwall", "Pike rock into a wall handstand", 5, "Dive, legs come up, press hard. The wall catches you."),
    r("slowwall", "Slow pike press by the wall", 5, "Slow and controlled, without touching the wall."),
    r("pikepress", "Pike press", 5, "No wall. Legs straight, hands flat, dive and press up."),
  ] },
  "8-1": { module: 8, title: "Tuck and Advanced Tuck", steps: true, after: "Train it all unassisted, 2 days a week for 3 weeks, then move on to One Leg and Straddle.", tests: [
    s("tucklever", "Tuck front lever", 15, "Push the bar away, knees to your chest. No band."),
    s("advlever", "Advanced tuck front lever", 15, "Feet reaching out from the tuck. No band."),
  ] },
  "8-2": { module: 8, title: "One Leg and Straddle", steps: true, after: "Train it all, 2 days a week for 3 weeks, then move on to the full front lever.", tests: [
    r("sllift", "Single-leg lever raises", 10, "Per leg. Retract, posterior tilt, push the bar away. No band."),
    r("slneglever", "Single-leg lever negatives", 10, "Per leg. Lower down to the lever, pull back in. No band."),
    s("slholdlever", "Single-leg lever hold", 15, "Per leg. No band."),
    r("stlift", "Straddle lever raises", 10, "Hips forward, lats flared, push the bar away."),
    r("stneglever", "Straddle lever negatives", 10, "From the top, drop down under control."),
    s("stholdlever", "Straddle lever hold", 15, "Push the bar away, hips up."),
  ] },
};
