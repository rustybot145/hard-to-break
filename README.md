# Hard 2 Break: landing page

Sales page for Josh Heald's **Hard to Break Program** ([@trainerjosh](https://www.instagram.com/trainerjosh/)), a $48 calisthenics program on Whop. Built by Truepoint Digital.

**Order:** offer → VSL → buy button → value stack → pains → method → what's inside → meet Josh → FAQ → final CTA. Every claim, number and quote comes from Josh's own reels.

## Files

```
public/
  index.html   markup, in page order
  styles.css   tokens (logo yellow on warm black) → base → sections → sticky bar → motion → breakpoints
  app.js       sticky buy bar, scroll reveals, value-stack strike-through
  fonts/       Knewave (headings, matches the logo) + Barlow / Barlow Condensed (WOFF2, SIL OFL)
  media/       logo + favicon
serve.py       local preview with byte-range support (python -m http.server stalls Safari/iPhone video)
vercel.json    static hosting from public/, strict CSP + security headers, font caching
```

- **No build step, no dependencies, no third-party scripts.** Plain HTML/CSS/JS.
- **Motion:** hero rises in on load; sections fade up on scroll (IntersectionObserver); the value stack strikes through each price, then lands the $48. All of it is off under `prefers-reduced-motion`, and the page reads fine with JS off.
- **Sticky buy bar** on phones only, between the first and last buy buttons.

## Before launch
- [x] Whop checkout: every buy button links straight to the direct plan checkout (`whop.com/checkout/plan_G1ImiXXj5pKK3`) in `index.html`, so it works even without JS.
- [ ] Add Josh's VSL to the empty `.frame` in the VSL section.
- [ ] Josh approves the copy and his bio. Nothing ships in his name without his OK.
- [ ] Refund line stays "All sales are final" (partner agreement). No fake urgency or reference prices (§9).

```
python3 serve.py 3010    # http://localhost:3010
```
