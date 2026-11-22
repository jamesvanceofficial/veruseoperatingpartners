/* Isolated visual prototype. No API requests, data writes, or app imports. */
(() => {
  const area = document.querySelector('.route-area');
  const svg = document.querySelector('.route-svg');
  const base = document.querySelector('.course-base');
  const progress = document.querySelector('.course-progress');
  const chapters = [...document.querySelectorAll('.chapter')];
  const navigation = [...document.querySelectorAll('.chapter-nav a')];
  const strip = document.querySelector('.destination-strip');
  const pins = [...document.querySelectorAll('.route-pin')];
  let points = [];
  let length = 0;
  let ticking = false;
  function drawCourse() {
    const bounds = area.getBoundingClientRect();
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    points = pins.map(pin => {
      const b = pin.getBoundingClientRect();
      return {x: b.left + b.width / 2 - bounds.left, y: b.top + b.height / 2 - bounds.top};
    });
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      if (mobile || Math.abs(a.x - b.x) < 5) {
        d += ` L ${b.x} ${b.y}`;
      } else {
        const gap = i === points.length - 1 ? 60 : 92;
        const bend = b.y - gap;
        d += ` L ${a.x} ${bend - 20} C ${a.x} ${bend + 30}, ${b.x} ${bend - 35}, ${b.x} ${b.y}`;
      }
    }
    base.setAttribute('d', d);
    progress.setAttribute('d', d);
    length = base.getTotalLength();
    progress.style.strokeDasharray = `${length}`;
    updateReading();
  }
  function updateReading() {
    if (!length) { ticking = false; return; }
    const boundary = strip.getBoundingClientRect().height + window.innerHeight * .25;
    let current = 0;
    chapters.forEach((chapter, i) => {if(chapter.getBoundingClientRect().top <= boundary) current = i;});
    navigation.forEach((link, i) => {
      link.classList.toggle('active', i === current);
      if(i === current) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
    });
    document.querySelector('#current-chapter').textContent = chapters[current].dataset.chapter;
    const bounds = area.getBoundingClientRect();
    const distance = Math.max(0, Math.min(bounds.height, boundary - bounds.top));
    // Match path length to the reader's vertical position, including its curves.
    let low = 0, high = length;
    for(let i = 0; i < 15; i++) {
      const mid = (low + high) / 2;
      if(base.getPointAtLength(mid).y < distance) low = mid; else high = mid;
    }
    progress.style.strokeDashoffset = `${length - low}`;
    document.querySelector('.reading-progress>div').style.width = `${Math.max(0, Math.min(100, distance / bounds.height * 100))}%`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {if(!ticking){ticking = true; requestAnimationFrame(updateReading);}}, {passive:true});
  new ResizeObserver(drawCourse).observe(area);
  document.fonts.ready.then(drawCourse);
  window.addEventListener('load', drawCourse);
  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    menu.hidden = open;
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {menu.hidden = true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open menu');}));
  const dialog = document.querySelector('dialog');
  document.querySelector('[data-open-scan]').addEventListener('click', e => {e.preventDefault();dialog.showModal();});
  dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', e => {if(e.target === dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
})();
