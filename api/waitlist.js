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

// The welcome email, in Joshua's words. Plain text, no links, no images: it reads like a personal note, which keeps it out of
// Gmail's Promotions tab. Asking for a reply helps too: once they reply, his launch email lands in Primary. A failure never blocks the signup.
async function welcome(key, to) {
  const from = process.env.RESEND_FROM;
  if (!from) return;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `waitlist-welcome-${to}` },
      body: JSON.stringify({ from, to: [to], reply_to: "lifeelitefit@gmail.com", subject: "You're on the list", text: WELCOME }),
    });
    if (!r.ok) console.error("welcome", r.status, (await r.text()).slice(0, 300));
  } catch (e) { console.error("welcome", e.message); }
}

const WELCOME = `Hey,

You're on the Hard to Break waitlist.

Most people stay stuck on the same skill for months because they're guessing: how many sets, how many reps, when to move on.

The program fixes that. Every skill is broken into steps, and every step tells you exactly how much to do and when you're ready for the next one.

Your bonus stretching and mobility routines are locked in. I'll email you the checkout when it launches.

Which skill are you going after? Hit reply and let me know.

Trainer Josh

(Don't want these emails? Reply "stop".)`;
