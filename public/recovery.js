// Stretch & Mobility: switch routines, and play Joshua's clip for a step.
const $ = (s) => document.querySelector(s);
for (const tab of document.querySelectorAll("[data-tab]")) {
  tab.addEventListener("click", () => {
    for (const t of document.querySelectorAll("[data-tab]")) t.setAttribute("aria-selected", t === tab);
    for (const r of document.querySelectorAll("[data-routine]")) r.hidden = r.dataset.routine !== tab.dataset.tab;
  });
}
const player = $("[data-player]"), video = $("[data-video]");
for (const b of document.querySelectorAll("[data-clip]")) {
  b.addEventListener("click", () => {
    video.poster = `clips/${b.dataset.clip}.jpg`;
    video.src = `clips/${b.dataset.clip}.mp4`;
    video.play().catch(() => {});
    $("[data-name]").textContent = b.closest("li").querySelector("b").textContent;
    player.showModal();
  });
}
$("[data-close]").addEventListener("click", () => player.close());
player.addEventListener("click", (e) => { if (e.target === player) player.close(); });
player.addEventListener("close", () => { video.pause(); video.removeAttribute("src"); video.load(); });
