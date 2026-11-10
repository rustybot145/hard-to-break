// One-time bonus offer between picking a skill and that skill's steps. guide.js sends them here with the skill in the
// hash (offer.html#handstand). Leaving any way except the buy button ("Skip", closing the tab, going back) marks it
// gone in this browser, and from then on they go straight to their steps. Storage is per browser: clearing site
// data or another device shows it again. guide.js skips the offer if storage fails.
const GONE = "h2b-offer";
const gone = () => { try { return localStorage.getItem(GONE) === "gone"; } catch { return false; } };
// only ever send them back to a guide hash shaped like #skill or #skill/3, never to an outside address
const next = "guide.html" + (/^#[a-z-]+(\/\d+)?$/.test(location.hash) ? location.hash : "");
if (gone()) location.replace(next);
document.querySelector("[data-skip]").href = next;

let buying = false; // going to checkout isn't leaving: they can come back from Whop with the back button
const buy = document.querySelector("[data-buy]");
buy.addEventListener("click", () => { buying = true; buy.classList.add("loading"); });
addEventListener("pagehide", () => { if (!buying) try { localStorage.setItem(GONE, "gone"); } catch {} });
addEventListener("pageshow", (e) => {
  buying = false; buy.classList.remove("loading");
  if (e.persisted && gone()) location.replace(next); // restored from the back/forward cache after leaving
});
