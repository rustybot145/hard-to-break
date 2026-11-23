// Bonus landing pages (/bonus, /stretch): tells the Whop pixel about the visit and each buy click, apart from the
// sales page versions. <body data-track="waitlist_page" data-plan="plan_..."> names the page and its own Whop plan,
// so its sales are already separate in Whop. Events: view_<track>, checkout_<track>.
document.addEventListener("DOMContentLoaded", () => {
  const { track: name, plan } = document.body.dataset;
  const track = (...args) => { try { window.whop && whop.track(...args); } catch {} };
  track("view_content", { variant_id: plan });
  track(`view_${name}`);
  document.querySelectorAll('a[href^="https://whop.com/checkout/"]').forEach((a) => a.addEventListener("click", () => {
    track("initiate_checkout", { value: 48, currency: "USD", variant_id: plan });
    track(`checkout_${name}`);
  }));
});
