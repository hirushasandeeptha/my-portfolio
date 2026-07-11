// Initialize GSAP with ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Smooth scroll for navigation links
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

// Counter animation for stats
const observerOptions = {
    threshold: 0.5,
};

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

// Animate elements on scroll using GSAP
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

// Animate project cards with stagger
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

// Animate skill cards
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

// Parallax effect for background elements
window.addEventListener('mousemove', (e) => {
    const blobs = document.querySelectorAll('.animate-blob');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    blobs.forEach((blob) => {
        blob.style.transform = `translate(${x * 50}px, ${y * 50}px)`;
    });
});

// Add scroll spy for navigation
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
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

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
});

// Add hover effect for buttons
document.querySelectorAll('button, a[class*="px-8"]').forEach((button) => {
    button.addEventListener('mouseenter', function () {
        gsap.to(this, {
            duration: 0.3,
            scale: 1.05,
        });
    });

    button.addEventListener('mouseleave', function () {
        gsap.to(this, {
            duration: 0.3,
            scale: 1,
        });
    });
});

// Intersection Observer for lazy animations
const revealElements = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            gsap.to(entry.target, {
                duration: 0.8,
                opacity: 1,
                y: 0,
            });
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach((element) => {
    revealObserver.observe(element);
});

// Add loading animation
window.addEventListener('load', () => {
    gsap.to('body', {
        duration: 0.5,
        opacity: 1,
    });
});

// Prevent layout shift with loading state
if (document.readyState === 'loading') {
    document.body.style.opacity = '0';
}

// Add smooth page transitions
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link && link.getAttribute('href') !== '#') {
        // Smooth scroll is handled by browser
    }
});

// Theme detection and application
function getPreferredTheme() {
    return 'dark'; // Always use dark theme for this portfolio
}

// Initialize theme
const theme = getPreferredTheme();
document.documentElement.setAttribute('data-theme', theme);

// Performance optimization: Use requestAnimationFrame for animations
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Scroll-based animations are handled by GSAP and ScrollTrigger
            ticking = false;
        });
        ticking = true;
    }
});

// Add animation to text on page load
gsap.from('h1', {
    duration: 1,
    opacity: 0,
    y: -30,
});

gsap.from('p', {
    duration: 1,
    opacity: 0,
    delay: 0.2,
});

// Create mouse tracking effect for CTAs
document.querySelectorAll('a[class*="bg-gradient"]').forEach((cta) => {
    cta.addEventListener('mousemove', (e) => {
        const rect = cta.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        gsap.to(cta, {
            duration: 0.3,
            '--mouse-x': `${x}px`,
            '--mouse-y': `${y}px`,
        });
    });
});

// Add accessibility features
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Add data-reveal attribute to elements that should animate
    document.querySelectorAll('section > *').forEach((el) => {
        if (!el.hasAttribute('data-reveal')) {
            el.setAttribute('data-reveal', 'true');
        }
    });

    // Trigger ScrollTrigger refresh
    ScrollTrigger.refresh();
});

// Log that the site is loaded
console.log(
    '%cWelcome to Hirusha Sandeeptha\'s Portfolio!',
    'font-size: 20px; color: #06b6d4; font-weight: bold;'
);
console.log(
    '%cCheck out the source code on GitHub: https://github.com/hirushasandeeptha/my-portfolio',
    'font-size: 14px; color: #0ea5e9;'
);