// POST /api/waitlist {email}: adds the email to Resend as a contact (the Hard 2 Break waitlist).
// Env (Vercel project settings): RESEND_API_KEY; optional RESEND_SEGMENT_ID to file contacts under a segment;
// RESEND_FROM (an address on a domain verified in Resend) turns on the welcome email to new signups.
// Only the site itself may call it. A filled-in "company" field is a bot, so it gets a fake success.
const ALLOWED = ["https://www.hardtobreakprogram.com", "https://hardtobreakprogram.com", "https://hard-to-break.vercel.app", "http://localhost:4350"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const origin = req.headers.origin || "";
  if (!ALLOWED.includes(origin)) return res.status(403).json({ error: "Forbidden" });

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  if (body.company) return res.status(200).json({ ok: true }); // honeypot
  const email = String(body.email || "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL.test(email)) return res.status(400).json({ error: "Invalid email" });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: "Waitlist not configured" });

  const contact = { email, unsubscribed: false };
  if (process.env.RESEND_SEGMENT_ID) contact.segments = [{ id: process.env.RESEND_SEGMENT_ID }];
  try {
    const r = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    // someone joining twice is still on the list (and doesn't get the welcome email again)
    if (r.status === 409) return res.status(200).json({ ok: true });
    if (r.ok) { await welcome(key, email); return res.status(200).json({ ok: true }); }
    console.error("resend", r.status, (await r.text()).slice(0, 300));
    return res.status(502).json({ error: "Could not save" });
  } catch (e) {
    console.error("resend", e.message);
    return res.status(502).json({ error: "Could not save" });
  }
};

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }

// The welcome email, in Joshua's words. A failure here never blocks the signup.
async function welcome(key, to) {
  const from = process.env.RESEND_FROM;
  if (!from) return;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `waitlist-welcome-${to}` },
      body: JSON.stringify({ from, to: [to], reply_to: "lifeelitefit@gmail.com", subject: WELCOME.subject, text: WELCOME.text, html: WELCOME.html }),
    });
    if (!r.ok) console.error("welcome", r.status, (await r.text()).slice(0, 300));
  } catch (e) { console.error("welcome", e.message); }
}

const GUIDE = "https://www.hardtobreakprogram.com/guide";
const LINES = [
  "You're on the waitlist for the Hard to Break Program.",
  "If you've been kicking up to the wall for months, or swinging on the bar trying to get your first muscle-up, and you still don't know how many sets, how many reps or when you're ready for the next step, this is for you.",
  "The program breaks every skill into steps: the handstand, muscle-up, dragon flag, pike press, front lever and planche. Every step tells you how much to do and gives you a milestone. Hit the milestone, then move on. That way you don't injure yourself.",
  "Your bonus is locked in: my post-training stretching and rest-day mobility routines. When the program launches, I'll email you the checkout link. Check out from that email and the bonus modules are yours.",
];
const WELCOME = {
  subject: "You're on the Hard 2 Break waitlist",
  text: ["Hey,", ...LINES, `Want to start now? My free step-by-step guide: ${GUIDE}`, "Talk soon,\nTrainer Josh",
    "You're getting this because you joined the waitlist at hardtobreakprogram.com. Don't want these emails? Reply and we'll take you off the list."].join("\n\n"),
  html: `<div style="font:16px/1.6 -apple-system,Helvetica,Arial,sans-serif;color:#111;max-width:560px">
<p>Hey,</p>${LINES.map((l) => `<p>${l}</p>`).join("")}
<p>Want to start now? <a href="${GUIDE}">Get my free step-by-step guide</a>.</p>
<p>Talk soon,<br>Trainer Josh</p>
<p style="font-size:12px;color:#777;margin-top:28px">You're getting this because you joined the waitlist at hardtobreakprogram.com. Don't want these emails? Reply and we'll take you off the list.</p></div>`,
};
