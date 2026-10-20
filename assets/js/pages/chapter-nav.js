/* Keep chapter links, deep links and the current section aligned with the language. */
(function () {
  const links = [...document.querySelectorAll('.chapter-nav-list a')];
  if (!links.length) return;
  const bases = links.map(link => decodeURIComponent(link.hash.slice(1)).replace(/-en$/, ''));
  let active = bases[0], frame, started = false;
  const offset = () => (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72) + 24;
  function target(base) {
    return (document.documentElement.lang === 'en' && document.getElementById(base + '-en')) || document.getElementById(base);
  }
  function select(base) {
    active = base;
    links.forEach((link, index) => {
      const current = bases[index] === base;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function follow() {
    frame = null;
    const visible = bases.map(base => ({ base, element: target(base) })).filter(({ element }) => element?.getClientRects().length);
    if (!visible.length) return;
    let current = visible[0].base;
    for (const { base, element } of visible) {
      if (element.getBoundingClientRect().top <= offset() + 8) current = base;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = visible.at(-1).base;
    select(current);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(follow); }
  function jump(base, focus = false) {
    const element = target(base);
    if (!element) return;
    select(base);
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - offset(), behavior: 'instant' });
    if (focus) { element.tabIndex = -1; element.focus({ preventScroll: true }); }
  }
  function updateLanguage(initial = false) {
    const previous = active;
    links.forEach((link, index) => { link.setAttribute('href', '#' + (target(bases[index])?.id || bases[index])); });
    const hash = decodeURIComponent(location.hash.slice(1)).replace(/-en$/, '');
    const base = initial && bases.includes(hash) ? hash : previous;
    const content = document.querySelector('.rules-content');
    if ((initial && bases.includes(hash)) || (!initial && content && window.scrollY >= content.offsetTop - offset())) {
      select(base);
      history.replaceState(null, '', '#' + target(base).id);
      requestAnimationFrame(() => jump(base));
    } else schedule();
  }
  links.forEach((link, index) => link.addEventListener('click', () => select(bases[index])));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', () => {
    const base = decodeURIComponent(location.hash.slice(1)).replace(/-en$/, '');
    if (bases.includes(base)) jump(base, true);
  });
  document.addEventListener('langchange', () => { if (started) updateLanguage(); });
  const start = () => { started = true; updateLanguage(true); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
