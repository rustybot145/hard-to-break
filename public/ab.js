// A/B/C test on the sales page. Loaded in <head> (not deferred) so the version is set before the first paint.
// Same words and colors in all three; only the format changes (styles.css, html[data-v]):
//   a: the original rows
//   b: every section a raised panel, grids, and a buy button between sections (.v-b blocks)
//   c: story order (pain, how it works, Josh, what's inside, then the price), alternating bands, a timeline
// Every page load picks a version at random (Ben: a new one on every click, not one per visitor). Preview a version
// with ?v=a / ?v=b / ?v=c.
// All three sell through the one $48 plan; each version's buttons carry utm_campaign=version-<v>, and the page
// address carries ?ab=<v> for Whop's site analytics.
const VERSIONS = ["a", "b", "c"];
(() => {
  const forced = new URLSearchParams(location.search).get("v");
  const v = VERSIONS.includes(forced) ? forced : VERSIONS[Math.floor(Math.random() * VERSIONS.length)];
  try { localStorage.removeItem("h2b-ab"); } catch {} // the old one-version-per-visitor setting
  document.documentElement.dataset.v = v;
  // label the visit with its version so analytics (the Whop pixel) can tell A, B and C apart. ?ab= doesn't force a version
  try { const u = new URL(location.href); u.searchParams.set("ab", v); history.replaceState(history.state, "", u); } catch {}
  const link = `https://whop.com/checkout/plan_G1ImiXXj5pKK3?utm_source=landing&utm_medium=ab-test&utm_campaign=version-${v}`;
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[href^="https://whop.com/checkout/plan_G1ImiXXj5pKK3"]').forEach((a) => { a.href = link; });
  });
})();
