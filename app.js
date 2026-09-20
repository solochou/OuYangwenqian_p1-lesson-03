// 本课小交互：
// 1. 滚动时高亮当前栏目（不依赖点击锚点）。
// 2. 页面滚动后给 header 加上 is-scrolled 状态，加强阴影。

const navLinks = document.querySelectorAll('nav a');
const header = document.querySelector('.site-header');
const sections = Array.from(document.querySelectorAll('main section[id]'));
const linkByHash = new Map();
navLinks.forEach(function (link) {
  linkByHash.set(link.getAttribute('href'), link);
});

// 1. 滚动高亮：用 IntersectionObserver 观察每个栏目，进入视口最多的那个被选中。
function setCurrent(hash) {
  navLinks.forEach(function (link) {
    const isCurrent = link.getAttribute('href') === hash;
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

let currentHash = '';
const visibility = new Map();

if ('IntersectionObserver' in window && sections.length) {
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      visibility.set(entry.target.id, entry.intersectionRatio);
    });
    // 选出当前可见比例最大的栏目；hero (#about) 永远至少占 1 份作为兜底。
    let bestId = currentHash.replace('#', '') || 'about';
    let bestRatio = visibility.get(bestId) || 0;
    visibility.forEach(function (ratio, id) {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    });
    if (bestId && '#' + bestId !== currentHash) {
      currentHash = '#' + bestId;
      setCurrent(currentHash);
    }
  }, {
    rootMargin: '-30% 0px -55% 0px',
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  });
  sections.forEach(function (section) { io.observe(section); });
}

// 点击锚点时立即把选中状态切到目标栏目，避免滚动期间出现闪烁。
window.addEventListener('hashchange', function () {
  currentHash = window.location.hash || '#about';
  setCurrent(currentHash);
});
setCurrent(window.location.hash || '#about');

// 2. header 滚动状态：滚过 hero 后加强阴影与边框。
function updateHeaderState() {
  if (!header) return;
  const scrolled = window.scrollY > 24;
  header.classList.toggle('is-scrolled', scrolled);
}
window.addEventListener('scroll', updateHeaderState, { passive: true });
updateHeaderState();
