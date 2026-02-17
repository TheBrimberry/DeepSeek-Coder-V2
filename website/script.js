// ========================================
// DeepSeek-Coder-V2 Website Scripts
// ========================================

(function () {
    'use strict';

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            const spans = navToggle.querySelectorAll('span');
            if (navLinks.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        // Close mobile nav on link click
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                var spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offset = 80;
                var top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // --- Benchmark tabs ---
    var tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var tab = this.getAttribute('data-tab');

            tabBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            document.querySelectorAll('.tab-panel').forEach(function (panel) {
                panel.classList.remove('active');
            });
            var target = document.getElementById('tab-' + tab);
            if (target) target.classList.add('active');
        });
    });

    // --- Code tabs ---
    var codeTabs = document.querySelectorAll('.code-tab');
    codeTabs.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var tab = this.getAttribute('data-codetab');

            codeTabs.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');

            document.querySelectorAll('.code-panel').forEach(function (panel) {
                panel.classList.remove('active');
            });
            var target = document.getElementById('codetab-' + tab);
            if (target) target.classList.add('active');
        });
    });

    // --- Copy buttons ---
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var codeId = 'code-' + this.getAttribute('data-copy');
            var codeEl = document.getElementById(codeId);
            if (!codeEl) return;

            var text = codeEl.textContent;
            var button = this;

            navigator.clipboard.writeText(text).then(function () {
                button.textContent = 'Copied!';
                setTimeout(function () {
                    button.textContent = 'Copy';
                }, 2000);
            }).catch(function () {
                // Fallback for older browsers
                var textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    button.textContent = 'Copied!';
                    setTimeout(function () {
                        button.textContent = 'Copy';
                    }, 2000);
                } catch (e) {
                    // Silently fail
                }
                document.body.removeChild(textarea);
            });
        });
    });

    // --- Animated counters ---
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        var duration = 1800;
        var startTime = null;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function update(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var easedProgress = easeOutCubic(progress);
            el.textContent = Math.round(target * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    // --- Intersection Observer for animations ---
    var observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    // Animate stat counters
    var statsObserved = false;
    var statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        var statsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !statsObserved) {
                    statsObserved = true;
                    document.querySelectorAll('.stat-value[data-target]').forEach(function (el) {
                        animateCounter(el);
                    });
                }
            });
        }, observerOptions);
        statsObserver.observe(statsSection);
    }

    // Fade-in animation for sections
    var fadeElements = document.querySelectorAll('.feature-card, .model-card, .benchmark-table-wrapper, .code-block, .api-card, .citation-block');
    fadeElements.forEach(function (el) {
        el.classList.add('fade-in');
    });

    var fadeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    fadeElements.forEach(function (el) {
        fadeObserver.observe(el);
    });

    // --- Active nav link highlighting ---
    var sections = document.querySelectorAll('section[id]');
    function highlightNav() {
        var scrollY = window.scrollY + 100;
        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                document.querySelectorAll('.nav-links a').forEach(function (a) {
                    a.style.color = '';
                });
                var activeLink = document.querySelector('.nav-links a[href="#' + id + '"]');
                if (activeLink && !activeLink.classList.contains('nav-btn')) {
                    activeLink.style.color = '#e8e8ed';
                }
            }
        });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
})();
