// A/B/C test on the sales page. Loaded in <head> (not deferred) so the version is set before the first paint.
// Same words and colors in all three; only the format changes (styles.css, html[data-v]):
//   a: the original rows
//   b: every section a raised panel, grids, and a buy button between sections (.v-b blocks)
//   c: story order (pain, how it works, Josh, what's inside, then the price), alternating bands, a timeline
// Each visitor gets one version at random and keeps it (localStorage). Each version's buy buttons go to its own
// Whop tracking link, so Whop reports clicks, sales and conversion per version (Dashboard > Marketing > Tracking links).
// Preview a version with ?v=a / ?v=b / ?v=c (not saved). Until a version has its tracking link, its buttons keep the
// plain checkout tagged with utm_campaign=version-<v>, which Whop records on the order.
const AB = {
  a: { checkout: "" },
  b: { checkout: "" },
  c: { checkout: "" },
};
(() => {
  const KEY = "h2b-ab", names = Object.keys(AB);
  const forced = new URLSearchParams(location.search).get("v");
  let v = names.includes(forced) ? forced : null;
  if (!v) {
    try { v = localStorage.getItem(KEY); } catch {}
    if (!names.includes(v)) {
      v = names[Math.floor(Math.random() * names.length)];
      try { localStorage.setItem(KEY, v); } catch {}
    }
  }
  document.documentElement.dataset.v = v;
  const link = AB[v].checkout || `https://whop.com/checkout/plan_G1ImiXXj5pKK3?utm_source=landing&utm_medium=ab-test&utm_campaign=version-${v}`;
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[href^="https://whop.com/checkout/plan_G1ImiXXj5pKK3"]').forEach((a) => { a.href = link; });
  });
})();
