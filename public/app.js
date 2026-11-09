const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window;

// Buy buttons: Whop's checkout takes a few seconds to load, so react the instant they're tapped.
const buyButtons = document.querySelectorAll('a[href^="https://whop.com/checkout/"]');
buyButtons.forEach((a) => a.addEventListener("click", () => a.classList.add("loading")));
addEventListener("pageshow", () => buyButtons.forEach((a) => a.classList.remove("loading"))); // back button restores the page

// Josh's video. It tries to start with sound; browsers refuse that for most first visits, so it falls back to
// playing muted with "Tap for sound" (tap the button or the video to restart it with sound). Safari can refuse even
// the muted start, so that retries on load, visibility, back/forward and the first touch. No native controls: the bar
// at the bottom runs fast early and slows near the end (it still lands on 100% exactly when the video ends).
const vsl = document.querySelector("[data-vsl]"), btn = document.querySelector("[data-sound]"), fill = document.querySelector("[data-vbar]");
if (vsl) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const label = btn.querySelector("span");
  const say = (text) => { label.textContent = text; btn.hidden = !text; };
  const shown = (x) => 1 - Math.pow(1 - x, 3.5); // 10% watched shows ~31%, a quarter ~64%, half ~91%
  const draw = () => {
    const x = vsl.duration ? Math.min(vsl.currentTime / vsl.duration, 1) : 0;
    fill.style.transform = `scaleX(${shown(x)})`;
    if (!vsl.paused) requestAnimationFrame(draw);
  };
  vsl.addEventListener("play", () => requestAnimationFrame(draw));
  vsl.addEventListener("seeked", draw);
  vsl.addEventListener("ended", () => { draw(); say("Watch again"); });
  vsl.addEventListener("pause", () => { if (!vsl.muted && !vsl.ended) say("Tap to play"); });
  vsl.addEventListener("playing", () => { if (!vsl.muted) say(""); });

  const muted = () => { vsl.muted = true; vsl.loop = true; say("Tap for sound"); if (!still && !document.hidden) vsl.play().catch(() => {}); };
  const withSound = (restart) => {
    if (restart) vsl.currentTime = 0;
    vsl.muted = false; vsl.loop = false;
    return vsl.play().then(() => say(""));
  };
  if (still) say("Tap to play");
  else withSound(false).catch(muted); // a refused start with sound drops to the muted preview

  const nudge = () => { if (vsl.muted && vsl.paused && !still && !document.hidden) vsl.play().catch(() => {}); };
  ["loadeddata", "canplay"].forEach((ev) => vsl.addEventListener(ev, nudge));
  document.addEventListener("visibilitychange", nudge);
  addEventListener("pageshow", nudge);
  addEventListener("pointerdown", nudge, { once: true, passive: true });

  // a tap is a user gesture, so sound is always allowed here
  const tap = () => {
    if (vsl.muted || vsl.ended) withSound(true).catch(() => {});
    else if (vsl.paused) vsl.play().catch(() => {});
    else vsl.pause();
  };
  btn.addEventListener("click", (e) => { e.stopPropagation(); tap(); });
  vsl.addEventListener("click", tap);
}

// Sticky buy bar (phones): show once the main button scrolls away, hide again at the final call to action.
const sticky = document.querySelector(".sticky");
const buy = document.querySelector(".buy .cta"), last = document.querySelector(".final .cta");
const syncSticky = () => sticky.classList.toggle("show",
  buy.getBoundingClientRect().bottom < 0 && last.getBoundingClientRect().top > innerHeight);
addEventListener("scroll", syncSticky, { passive: true });
syncSticky(); // a reload can land mid-page

// Scroll reveals: each section's pieces fade up as they come into view, rows cascading one after another.
if (motion) {
  const reveal = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add("in"); reveal.unobserve(el);
    // once its own rise finishes, hand transitions back to the element (buttons keep their hover motion);
    // children's transitions bubble up here too, so only listen for this element's transform
    el.addEventListener("transitionend", function done(t) {
      if (t.target !== el || t.propertyName !== "transform") return;
      el.removeEventListener("transitionend", done);
      el.classList.remove("reveal", "in"); el.style.transitionDelay = "";
    });
  }), { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll(".stack > *:not(ul), .ledger li, .block .eyebrow, .block h2, .rows > *, .note, .josh div > p, details, .final > *, footer > *")
    .forEach((el) => {
      el.classList.add("reveal");
      el.style.transitionDelay = Math.min([...el.parentElement.children].indexOf(el), 6) * 80 + "ms";
      reveal.observe(el);
    });
}

// Value stack: once it's well in view, strike through each $20 one after another, then the $120, then land the $48.
if (motion) {
  const stack = document.querySelector(".stack");
  const strikes = [...stack.querySelectorAll(".ledger s, .sum s")];
  stack.classList.add("armed");
  strikes.forEach((s, i) => s.style.setProperty("--d", 0.35 + i * 0.16 + "s"));
  stack.querySelector(".total b").style.setProperty("--d", 0.35 + strikes.length * 0.16 + 0.15 + "s");
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { stack.classList.add("go"); io.disconnect(); }
  }, { threshold: 0.35 }).observe(stack.querySelector(".ledger"));
}
