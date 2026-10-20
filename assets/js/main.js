/* ============================================
   MAIN — Script global partagé
   ============================================ */

// Scroll reveal — Intersection Observer
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// Ancres internes fluides
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Shared keyboard behavior for role and basket dialogs.
(function () {
  document.querySelectorAll('#role-modal-overlay, #checkout-overlay').forEach(overlay => {
    const dialog = overlay.querySelector('.modal, .checkout-modal');
    if (!dialog) return;
    dialog.tabIndex = -1;
    overlay.setAttribute('aria-hidden', 'true');
    let previousFocus, previousOverflow, opened = false;
    const inertBefore = new Map();
    function focusable() {
      return [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')]
        .filter(el => !el.disabled && el.getClientRects().length);
    }
    function sync() {
      const open = overlay.classList.contains('open');
      if (open === opened) return;
      opened = open;
      overlay.setAttribute('aria-hidden', String(!open));
      if (open) {
        previousFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
        for (const el of document.body.children) {
          if (el !== overlay && !el.contains(overlay) && !['SCRIPT', 'STYLE'].includes(el.tagName)) {
            inertBefore.set(el, el.inert); el.inert = true;
          }
        }
        document.body.style.overflow = 'hidden';
        (focusable()[0] || dialog).focus();
      } else {
        for (const [el, inert] of inertBefore) el.inert = inert;
        inertBefore.clear();
        document.body.style.overflow = previousOverflow === 'hidden' ? '' : (previousOverflow || '');
        if (previousFocus?.isConnected) previousFocus.focus();
      }
    }
    new MutationObserver(sync).observe(overlay, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', event => {
      if (!opened) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        dialog.querySelector('.modal-close, [data-dialog-close]')?.click();
      }
      if (event.key === 'Tab') {
        const elements = focusable(), first = elements[0], last = elements.at(-1);
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  });
})();
