// In-app browsers that won't play video inside the page (TikTok on iPhone and similar) throw every play() into a fullscreen
// player. window.H2B_NOINLINE tells vsl.js and guide.js to never start a video on their own there, only on a tap.
// It's set from the user agent (iPhone in-app browsers other than Instagram/Facebook, plus TikTok anywhere) and, as a
// safety net, the moment any video goes fullscreen without being tapped: that one is closed and the page switches over.
(() => {
  const ua = navigator.userAgent;
  const iosInApp = /iPhone|iPad|iPod/.test(ua) && !/Safari\//.test(ua) && !/Instagram|FBAN|FBAV/.test(ua);
  let flag = false;
  try { flag = sessionStorage.getItem("h2b-noinline") === "1"; } catch {}
  window.H2B_NOINLINE = flag || iosInApp || /BytedanceWebview|musical_ly|TikTok|trill_/i.test(ua);
  document.addEventListener("webkitbeginfullscreen", (e) => {
    const v = e.target;
    if (v.dataset.userPlay) return; // they tapped it: fullscreen is what they asked for
    try { v.webkitExitFullscreen(); } catch {}
    v.pause();
    if (window.H2B_NOINLINE) return;
    window.H2B_NOINLINE = true;
    try { sessionStorage.setItem("h2b-noinline", "1"); } catch {}
    dispatchEvent(new Event("h2b-noinline"));
  }, true);
})();
