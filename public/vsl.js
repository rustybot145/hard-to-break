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
