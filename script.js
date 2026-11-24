const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroSection = document.querySelector('.hero-scroll');
const heroPhotos = [...document.querySelectorAll('.hero-slide')];
const heroCopy = document.querySelector('.hero-copy');
const siteHeader = document.querySelector('.site-header');
const sceneNumber = document.querySelector('.scene-number');
const sceneCaption = document.querySelector('.scene-caption');
const sceneCaptions = ['THE QUIET BEFORE', 'ALL YOUR PEOPLE', 'AFTER THE YES'];
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

// Give small pieces of each section their own staggered entrance as they scroll into view.
const movingDetails = document.querySelectorAll(
  'main section:not(.hero-scroll) h2, main section:not(.hero-scroll) h3, main section:not(.hero-scroll) p, main section:not(.hero-scroll) .eyebrow, main section:not(.hero-scroll) .text-link, main section:not(.hero-scroll) .button, main section:not(.hero-scroll) .intro-stats > span, main section:not(.hero-scroll) .story-caption, main section:not(.hero-scroll) .rental-item, main section:not(.hero-scroll) .quote-mark, .footer > *'
);
movingDetails.forEach((el, index) => {
  el.classList.add('motion-item');
  el.style.setProperty('--motion-delay', `${(index % 5) * 65}ms`);
});

// Full-screen wedding photographs crossfade one by one as the hero scrolls.
function moveHero() {
  if (!heroSection || reducedMotion) return;
  const bounds = heroSection.getBoundingClientRect();
  const travel = Math.max(1, bounds.height - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -bounds.top / travel));
  const framePosition = progress * (heroPhotos.length - 1);
  const currentFrame = Math.min(heroPhotos.length - 2, Math.floor(framePosition));
  const frameProgress = framePosition - currentFrame;
  const eased = frameProgress * frameProgress * (3 - 2 * frameProgress);

  heroPhotos.forEach((photo, index) => {
    let opacity = 0;
    let verticalOffset = 5;
    if (index === currentFrame) {
      opacity = 1 - eased;
      verticalOffset = -eased * 4;
    } else if (index === currentFrame + 1) {
      opacity = eased;
      verticalOffset = (1 - eased) * 5;
    }
    photo.style.opacity = String(opacity);
    photo.style.transform = `scale(${1.07 - opacity * 0.03}) translateY(${verticalOffset}%)`;
  });

  const captionIndex = Math.min(sceneCaptions.length - 1, Math.round(framePosition));
  sceneNumber.textContent = `0${captionIndex + 1} / 0${sceneCaptions.length}`;
  sceneCaption.textContent = sceneCaptions[captionIndex];
  heroCopy.style.transform = `translateY(calc(-41% + ${progress * -35}px))`;
  const edge = document.querySelector('.hero-edge');
  edge.style.clipPath = `polygon(0 ${38 + progress * 9}%,4% ${48 - progress * 5}%,8% ${30 + progress * 7}%,13% ${42 - progress * 8}%,19% ${25 + progress * 7}%,24% ${42 - progress * 7}%,29% ${21 + progress * 8}%,34% ${39 - progress * 6}%,40% ${31 + progress * 8}%,46% ${53 - progress * 9}%,51% ${30 + progress * 8}%,57% ${48 - progress * 6}%,63% ${26 + progress * 7}%,68% ${41 - progress * 5}%,74% ${20 + progress * 8}%,80% ${39 - progress * 8}%,86% ${29 + progress * 7}%,92% ${45 - progress * 7}%,97% ${24 + progress * 8}%,100% ${36 - progress * 4}%,100% 100%,0 100%)`;
}
let ticking = false;
window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 35);
  if (!ticking) {
    window.requestAnimationFrame(() => { moveHero(); ticking = false; });
    ticking = true;
  }
}, { passive: true });
siteHeader.classList.toggle('is-scrolled', window.scrollY > 35);
moveHero();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .motion-item').forEach(el => revealObserver.observe(el));

menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const mobileSections = [...navigation.querySelectorAll('a')]
  .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(item => item.section);
if (window.matchMedia('(max-width: 760px)').matches && mobileSections.length) {
  mobileSections[0].link.setAttribute('aria-current', 'location');
}
const activeSectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const current = mobileSections.find(item => item.section === entry.target);
    if (!current) return;
    mobileSections.forEach(item => item.link.removeAttribute('aria-current'));
    current.link.setAttribute('aria-current', 'location');
  });
}, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
mobileSections.forEach(item => activeSectionObserver.observe(item.section));
