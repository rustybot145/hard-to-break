// One-time bonus offer before the free guide. Leaving the page any way except the buy button (the "No thanks"
// link, closing the tab, going back) marks it gone in this browser; after that, offer and guide.js both skip it.
// Storage is per browser: clearing site data or another device shows it again. guide.js skips the offer if storage fails.
const GONE = "h2b-offer";
const gone = () => { try { return localStorage.getItem(GONE) === "gone"; } catch { return false; } };
if (gone()) location.replace("guide.html");

let buying = false; // going to checkout isn't leaving: they can come back from Whop with the back button
const buy = document.querySelector("[data-buy]");
buy.addEventListener("click", () => { buying = true; buy.classList.add("loading"); });
addEventListener("pagehide", () => { if (!buying) try { localStorage.setItem(GONE, "gone"); } catch {} });
addEventListener("pageshow", (e) => {
  buying = false; buy.classList.remove("loading");
  if (e.persisted && gone()) location.replace("guide.html"); // restored from the back/forward cache after leaving
});
