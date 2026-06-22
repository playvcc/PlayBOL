// BO2 League — Main JS

document.addEventListener('DOMContentLoaded', () => {

  // === NAV SCROLL STATE ===
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // === HAMBURGER ===
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      navMobile.classList.toggle('open');
    });
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMobile.classList.remove('open'));
    });
  }

  // === SMOOTH SCROLL for anchor links ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // === INTERSECTION OBSERVER — Fade in sections ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step, .feature-card, .tier-card, .mode-card, .match-card').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  // === LEADERBOARD FILTERS ===
  const filterBtns = document.querySelectorAll('.lb-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // In a real league, this would filter via API/data
    });
  });

  // === RULES NAV ACTIVE STATE ===
  const rulesNavLinks = document.querySelectorAll('.rules-nav a');
  const rulesHeadings = document.querySelectorAll('.rules-content h2[id]');
  if (rulesHeadings.length) {
    const rulesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          rulesNavLinks.forEach(link => link.classList.remove('active'));
          const activeLink = document.querySelector(`.rules-nav a[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' });
    rulesHeadings.forEach(h => rulesObserver.observe(h));
  }

});

// === CSS FADE-IN via JS ===
const style = document.createElement('style');
style.textContent = `
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fade-in.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
