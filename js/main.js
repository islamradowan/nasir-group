// Nasir Group Industries - Main JavaScript

// Global variables
let currentLanguage = localStorage.getItem('language') || 'en';
let translations = {};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    loadTranslations();
    setupNavigation();
    setupLanguageToggle();
    setupAnimations();
    setupForms();
    setupSearch();
    setupCounters();
    setupBackToTop();
}

// Load translations
async function loadTranslations() {
    try {
        const response = await fetch(`data/${currentLanguage}.json`);
        translations = await response.json();
        updatePageContent();
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English if current language fails
        if (currentLanguage !== 'en') {
            currentLanguage = 'en';
            loadTranslations();
        }
    }
}

// Update page content with translations
function updatePageContent() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getNestedTranslation(translations, key);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Add Bengali class for Bengali content
    if (currentLanguage === 'bn') {
        document.body.classList.add('bengali');
    } else {
        document.body.classList.remove('bengali');
    }
}

// Get nested translation
function getNestedTranslation(obj, key) {
    return key.split('.').reduce((o, k) => o && o[k], obj);
}

// Setup Navigation
function setupNavigation() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', 
                navMenu.classList.contains('active'));
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar') && navMenu) {
            navMenu.classList.remove('active');
            if (mobileToggle) {
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });
    
    // Highlight active page
    highlightActivePage();
}

// Highlight active page in navigation
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Setup Language Toggle
function setupLanguageToggle() {
    const langToggle = document.querySelector('.lang-toggle');
    
    if (langToggle) {
        // Update button text
        langToggle.textContent = currentLanguage === 'en' ? 'বাংলা' : 'English';
        
        langToggle.addEventListener('click', () => {
            currentLanguage = currentLanguage === 'en' ? 'bn' : 'en';
            localStorage.setItem('language', currentLanguage);
            langToggle.textContent = currentLanguage === 'en' ? 'বাংলা' : 'English';
            loadTranslations();
        });
    }
}

// Setup Animations
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Setup Forms
function setupForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        
        // Setup form validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showToast('Message sent successfully!', 'success');
        form.reset();
    } catch (error) {
        showToast('Error sending message. Please try again.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Validate form
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
        isValid = false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            errorMessage = 'Please enter a valid phone number';
            isValid = false;
        }
    }
    
    // Show/hide error
    showFieldError(field, errorMessage);
    
    return isValid;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError({ target: field });
    
    if (message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Setup Search
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                hideSearchResults();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                hideSearchResults();
            }
        });
    }
}

// Perform search
function performSearch(query) {
    // Simulate search (replace with actual search logic)
    const mockResults = [
        { title: 'Float Glass Products', url: 'products.html#glass', type: 'product' },
        { title: 'Nasir Glass Industries', url: 'business-divisions.html#ngil', type: 'division' },
        { title: 'About Our Company', url: 'about.html', type: 'page' }
    ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );
    
    showSearchResults(mockResults);
}

// Show search results
function showSearchResults(results) {
    const searchResults = document.querySelector('.search-results');
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No results found</div>';
    } else {
        searchResults.innerHTML = results.map(result => `
            <a href="${result.url}" class="search-result-item">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-type">${result.type}</div>
            </a>
        `).join('');
    }
    
    searchResults.classList.add('active');
}

// Hide search results
function hideSearchResults() {
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.classList.remove('active');
    }
}

// Setup Counters
function setupCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Animate counter
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Setup Back to Top
function setupBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export functions for use in other scripts
window.NasirGroup = {
    showToast,
    loadTranslations,
    performSearch,
    validateForm
};