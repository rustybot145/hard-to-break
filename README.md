# Hard 2 Break

Everything online for Josh Heald's **Hard to Break Program** ([@trainerjosh](https://www.instagram.com/trainerjosh/)), a $48 calisthenics program on Whop. One repo, one Vercel project. Built by Truepoint Digital.

| Path | What it is |
|---|---|
| `/` | Sales page. Josh's promo video (bonus pitch and free-guide lines cut), A/B/C format test, Whop pixel |
| `/guide` | Free step-by-step guide (handstand, front lever, muscle-up, from his public reels only). The first skill they pick opens a one-time popup: Josh's full promo + "Get the program" (bonus checkout, no price). Clicking off it starts the guide |
| `/builder`, `/gear`, `/recovery` | Tools inside Whop (Workout Builder, Recommended Gear, Stretch Routines). Only whop.com may frame them |
| `/terms`, `/privacy` | Terms of Use and Privacy Policy |

## Files

```
public/
  index.html, styles.css, app.js   sales page (sticky buy bar, scroll reveals)
  ab.js                            A/B/C test: random version per visitor, kept in localStorage; ?v=a|b|c to preview
  vsl.js                           shared video player (sound if allowed, else muted + "Tap for sound"; front-loaded progress bar)
  whop-pixel.js                    Whop pixel, sales page only
  guide.html/.js/.css, guide-data.js   free guide
  builder.*, gear.*, recovery.*    Whop tools
  clips/                           demo clips (m*- lessons, g-* free guide from reels, dw-/r- stretch)
  media/                           logo, icon, promo videos + posters
serve.py       local preview with byte ranges (python -m http.server stalls Safari video): python3 serve.py 4350
vercel.json    clean URLs, strict CSP + security headers; t.whop.tw allowed for the pixel
```

No build step and no dependencies. Plain HTML, CSS and JS.

## Checkouts
- Sales page and free guide buttons: `whop.com/checkout/plan_G1ImiXXj5pKK3` ($48)
- Free guide popup only: `whop.com/checkout/plan_260bpocwoYkFm` ($48 + Bonus Material)

## Rules
- Nothing ships in Josh's name without his OK. Refund line stays "All sales are final". No fake urgency or reference prices (agreement §9).
- The free guide uses only his public Instagram content, never the paid lessons.
