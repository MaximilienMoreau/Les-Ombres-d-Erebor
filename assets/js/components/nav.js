/* ============================================
   NAV — Navigation comportement
   ============================================ */

(function initNav() {
  const nav      = document.querySelector('.nav');
  const toggle   = document.querySelector('.nav-toggle');
  const drawer   = document.querySelector('.nav-mobile-drawer');
  const links    = document.querySelectorAll('.nav-links a, .nav-mobile-drawer a');

  // Scroll → apparence
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Toggle mobile
  if (toggle && drawer) {
    toggle.setAttribute('aria-expanded', 'false');
    function closeDrawer() {
      toggle.classList.remove('open'); drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
    }
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && drawer.classList.contains('open')) { closeDrawer(); toggle.focus(); } });
    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      drawer.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Fermer si clic extérieur
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        closeDrawer();
      }
    });
  }

  // Lien actif
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();
