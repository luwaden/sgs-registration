// Configuration - PASTE YOUR LINKS HERE
const FORM_LINK = "PASTE_FORM_LINK_HERE";
const SELAR_ONE_TIME = "PASTE_LINK";
const SELAR_TWO_PAYMENT = "PASTE_LINK";
const SELAR_THREE_PAYMENT = "PASTE_LINK";
const WHATSAPP_GROUP = "PASTE_LINK";

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeHeroCarousel();
    initializeCountdown();
    initializeVideoModals();
    initializeAnimatedCounters();
    initializeTestimonialCarousel();
    initializeFAQ();
    initializeStickyCTA();
    setupCTAButtons();
});

// Hero Carousel
function initializeHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    
    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }
    
    setInterval(nextSlide, 5000);
}

// Countdown Timer
function initializeCountdown() {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7); // 7 days from now
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = deadline.getTime() - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        document.getElementById('daysLeft').textContent = days;
        
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
}

// Video Modals
function initializeVideoModals() {
    const videoItems = document.querySelectorAll('.video-item');
    const modal = document.getElementById('videoModal');
    const closeBtn = document.querySelector('.video-close');
    const videoPlayer = document.getElementById('videoPlayer');
    
    videoItems.forEach(item => {
        item.addEventListener('click', function() {
            const videoId = this.dataset.video;
            videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            modal.classList.add('show');
        });
    });
    
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('show');
        videoPlayer.src = '';
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            videoPlayer.src = '';
        }
    });
}

// Animated Counters
function initializeAnimatedCounters() {
    const counters = document.querySelectorAll('.metric-number[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return '$' + (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + '+';
    }
    return num.toString();
}

// Testimonial Carousel
function initializeTestimonialCarousel() {
    const testimonials = document.querySelectorAll('.carousel-testimonial');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    let currentIndex = 0;
    
    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.carousel-dot');
    
    function goToSlide(index) {
        testimonials[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = index;
        
        testimonials[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }
    
    function nextSlide() {
        goToSlide((currentIndex + 1) % testimonials.length);
    }
    
    function prevSlide() {
        goToSlide((currentIndex - 1 + testimonials.length) % testimonials.length);
    }
    
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Auto slide
    setInterval(nextSlide, 5000);
}

// FAQ Accordion
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Sticky CTA
function initializeStickyCTA() {
    const stickyCTA = document.getElementById('stickyCTA');
    const heroSection = document.querySelector('.hero-carousel');
    
    window.addEventListener('scroll', () => {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        if (window.pageYOffset > heroBottom) {
            stickyCTA.classList.add('show');
        } else {
            stickyCTA.classList.remove('show');
        }
    });
}

// Setup All CTA Buttons
function setupCTAButtons() {
    const ctaButtons = [
        document.getElementById('headerCTA'),
        document.getElementById('heroCTA'),
        document.getElementById('cta1'),
        document.getElementById('pricingCTA1'),
        document.getElementById('pricingCTA2'),
        document.getElementById('pricingCTA3'),
        document.getElementById('finalCTA'),
        document.querySelector('.btn-sticky')
    ];
    
    ctaButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                window.location.href = FORM_LINK;
            });
        }
    });
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});