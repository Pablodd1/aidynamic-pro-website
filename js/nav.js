/**
 * AIDynamic.pro — Shared Navigation Utilities
 * Mobile nav toggle, scroll effects, auth nav styles injection
 */

(function() {
  'use strict';

  // ── Inject shared auth nav styles ──
  function injectAuthStyles() {
    if (document.getElementById('aidynamic-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'aidynamic-nav-styles';
    style.textContent = `
      /* Auth nav dropdown (custom CSS pages) */
      .nav-auth-dropdown { position: relative; }
      .nav-auth-dropdown:hover .nav-auth-menu,
      .nav-auth-dropdown:focus-within .nav-auth-menu { display: block !important; }

      /* Mobile nav */
      @media (max-width: 768px) {
        .nav-auth-name { display: none !important; }
      }

      /* Nav auth container */
      #nav-auth {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Mobile nav toggle for custom CSS pages ──
  function initMobileNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    // Only add mobile toggle if nav-links exist and no toggle already present
    const existingToggle = nav.querySelector('.nav-mobile-toggle');
    if (existingToggle) return;

    const navLinks = nav.querySelector('.nav-links');
    if (!navLinks) return;

    // Create mobile toggle button
    const toggle = document.createElement('button');
    toggle.className = 'nav-mobile-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12h18M3 6h18M3 18h18"/>
      </svg>
    `;
    toggle.style.cssText = 'display:none;background:none;border:none;color:var(--text-secondary);cursor:pointer;padding:0.5rem;';

    // Insert before nav-links
    navLinks.parentNode.insertBefore(toggle, navLinks);

    // Toggle handler
    let mobileOpen = false;
    toggle.addEventListener('click', () => {
      mobileOpen = !mobileOpen;
      navLinks.style.cssText = mobileOpen
        ? 'position:absolute;top:100%;left:0;right:0;background:rgba(10,14,26,0.98);border-top:1px solid rgba(59,130,246,0.1);padding:1rem 2rem;display:flex;flex-direction:column;gap:1rem;z-index:999;'
        : '';
      if (!mobileOpen) {
        navLinks.style.display = '';
        navLinks.style.position = '';
        navLinks.style.top = '';
        navLinks.style.left = '';
        navLinks.style.right = '';
        navLinks.style.background = '';
        navLinks.style.borderTop = '';
        navLinks.style.padding = '';
        navLinks.style.flexDirection = '';
        navLinks.style.gap = '';
        navLinks.style.zIndex = '';
      }
    });

    // Show toggle on mobile via CSS
    const mobileStyle = document.createElement('style');
    mobileStyle.textContent = `
      @media (max-width: 768px) {
        .nav-mobile-toggle { display: block !important; }
        .nav-links {
          display: none;
        }
        .nav-links[style*="flex-direction"] {
          display: flex !important;
        }
      }
    `;
    document.head.appendChild(mobileStyle);
  }

  // ── Scroll effect for nav ──
  function initScrollEffect() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // ── Initialize ──
  document.addEventListener('DOMContentLoaded', () => {
    injectAuthStyles();
    initMobileNav();
    initScrollEffect();
  });
})();
