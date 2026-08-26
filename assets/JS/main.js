// Initialize GSAP with ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// =============================================
// PRELOADER
// =============================================
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloaderBar');
let loadProgress = 0;

function updatePreloader() {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress > 95) loadProgress = 95;
    if (preloaderBar) preloaderBar.style.width = loadProgress + '%';
}

const preloaderInterval = setInterval(updatePreloader, 100);

window.addEventListener('load', () => {
    clearInterval(preloaderInterval);
    if (preloaderBar) preloaderBar.style.width = '100%';

    setTimeout(() => {
        if (preloader) {
            gsap.to(preloader, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    preloader.style.display = 'none';
                    animateHeroEntrance();
                }
            });
        }
    }, 400);
});

// =============================================
// HERO ENTRANCE ANIMATION
// =============================================
function animateHeroEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.hero-badge', { opacity: 1, y: 0, scale: 1, duration: 0.6 })
      .to('.hero-title-line', { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 }, '-=0.3')
      .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('.hero-buttons', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('.hero-scroll', { opacity: 1, duration: 0.8 }, '-=0.2');
}

// =============================================
// CUSTOM CURSOR
// =============================================
const cursor = document.getElementById('customCursor');
const cursorTrail = document.getElementById('cursorTrail');
let cursorX = 0, cursorY = 0;
let trailX = 0, trailY = 0;

if (cursor && cursorTrail && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        gsap.to(cursor, { x: cursorX, y: cursorY, duration: 0.1 });
    });

    function animateTrail() {
        trailX += (cursorX - trailX) * 0.15;
        trailY += (cursorY - trailY) * 0.15;
        gsap.set(cursorTrail, { x: trailX, y: trailY });
        requestAnimationFrame(animateTrail);
    }
    animateTrail();

    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-card, .magnetic-btn');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorTrail.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorTrail.classList.remove('hover');
        });
    });
}

// =============================================
// MAGNETIC BUTTONS
// =============================================
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
});

// =============================================
// 3D TILT ON PROJECT CARDS
// =============================================
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
            rotateY: x * 15,
            rotateX: -y * 15,
            duration: 0.3,
            ease: 'power2.out',
            transformPerspective: 800
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.5)'
        });
    });
});

// =============================================
// MOBILE MENU TOGGLE
// =============================================
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// =============================================
// SMOOTH SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// =============================================
// COUNTER ANIMATION
// =============================================
const observerOptions = { threshold: 0.5 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const counter = entry.target;
            const target = parseInt(counter.getAttribute('data-target'));
            animateCounter(counter, target);
            counter.classList.add('counted');
        }
    });
}, observerOptions);

document.querySelectorAll('.counter').forEach((counter) => {
    observer.observe(counter);
});

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// =============================================
// GSAP SCROLL ANIMATIONS
// =============================================
gsap.utils.toArray('section').forEach((section) => {
    gsap.from(section, {
        scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 50,
        duration: 1,
    });
});

// Project cards stagger
gsap.utils.toArray('.project-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: index * 0.1,
    });
});

// Skill cards
gsap.utils.toArray('.skill-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        delay: index * 0.1,
    });
});

// =============================================
// SKILL TAG ANIMATION
// =============================================
gsap.utils.toArray('.skill-card').forEach(card => {
    const tags = card.querySelectorAll('.skill-tag');
    gsap.from(tags, {
        scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
        opacity: 0,
        x: -15,
        duration: 0.4,
        stagger: 0.1,
        delay: 0.3
    });
});

// =============================================
// PARALLAX SCROLL EFFECT
// =============================================
const blobs = document.querySelectorAll('.animate-blob');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    blobs.forEach((blob, i) => {
        const speed = (i + 1) * 0.15;
        blob.style.transform = `translateY(${scrollY * speed}px)`;
    });
});

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// =============================================
// SECTION DIVIDER ANIMATION
// =============================================
document.querySelectorAll('.section-divider').forEach(divider => {
    ScrollTrigger.create({
        trigger: divider,
        start: 'top 90%',
        onEnter: () => divider.classList.add('active')
    });
});

// =============================================
// SCROLL SPY
// =============================================
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove('text-cyan-400');
        link.classList.add('text-gray-300');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.remove('text-gray-300');
            link.classList.add('text-cyan-400');
        }
    });
});

// =============================================
// KEYBOARD & ACCESSIBILITY
// =============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// =============================================
// BUTTON HOVER GSAP
// =============================================
document.querySelectorAll('button, a[class*="px-8"]').forEach((button) => {
    button.addEventListener('mouseenter', function () {
        gsap.to(this, { duration: 0.3, scale: 1.05 });
    });
    button.addEventListener('mouseleave', function () {
        gsap.to(this, { duration: 0.3, scale: 1 });
    });
});

// =============================================
// MOUSE GLOW ON CTA
// =============================================
document.querySelectorAll('a[class*="bg-gradient"]').forEach((cta) => {
    cta.addEventListener('mousemove', (e) => {
        const rect = cta.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cta.style.setProperty('--mouse-x', `${x}px`);
        cta.style.setProperty('--mouse-y', `${y}px`);
    });
});

// =============================================
// DOM READY
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('section > *').forEach((el) => {
        if (!el.hasAttribute('data-reveal')) {
            el.setAttribute('data-reveal', 'true');
        }
    });
    ScrollTrigger.refresh();
});

// =============================================
// LOG
// =============================================
console.log(
    '%cWelcome to Hirusha Sandeeptha\'s Portfolio!',
    'font-size: 20px; color: #06b6d4; font-weight: bold;'
);
console.log(
    '%cCheck out the source code on GitHub: https://github.com/hirushasandeeptha/my-portfolio',
    'font-size: 14px; color: #0ea5e9;'
);
