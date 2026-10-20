/* Intro splash: the animation itself is pure CSS (starts on first paint);
 * this adds the embers and hides the splash after the show, or on click / any key. */
(function () {
  'use strict';
  const splash = document.getElementById('splash');
  if (!splash) return;
  const SHOW_MS = 4200;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const embers = splash.querySelector('.splash-embers');
  if (!reduced) {
    for (let i = 0; i < 26; i++) {
      const e = document.createElement('i');
      e.style.left = (Math.random() * 100).toFixed(1) + '%';
      e.style.animationDelay = (1 + Math.random() * 2.4).toFixed(2) + 's';
      e.style.animationDuration = (2 + Math.random() * 1.8).toFixed(2) + 's';
      e.style.setProperty('--dx', ((Math.random() - .5) * 160).toFixed(0) + 'px');
      if (Math.random() < .4) { e.style.width = e.style.height = '3px'; }
      embers.appendChild(e);
    }
  }

  let done = false;
  function leave(e) {
    if (e && e.type === 'keydown') e.preventDefault();   // e.g. Space would also scroll the page
    if (done) return;
    done = true;
    splash.classList.add('leaving');
    document.body.classList.remove('intro');
    setTimeout(() => splash.remove(), 850);
    document.removeEventListener('keydown', leave);
  }
  splash.addEventListener('click', leave);
  document.addEventListener('keydown', leave);
  setTimeout(leave, reduced ? 1200 : SHOW_MS);
})();
