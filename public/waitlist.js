// Waitlist page: every "Join the waitlist" button opens one box that asks for an email. On success it shows the
// bonus reward. The email goes to /api/waitlist, which saves it as a contact in Resend.
const box = document.querySelector("[data-join-box]"), form = document.querySelector("[data-join-form]");
const done = document.querySelector("[data-join-done]"), err = document.querySelector("[data-join-error]");
const submit = form.querySelector('button[type="submit"]'), email = form.elements.email;
const JOINED = "h2b-waitlist"; // remembered so a returning visitor sees "you're on the list"

const joined = () => { try { return localStorage.getItem(JOINED) === "1"; } catch { return false; } };
const markJoined = () => document.querySelectorAll("[data-join]").forEach((a) => { a.textContent = "Joined waitlist"; a.classList.add("joined"); });
if (joined()) markJoined();
const show = (isDone) => { form.hidden = isDone; done.hidden = !isDone; };
const fail = (text) => { err.textContent = text; err.hidden = false; submit.disabled = false; submit.textContent = "Join the waitlist"; };

document.querySelectorAll("[data-join]").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  show(joined()); err.hidden = true;
  box.showModal();
  if (!joined()) email.focus();
}));
document.querySelectorAll("[data-join-close]").forEach((b) => b.addEventListener("click", () => box.close()));
box.addEventListener("click", (e) => { if (e.target === box) box.close(); }); // a click off the box

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  err.hidden = true;
  const value = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return fail("Enter a valid email address.");
  submit.disabled = true; submit.textContent = "Joining…";
  try {
    const r = await fetch("/api/waitlist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value, company: form.elements.company.value }),
    });
    if (!r.ok) throw new Error(String(r.status));
    try { localStorage.setItem(JOINED, "1"); } catch {}
    markJoined();
    show(true);
  } catch {
    fail("Something went wrong. Try again in a minute.");
  }
});
