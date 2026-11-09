const motion = !matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window;

// Buy buttons: Whop's checkout takes a few seconds to load, so react the instant they're tapped.
const buyButtons = document.querySelectorAll('a[href^="https://whop.com/checkout/"]');
buyButtons.forEach((a) => a.addEventListener("click", () => a.classList.add("loading")));
addEventListener("pageshow", () => buyButtons.forEach((a) => a.classList.remove("loading"))); // back button restores the page

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
