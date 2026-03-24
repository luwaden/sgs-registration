// ============================================================
// SCHOOL OF GRANT SUCCESS — script.js
// ============================================================

// ---- CONFIGURATION — paste your links here ----
const FORM_LINK          = "/registration-form.html";
const SELAR_ONE_TIME     = "/registration-form.html";
const SELAR_TWO_PAYMENT  = "/registration-form.html";
const SELAR_THREE_PAYMENT = "/registration-form.html";
const WHATSAPP_GROUP     = "PASTE_WHATSAPP_GROUP_LINK";

// ---- Boot ----
document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();
    initCountdown();
    initVideoModals();
    initAnimatedCounters();
    initTestimonialCarousels();
    initFAQ();
    initStickyCTA();
    setupCTAButtons();
});

// ============================================================
// HERO CAROUSEL
// ============================================================
function initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
}

// ============================================================
// COUNTDOWN — target: 30th March 2026
// ============================================================
function initCountdown() {
    // Set deadline to 30 March 2026 midnight
    const deadline = new Date('2026-03-30T23:59:59');

    function update() {
        const now  = new Date().getTime();
        const dist = deadline.getTime() - now;

        if (dist <= 0) {
            ['days','hours','minutes','seconds'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = '00';
            });
            document.querySelectorAll('#daysLeft, #daysLeft2, #daysLeft3').forEach(el => {
                el.textContent = '0';
            });
            return;
        }

        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);

        setEl('days',    pad(d));
        setEl('hours',   pad(h));
        setEl('minutes', pad(m));
        setEl('seconds', pad(s));

        document.querySelectorAll('#daysLeft, #daysLeft2, #daysLeft3').forEach(el => {
            el.textContent = d;
        });
    }

    function pad(n) { return String(n).padStart(2, '0'); }
    function setEl(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    update();
    setInterval(update, 1000);
}

// ============================================================
// VIDEO MODALS
// ============================================================
function initVideoModals() {
    const items   = document.querySelectorAll('.video-item');
    const modal   = document.getElementById('videoModal');
    const close   = document.querySelector('.video-close');
    const player  = document.getElementById('videoPlayer');

    if (!modal) return;

    items.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.video;
            player.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        player.src = '';
        document.body.style.overflow = '';
    };

    close.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ============================================================
// ANIMATED COUNTERS
// ============================================================
function initAnimatedCounters() {
    const counters = document.querySelectorAll('.metric-number[data-target]');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const dur    = 2000;
    const step   = target / (dur / 16);
    let current  = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = fmt(target);
            clearInterval(timer);
        } else {
            el.textContent = fmt(Math.floor(current));
        }
    }, 16);
}

function fmt(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(0) + '+';
    return n.toString() + '+';
}

// ============================================================
// TESTIMONIAL CAROUSELS (multiple on page)
// ============================================================
function initTestimonialCarousels() {
    const carouselEls = document.querySelectorAll('.testimonial-carousel');
    carouselEls.forEach(carousel => setupCarousel(carousel));
}

function setupCarousel(carousel) {
    const items   = carousel.querySelectorAll('.carousel-testimonial');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const dotsEl  = carousel.querySelector('.carousel-dots');

    if (!items.length) return;

    let idx = 0;

    // Build dots
    items.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
    });

    const dots = carousel.querySelectorAll('.carousel-dot');

    function goTo(i) {
        items[idx].classList.remove('active');
        dots[idx].classList.remove('active');
        idx = (i + items.length) % items.length;
        items[idx].classList.add('active');
        dots[idx].classList.add('active');
    }

    prevBtn && prevBtn.addEventListener('click', () => goTo(idx - 1));
    nextBtn && nextBtn.addEventListener('click', () => goTo(idx + 1));

    // Auto-advance
    setInterval(() => goTo(idx + 1), 5000);
}

// ============================================================
// FAQ ACCORDION
// ============================================================
function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            const open = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!open) item.classList.add('active');
        });
    });
}

// ============================================================
// STICKY CTA
// ============================================================
function initStickyCTA() {
    const sticky = document.getElementById('stickyCTA');
    const hero   = document.querySelector('.hero-carousel');
    if (!sticky || !hero) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > hero.offsetTop + hero.offsetHeight) {
            sticky.classList.add('show');
        } else {
            sticky.classList.remove('show');
        }
    }, { passive: true });
}

// ============================================================
// CTA BUTTONS — all go to form link
// ============================================================
function setupCTAButtons() {
    const ids = [
        'headerCTA','heroCTA','resultsCTA','solutionCTA',
        'carouselCTA','incomeCTA','urgencyCTA','finalCTA',
        'pricingCTA1','pricingCTA2','pricingCTA3',
        'finalPay1','finalPay2','finalPay3',
        'stickyBtn'
    ];

    // Pricing cards go to their specific Selar links
    const selarMap = {
        'pricingCTA1': SELAR_ONE_TIME,
        'pricingCTA2': SELAR_TWO_PAYMENT,
        'pricingCTA3': SELAR_THREE_PAYMENT,
        'finalPay1':   SELAR_ONE_TIME,
        'finalPay2':   SELAR_TWO_PAYMENT,
        'finalPay3':   SELAR_THREE_PAYMENT,
    };

    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                const dest = selarMap[id] || FORM_LINK;
                window.location.href = dest;
            });
        }
    });
}

// ============================================================
// SMOOTH SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});