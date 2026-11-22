// /bonus (waitlist page): tells the Whop pixel about the visit and each buy click, apart from the sales page versions.
// Sales from this page land on its own plan (plan_260bpocwoYkFm), so its revenue is already separate in Whop.
document.addEventListener("DOMContentLoaded", () => {
  const track = (...args) => { try { window.whop && whop.track(...args); } catch {} };
  track("view_content", { variant_id: "plan_260bpocwoYkFm" });
  track("view_waitlist_page");
  document.querySelectorAll('a[href^="https://whop.com/checkout/"]').forEach((a) => a.addEventListener("click", () => {
    track("initiate_checkout", { value: 48, currency: "USD", variant_id: "plan_260bpocwoYkFm" });
    track("checkout_waitlist_page");
  }));
});
