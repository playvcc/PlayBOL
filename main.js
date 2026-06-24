// BO2 League v2 — main.js
// Handles: nav scroll, hamburger, sub-nav active state, toasts, modals, auth state

document.addEventListener('DOMContentLoaded', () => {

  /* ── Nav scroll ── */
  const topNav = document.getElementById('top-nav');
  window.addEventListener('scroll', () => {
    topNav && topNav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Hamburger / mobile drawer ── */
  const hamburger = document.getElementById('hamburger-btn');
  const drawer    = document.getElementById('mobile-drawer');
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  /* ── Sub-nav active state ── */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sub-nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
  document.querySelectorAll('.drawer-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Smooth scroll anchors ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Fade-in on scroll ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.step-card,.feat-card,.tier-card,.mode-card,.match-card,.announce-card').forEach(el => {
    el.classList.add('fade-in');
    io.observe(el);
  });

  /* ── Auth UI ── */
  initAuth();
});

/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container') || (() => {
    const c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
    return c;
  })();
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}
window.showToast = showToast;

/* ════════════════════════════════════
   MODAL HELPERS
════════════════════════════════════ */
function openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }
window.openModal  = openModal;
window.closeModal = closeModal;

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
  if (e.target.classList.contains('modal-close')) {
    e.target.closest('.modal-overlay')?.classList.remove('open');
  }
});

/* ════════════════════════════════════
   AUTH — Supabase login / logout
════════════════════════════════════ */
async function initAuth() {
  if (typeof sb === 'undefined') return; // Supabase not configured yet

  const { data: { session } } = await sb.auth.getSession();
  updateAuthUI(session?.user ?? null);

  sb.auth.onAuthStateChange((_event, session) => {
    updateAuthUI(session?.user ?? null);
  });

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const btn      = loginForm.querySelector('button[type="submit"]');
      btn.disabled   = true; btn.textContent = 'Signing in…';
      const { error } = await sb.auth.signInWithPassword({ email, password });
      btn.disabled = false; btn.textContent = 'Sign In';
      if (error) { showToast(error.message, 'error'); }
      else        { closeModal('login-modal'); showToast('Welcome back, Admin!', 'success'); }
    });
  }

  // Logout button
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await sb.auth.signOut();
    showToast('Signed out.', 'info');
  });
}

function updateAuthUI(user) {
  const loginBtn     = document.getElementById('login-btn');
  const logoutBtn    = document.getElementById('logout-btn');
  const adminBadge   = document.getElementById('admin-badge');
  const adminLinks   = document.querySelectorAll('.admin-only');

  if (user) {
    loginBtn   && (loginBtn.style.display   = 'none');
    logoutBtn  && (logoutBtn.style.display  = 'inline-flex');
    adminBadge && (adminBadge.style.display = 'inline-flex');
    adminLinks.forEach(el => el.style.display = '');
  } else {
    loginBtn   && (loginBtn.style.display   = 'inline-flex');
    logoutBtn  && (logoutBtn.style.display  = 'none');
    adminBadge && (adminBadge.style.display = 'none');
    adminLinks.forEach(el => el.style.display = 'none');
  }
}
window.updateAuthUI = updateAuthUI;

/* Fade-in CSS injected */
const s = document.createElement('style');
s.textContent = `.fade-in{opacity:0;transform:translateY(18px);transition:opacity .45s ease,transform .45s ease}.fade-in.visible{opacity:1;transform:none}`;
document.head.appendChild(s);
