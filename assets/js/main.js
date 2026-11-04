/**
 * Firestarter Main Application Script
 * GSAP ScrollTrigger, Interactions & Experience Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initGSAP();
    initIgnitionButtons();
    initCounters();
    initNavbar();
    initSwitcher();
    initContactForm();
    initCylinderCarousel();
});

// Initialize GSAP & ScrollTrigger animations
function initGSAP() {
    if (typeof gsap === 'undefined') return;

    // Register ScrollTrigger if available
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Hero Reveal Animation
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl.from('.hero-badge', {
        y: -20,
        opacity: 0,
        duration: 0.8,
        delay: 0.2
    })
    .from('.hero-title-line', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15
    }, '-=0.4')
    .from('.hero-subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.8
    }, '-=0.5')
    .from('.hero-cta-group', {
        y: 20,
        opacity: 0,
        duration: 0.8
    }, '-=0.5')
    .from('.hero-telemetry', {
        opacity: 0,
        y: 20,
        duration: 0.8
    }, '-=0.4');

    // 2. ScrollTrigger on Sections & Cards (Always maintain visibility)
    if (typeof ScrollTrigger !== 'undefined') {
        // Fade in manifesto quote
        gsap.from('.manifesto-text', {
            scrollTrigger: {
                trigger: '.manifesto-section',
                start: 'top 90%',
                once: true
            },
            opacity: 0.3,
            y: 25,
            duration: 0.8,
            ease: 'power2.out',
            clearProps: 'all'
        });

        // Stagger capability cards (Guaranteed visibility: triggers as section enters, never reverses)
        gsap.from('.capability-card', {
            scrollTrigger: {
                trigger: '#cylinders, #pillars, .capabilities-grid',
                start: 'top 90%',
                once: true
            },
            y: 30,
            opacity: 0.4,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            clearProps: 'all'
        });

        // Pedigree timeline / credentials
        gsap.from('.pedigree-item', {
            scrollTrigger: {
                trigger: '#telemetry, #leadership, .pedigree-grid',
                start: 'top 90%',
                once: true
            },
            y: 20,
            opacity: 0.4,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all'
        });

        // Founder quote / card
        gsap.from('.founder-card', {
            scrollTrigger: {
                trigger: '.founder-section',
                start: 'top 90%',
                once: true
            },
            scale: 0.98,
            opacity: 0.4,
            duration: 0.8,
            ease: 'power2.out',
            clearProps: 'all'
        });

        // Refresh triggers on load to account for fonts & layout
        ScrollTrigger.refresh();
    }
}

// Ignition Button Logic
function initIgnitionButtons() {
    const ignitionBtns = document.querySelectorAll('.btn-ignition, .ignition-key-switch');
    const label = document.querySelector('.ignition-label');

    ignitionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            if (window.sparkEngine) {
                window.sparkEngine.triggerIgnition(x, y);
            }

            // Pulse page ambient flash on ignition click
            const flash = document.createElement('div');
            flash.className = 'ignition-flash';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 600);
        });
    });

    // Synchronize button visual state with engine running audio state
    window.addEventListener('engine-state-change', (e) => {
        const isRunning = e.detail && e.detail.running;

        ignitionBtns.forEach(btn => {
            if (isRunning) {
                btn.classList.add('ignited', 'engine-running');
            } else {
                btn.classList.remove('ignited', 'engine-running');
            }
        });

        if (label) {
            label.textContent = isRunning ? "ENGINE RUNNING // CLICK TO SHUT DOWN" : "Push to Ignite / Feel the Spark";
            label.style.color = isRunning ? "#FFAB91" : "";
            label.style.fontWeight = isRunning ? "700" : "";
        }
    });
}

// Number Counters
function initCounters() {
    const statCounters = document.querySelectorAll('.stat-number');
    if (!statCounters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetVal = parseInt(el.getAttribute('data-target') || '0', 10);
                const prefix = el.getAttribute('data-prefix') || '';
                const suffix = el.getAttribute('data-suffix') || '';
                
                let start = 0;
                const duration = 1800;
                const startTime = performance.now();

                function update(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out expo
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(ease * targetVal);

                    el.textContent = `${prefix}${current}${suffix}`;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        el.textContent = `${prefix}${targetVal}${suffix}`;
                    }
                }

                requestAnimationFrame(update);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statCounters.forEach(c => observer.observe(c));
}

// Navbar behavior
function initNavbar() {
    const navbar = document.querySelector('.site-nav');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('open');
        });
    }
}

// Option Switcher Logic
function initSwitcher() {
    const switchBtns = document.querySelectorAll('.switcher-btn');
    switchBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetOption = btn.getAttribute('data-target-option');
            if (targetOption) {
                window.location.href = targetOption;
            }
        });
    });
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.querySelector('[name="name"]')?.value || '';
        const email = form.querySelector('[name="email"]')?.value || '';
        const message = form.querySelector('[name="message"]')?.value || '';

        const subject = encodeURIComponent(`Firestarter Inquiry from ${name}`);
        const body = encodeURIComponent(`Hi Rayo,\n\nName: ${name}\nEmail: ${email}\n\nProject Brief:\n${message}\n\nSent via Firestarter Website`);

        // Trigger sparks on submit
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn && window.sparkEngine) {
            const rect = submitBtn.getBoundingClientRect();
            window.sparkEngine.triggerIgnition(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        // Direct mailto link fallback
        window.location.href = `mailto:Rayomand@firestarter.co.in?subject=${subject}&body=${body}`;
    });
}

// Mobile Horizontal Swipe Carousel for Cylinders
function initCylinderCarousel() {
    const grid = document.querySelector('.capabilities-grid');
    const dots = document.querySelectorAll('#cylinder-indicators .indicator-dot');
    if (!grid) return;

    let currentIndex = 0;
    let autoSwipeTimer = null;
    let isUserInteracting = false;
    let resumeTimer = null;

    function getCards() {
        return grid.querySelectorAll('.cylinder-card');
    }

    function scrollToIndex(idx, smooth = true) {
        const cards = getCards();
        if (!cards.length) return;
        currentIndex = (idx + cards.length) % cards.length;
        const targetCard = cards[currentIndex];
        
        // Calculate centered scroll position
        const cardOffset = targetCard.offsetLeft - grid.offsetLeft - (grid.clientWidth - targetCard.clientWidth) / 2;

        grid.scrollTo({
            left: Math.max(0, cardOffset),
            behavior: smooth ? 'smooth' : 'auto'
        });

        updateDots(currentIndex);
    }

    function updateDots(idx) {
        dots.forEach((dot, i) => {
            if (i === idx) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Auto-swipe every 3 seconds on mobile screens
    function startAutoSwipe() {
        if (autoSwipeTimer) clearInterval(autoSwipeTimer);
        autoSwipeTimer = setInterval(() => {
            if (window.innerWidth <= 768 && !isUserInteracting) {
                const cards = getCards();
                if (cards.length > 1) {
                    const nextIndex = (currentIndex + 1) % cards.length;
                    scrollToIndex(nextIndex, true);
                }
            }
        }, 3000);
    }

    function pauseAutoSwipe() {
        isUserInteracting = true;
        if (resumeTimer) clearTimeout(resumeTimer);
        // Resume after 4.5 seconds of no interaction
        resumeTimer = setTimeout(() => {
            isUserInteracting = false;
        }, 4500);
    }

    // Pause on touch or mouse interaction
    grid.addEventListener('touchstart', pauseAutoSwipe, { passive: true });
    grid.addEventListener('touchmove', pauseAutoSwipe, { passive: true });
    grid.addEventListener('mousedown', pauseAutoSwipe);

    // Sync active dot on manual scroll
    grid.addEventListener('scroll', () => {
        if (window.innerWidth > 768) return;
        const cards = getCards();
        if (!cards.length) return;

        const scrollCenter = grid.scrollLeft + grid.clientWidth / 2;
        let closestIndex = 0;
        let minDistance = Infinity;

        cards.forEach((card, idx) => {
            const cardCenter = card.offsetLeft - grid.offsetLeft + card.clientWidth / 2;
            const dist = Math.abs(scrollCenter - cardCenter);
            if (dist < minDistance) {
                minDistance = dist;
                closestIndex = idx;
            }
        });

        if (closestIndex !== currentIndex) {
            currentIndex = closestIndex;
            updateDots(currentIndex);
        }
    }, { passive: true });

    // Tap indicator dot to jump directly to card
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            pauseAutoSwipe();
            const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
            scrollToIndex(idx, true);
        });
    });

    startAutoSwipe();
}
