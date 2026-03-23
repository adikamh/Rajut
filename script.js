// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const sections = document.querySelectorAll('.section');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');

    // Function to show section
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update active nav link
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Close mobile menu
        if (mobileMenu) {
            mobileMenu.style.display = 'none';
        }

        // Update URL hash
        window.location.hash = sectionId;
    }

    // Add click event to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const sectionId = href.substring(1); // Remove #
            showSection(sectionId);
        });
    });

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (mobileMenu.classList.contains('show')) {
                mobileMenu.classList.remove('show');
                mobileMenuBtn.classList.remove('active');
            } else {
                mobileMenu.classList.add('show');
                mobileMenuBtn.classList.add('active');
            }
        });
    }

    // Handle initial load with hash
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showSection(initialHash);
    } else {
        showSection('home'); // Default to home
    }

    // Handle browser back/forward
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            showSection(hash);
        }
    });

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }

            // Here you would typically send the data to a server
            // For now, just show a success message
            alert(`Thank you ${name}! Your message has been sent. We'll get back to you soon.`);

            // Reset form
            this.reset();
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add some interactive effects
    // Image hover effects are handled in CSS

    // Gallery image click to expand (simple implementation)
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(img => {
        img.addEventListener('click', function() {
            // Simple lightbox effect
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: pointer;
            `;

            const enlargedImg = document.createElement('img');
            enlargedImg.src = this.src;
            enlargedImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 1rem;
            `;

            overlay.appendChild(enlargedImg);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', function() {
                document.body.removeChild(overlay);
            });
        });
    });

    // Add loading animation for work cards
    const workCards = document.querySelectorAll('.work-card');
    workCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });

    // Add swipe gesture support for mobile gallery navigation
    let touchStartX = 0;
    let touchEndX = 0;

    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe right - go to previous section
                navigateToPreviousSection();
            } else {
                // Swipe left - go to next section
                navigateToNextSection();
            }
        }
    }

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    // Navigation functions for swipe
    function navigateToNextSection() {
        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            const sections = ['home', 'gallery', 'projects', 'about', 'contact'];
            const currentIndex = sections.indexOf(currentSection.id);
            const nextIndex = (currentIndex + 1) % sections.length;
            showSection(sections[nextIndex]);
        }
    }

    function navigateToPreviousSection() {
        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            const sections = ['home', 'gallery', 'projects', 'about', 'contact'];
            const currentIndex = sections.indexOf(currentSection.id);
            const prevIndex = currentIndex === 0 ? sections.length - 1 : currentIndex - 1;
            showSection(sections[prevIndex]);
        }
    }

    // Add viewport height fix for mobile browsers
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    console.log('Toko Rajut mobile-optimized website loaded successfully!');
});