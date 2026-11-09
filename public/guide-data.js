// Free guide: Joshua's 3 most-watched tutorials (Demand map: handstand 332K, front lever 284K, muscle-up 237K),
// each with 2 added steps. INSTAGRAM ONLY: steps, numbers, cues and clips all come from his public reels, never from
// the paid lessons, so the program keeps its value. `src` cites the reel. added: true = not a numbered step in the main reel.
const clip = (name) => `clips/g-${name}`;

export const SKILLS = [
  {
    id: "handstand",
    name: "Handstand",
    title: "Your first freestanding handstand",
    reel: "https://www.instagram.com/reel/DdcBJvwo8CR/",
    cover: clip("hs0"),
    long: "A month to about 6 months, depending on where you're starting.",
    how: "Train each step 2 times a week, 3 if you're not too sore.",
    need: "A wall and a bench or chair.",
    steps: [
      {
        name: "The pike walk", dose: "5–10", unit: "reps, 5-second hold", clip: clip("hs1"), src: "DdcBJvwo8CR, step 1",
        cues: ["Plant your hands firmly on the ground and look between your hands.", "Walk forward, keeping your butt as high as possible, until you're stacked in the pike position.", "Hold for about five seconds and walk back."],
      },
      {
        name: "Elevated pike leg raise", dose: "5–10", unit: "reps, 5-second hold", clip: clip("hs2"), src: "DdcBJvwo8CR, step 2",
        cues: ["Put your feet up on the bench and get stacked over your hands.", "Look between your hands, with your butt as high as possible.", "Bring one leg up as high as you can, hold for about five seconds, then do the other side."],
      },
      {
        name: "Wall climbs", dose: "5–10", unit: "reps", clip: clip("hs3"), src: "DdcBJvwo8CR, step 3",
        cues: ["Plant your hands on the ground and put your feet on the wall.", "Back yourself up until you're all the way against the wall.", "Look down for a second, then walk yourself back."],
      },
      {
        name: "Handstand hold against the wall", dose: "15–30", unit: "seconds", clip: clip("hs4"), src: "DdcBJvwo8CR, step 4",
        cues: ["Face the wall and put your hands nice and close to it.", "Kick up and let your heels rest on the wall.", "Look straight back and hold."],
      },
      {
        name: "Heel taps", dose: "5–10", unit: "reps", clip: clip("hs5"), src: "DdcBJvwo8CR, step 5",
        cues: ["Hands nice and close to the wall. Pop up and put your heels on the wall.", "Look between your shoulders.", "Press through your fingertips until your heels come off the wall, then bring them back."],
      },
      {
        name: "Single-leg kick-ups", dose: "5–10", unit: "reps each side", clip: clip("hs6"), src: "DdcBJvwo8CR, step 6",
        cues: ["Put your hands firmly on the ground, one foot close and the other all the way back.", "Kick this leg straight up and let the other leg lag behind a little.", "Bring yourself back down. This teaches you how to pop up to the handstand."],
      },
      {
        name: "Learn how to fall", dose: "5–10", unit: "falls to the side", clip: clip("hs7"), src: "DdcBJvwo8CR, step 7 · reps from DekyXJGovI6",
        cues: ["Kick up into the handstand.", "Lift up one of your hands.", "Twist and fall out to the side."],
        tip: "This is what helps you feel safe trying to kick up into your very first handstand.",
      },
      {
        name: "Kick up and bring the other leg up", dose: "5–10", unit: "good reps", clip: clip("hs8"), added: true, src: "DekyXJGovI6, step 6 · DdzgEO-SAwG, step 8",
        cues: ["Hands close to the wall. Kick up and float.", "Once you start finding balance, slowly bring the other leg up.", "Use your fingertips to keep you from touching the wall. Then switch sides."],
      },
      {
        name: "Kick up with both legs", dose: "5–10", unit: "reps", clip: clip("hs9"), added: true, src: "DdzgEO-SAwG, step 9",
        cues: ["Kick up with both legs at pretty close to the same time.", "On the way up, press through your fingertips and relax your arms a little so you don't go all the way over.", "Float up to the top, find your balance, then come back down."],
      },
    ],
    finish: "Look between your hands, keep your toes pointed and start building your time. Stay close to the wall without touching it for as long as you need. That's how you get your very first freestanding handstand.",
  },
  {
    id: "front-lever",
    name: "Front lever",
    title: "Your first front lever",
    reel: "https://www.instagram.com/reel/DdmW4uhoay4/",
    cover: clip("fl0"),
    long: "It took me about 4 months, but I was already very fit. Closer to a year for most people.",
    how: "Train each step 2 times a week, 3 if you're not too sore.",
    need: "A pull-up bar, and bands for the last steps.",
    steps: [
      {
        name: "Straight bar hang", dose: "1", unit: "minute", clip: clip("fl1"), src: "DdmW4uhoay4, step 1",
        cues: ["Hang from the bar.", "You need to be able to hang for about one minute before you move on."],
      },
      {
        name: "Knee tucks to the chest", dose: "10", unit: "reps", clip: clip("fl2"), src: "DdmW4uhoay4, step 2",
        cues: ["Bring your knees all the way up to your chest.", "Hold for a second.", "Bring your knees back down."],
      },
      {
        name: "Leg raises to halfway", dose: "5–10", unit: "reps", clip: clip("fl3"), src: "DdmW4uhoay4, step 3",
        cues: ["Raise your legs to halfway.", "Hold for a second.", "Come back down."],
      },
      {
        name: "Tuck lever ups", dose: "5–10", unit: "reps", clip: clip("fl4"), src: "DdmW4uhoay4, step 4",
        cues: ["Bring your knees to your chest.", "Rotate and push the bar away from you.", "Hold for a second, then come back down."],
      },
      {
        name: "Toes-to-bar leg raise", dose: "5–10", unit: "reps", clip: clip("fl5"), src: "DdmW4uhoay4, step 5",
        cues: ["Push the bar away from you.", "Bring your toes to the bar with your legs straight.", "Come back down."],
      },
      {
        name: "Single-leg lever raise", dose: "5–10", unit: "reps", clip: clip("fl6"), src: "DdmW4uhoay4, step 6",
        cues: ["Drive one knee to your chest and stick the other leg out.", "Raise up to the single-leg lever.", "Come back down and switch sides."],
      },
      {
        name: "Straddle ups", dose: "5–10", unit: "reps", clip: clip("fl7"), src: "DdmW4uhoay4, step 7",
        cues: ["Put your legs into the straddle position.", "Bring yourself up into a straddle lever.", "Come back down."],
      },
      {
        name: "Front lever ups", dose: "5–10", unit: "reps", clip: clip("fl8"), src: "DdmW4uhoay4, step 8",
        cues: ["Push the bar away from you.", "Bring yourself up to a front lever for a second.", "Come back down."],
      },
      {
        name: "Tuck lever hold", dose: "15–30", unit: "seconds", clip: clip("fl9"), src: "DdmW4uhoay4, step 9",
        cues: ["Bring yourself up into the tuck front lever.", "Push your knees away from you and push the bar away from you.", "Hold here."],
      },
      {
        name: "Straddle lever hold", dose: "15–30", unit: "seconds", clip: clip("fl10"), src: "DdmW4uhoay4, step 10",
        cues: ["Straddle your legs out.", "Push the bar away from you.", "Hold in the straddle lever."],
      },
      {
        name: "Single-leg lever hold", dose: "15–30", unit: "seconds each side", clip: clip("fl11"), src: "DdmW4uhoay4, step 11",
        cues: ["Hold one knee to your chest and take one leg out.", "Push the bar away from you.", "Hold in the single-leg lever, then switch sides."],
      },
      {
        name: "Band-assisted front lever hold", dose: "15–30", unit: "seconds", clip: clip("fl12"), src: "DdmW4uhoay4, step 12",
        cues: ["Put the band around the bar and around your neck.", "Get your feet into it and push your feet away from you.", "Go into the front lever and hold."],
      },
      {
        name: "Lighter band hold", dose: "15–30", unit: "seconds", clip: clip("fl13"), added: true, src: "DdmW4uhoay4, step 12 (his lighter-band progression, split out)",
        cues: ["Same setup, with a lighter band.", "Push your feet away from you and go into the front lever.", "Hold."],
      },
      {
        name: "Lightest band hold", dose: "15–30", unit: "seconds", clip: clip("fl14"), added: true, src: "DdmW4uhoay4, step 12 (his lightest-band progression, split out)",
        cues: ["Same setup, with your very lightest band.", "Push your feet away from you and go into the front lever.", "Hold."],
      },
    ],
    finish: "After the lightest band, push the bar away from you and try it with no band. That's how you're going to get your first front lever hold.",
  },
  {
    id: "muscle-up",
    name: "Muscle-up",
    title: "Your first muscle-up",
    reel: "https://www.instagram.com/reel/DdRurnxIUi7/",
    cover: clip("mu8"),
    long: "About 1 to 3 months if you can already hang for a minute and do 10 pull-ups. 3 to 9 months if you're brand new.",
    how: "Train each step 2 times a week, 3 if you're not too sore.",
    need: "A pull-up bar and a cable machine with a lat pull-down bar.",
    // his corrected order from Dd1uX7joaM_ (caption: "I changed the order from my last video"), so step numbers match the clips
    steps: [
      {
        name: "The rock", dose: "10", unit: "rocks", clip: clip("mu1"), src: "DdRurnxIUi7, step 2 · Dd1uX7joaM_, step 1 · DefQkYzzvfi, step 1",
        cues: ["Go into the L position.", "Push the bar away from you and swing forward.", "Try to bring your nose to the bar every single time."],
      },
      {
        name: "L-position chest-to-bar pulls", dose: "5–10", unit: "reps", clip: clip("mu2"), src: "DdRurnxIUi7, step 1 · reps from DefQkYzzvfi, step 2",
        cues: ["Go into the L position.", "Pull the bar straight to your chest, as hard as you can.", "Touch the bar every single time, right below the nipple line."],
      },
      {
        name: "Deep bar dips", dose: "5–10", unit: "reps", clip: clip("mu3"), src: "DdRurnxIUi7, step 4 · DefQkYzzvfi, step 3",
        cues: ["Hop up on the bar and dip down to the top of your chest.", "Bring your feet up as you dip.", "Push back up to the top."],
      },
      {
        name: "Cable pull and press", dose: "5–10", unit: "reps, good amount of weight", clip: clip("mu4"), src: "DdRurnxIUi7, step 3 · DefQkYzzvfi, step 4",
        cues: ["Take a narrow grip on the lat pull-down bar, with a good amount of weight.", "Pull the bar straight to your chest.", "Lean forward a little bit and press straight down."],
      },
      {
        name: "Rock to chest-to-bar", dose: "5–10", unit: "reps", clip: clip("mu5"), added: true, src: "Dd1uX7joaM_, step 5",
        cues: ["Rock forward.", "As you rock back, pull the bar to your chest.", "Touch it. That's one rep."],
        tip: "I added this step for the last bit of strength and coordination you need for the muscle-up.",
      },
      {
        name: "Negative reps", dose: "5–10", unit: "controlled reps", clip: clip("mu6"), src: "DdRurnxIUi7, step 5 · reps from Dd1uX7joaM_, step 6",
        cues: ["Start at the top of the bar.", "Lower yourself all the way down, as slowly as possible.", "Get back up and go again."],
      },
      {
        name: "Negatives into a pull-up", dose: "5–10", unit: "good reps", clip: clip("mu7"), added: true, src: "Dd1uX7joaM_, step 7 · DefQkYzzvfi, step 5",
        cues: ["Go up on the bar and lower slowly into a dip as you bring your feet up.", "Go over the bar as slowly as possible.", "At the bottom, rock forward and do a chest-to-bar pull-up."],
      },
      {
        name: "Put it all together", dose: "1", unit: "your very first muscle-up", clip: clip("mu8"), src: "DdRurnxIUi7, step 6 · DefQkYzzvfi",
        cues: ["Swing down and rock. On the rock back, pull the bar aggressively to your chest.", "As soon as it touches, rotate both arms at the same time, not one at a time.", "Once your elbows are over, push down and lean forward as hard as you can."],
      },
    ],
    finish: "That's how you're going to get your very first muscle-up with some momentum. As that gets easier, the next stage is your strict muscle-up.",
  },
];

// The plain $48 plan. The bonus plan (plan_260bpocwoYkFm) is only on the one-time offer page (offer.html).
export const CHECKOUT = "https://whop.com/checkout/plan_G1ImiXXj5pKK3";
