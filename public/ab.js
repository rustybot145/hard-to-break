// A/B/C offer test on the sales page. Loaded in <head> (not deferred) so the version is set before the first paint.
// Each version has its own offer at the top (index.html .o-a/.o-b/.o-c) and its own section order under the video
// (home.css html[data-offer]): a = price, comments, Josh; b = comments, price, Josh; c = Josh, comments, price.
//   a: wasted time ("Still wasting months on random tutorials?")
//   b: adult beginner at home ("Get strong at home, one safe step at a time"; no gray lead-in line)
//   c: first skill ("Every step to your first muscle-up, handstand or front lever"; no gray lead-in line)
// Every page load picks a version at random (Ben: a new one on every click). Preview one with ?v=a / ?v=b / ?v=c.
// Revenue per version: each version's buy buttons go to its own $48 Whop plan, so every sale lands on that plan.
// Visits per version: the Whop pixel gets view_offer_<v> on load and checkout_offer_<v> on each buy click.
const OFFER_PLANS = { a: "plan_G1ImiXXj5pKK3", b: "plan_XE3wUg9Vllrij", c: "plan_a370qzXkSucj8" };
(() => {
  const forced = new URLSearchParams(location.search).get("v");
  const v = forced in OFFER_PLANS ? forced : "abc"[Math.floor(Math.random() * 3)];
  document.documentElement.dataset.offer = v;
  // label the address with the version before the pixel's page view fires, so Whop > Websites can tell A, B and C apart
  // (?offer= is only a label; ?v= is what forces a version)
  try { const u = new URL(location.href); u.searchParams.set("offer", v); history.replaceState(history.state, "", u); } catch {}
  const plan = OFFER_PLANS[v], link = `https://whop.com/checkout/${plan}`;
  const track = (...args) => { try { window.whop && whop.track(...args); } catch {} };
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[href^="https://whop.com/checkout/"]').forEach((a) => {
      a.href = link;
      a.addEventListener("click", () => {
        track("initiate_checkout", { value: 48, currency: "USD", variant_id: plan });
        track(`checkout_offer_${v}`);
      });
    });
    track("view_content", { variant_id: plan });
    track(`view_offer_${v}`);
  });
})();
