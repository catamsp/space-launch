(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Nav: scroll state ---------- */
    var nav = document.querySelector('.nav');
    if (nav) {
        var onScrollNav = function () {
            nav.classList.toggle('scrolled', window.scrollY > 10);
        };
        window.addEventListener('scroll', onScrollNav, { passive: true });
        onScrollNav();
    }

    /* ---------- Nav: mobile toggle ---------- */
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
        });
        navLinks.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- Hero screenshot carousel ---------- */
    var carousel = document.querySelector('.carousel');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('img'));
        var current = 0;
        var timer = null;
        var interval = 3800;

        function go(i) {
            var prev = slides[current];
            prev.classList.remove('active');
            prev.classList.add('exit');
            setTimeout(function () {
                prev.classList.remove('exit');
            }, 700);
            current = (i + slides.length) % slides.length;
            slides[current].classList.add('active');
        }

        function restart() {
            if (timer) clearInterval(timer);
            if (!reduceMotion && slides.length > 1) {
                timer = setInterval(function () { go(current + 1); }, interval);
            }
        }

        slides[0].classList.add('active');
        restart();
    }

    /* ---------- Scroll reveal ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if (reveals.length) {
        if (reduceMotion) {
            reveals.forEach(function (el) { el.classList.add('in-view'); });
        } else if ('IntersectionObserver' in window) {
            var ro = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        ro.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            reveals.forEach(function (el) { ro.observe(el); });
        } else {
            reveals.forEach(function (el) { el.classList.add('in-view'); });
        }
    }

    /* ---------- Scroll-driven phone pose (flicker-free) ---------- */
    var posePhones = Array.prototype.slice.call(document.querySelectorAll('.feature-media .phone'));
    if (posePhones.length && !reduceMotion) {
        var poseTick = false;

        var clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };

        var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };

        var renderPose = function () {
            var vh = window.innerHeight;
            var vc = vh / 2;

            posePhones.forEach(function (el) {
                var row = el.closest('.feature-row');
                var flip = row && row.classList.contains('feature-row--flip') ? -1 : 1;
                var r = el.getBoundingClientRect();
                var t = clamp((r.top + r.height / 2 - vc) / vh, -1, 1);
                var u = 1 - Math.abs(t);
                var e = easeOut(clamp(u, 0, 1));
                var dir = t < 0 ? 1 : -1;
                var lean = (1 - e) * 38;
                var tilt = (1 - e) * 7 * flip;
                var lift = (1 - e) * 90;
                var pop = 1 + 0.06 * Math.sin(u * Math.PI);

                el.style.transform =
                    'translateY(' + (-lift).toFixed(2) + 'px) ' +
                    'rotateX(' + (lean * dir).toFixed(2) + 'deg) ' +
                    'rotateZ(' + (-tilt * dir).toFixed(2) + 'deg) ' +
                    'scale(' + pop.toFixed(3) + ')';
            });

            poseTick = false;
        };

        var onPoseScroll = function () {
            if (!poseTick) {
                poseTick = true;
                requestAnimationFrame(renderPose);
            }
        };

        window.addEventListener('scroll', onPoseScroll, { passive: true });
        window.addEventListener('resize', onPoseScroll, { passive: true });
        renderPose();
    }

    /* ---------- FAQ accordion ---------- */
    document.querySelectorAll('.faq-item').forEach(function (item) {
        var btn = item.querySelector('.faq-q');
        var answer = item.querySelector('.faq-a');
        if (!btn || !answer) return;
        btn.addEventListener('click', function () {
            var isOpen = item.classList.contains('open');
            item.classList.toggle('open');
            answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
        });
    });

    /* ---------- Docs sidebar + TOC scrollspy ---------- */
    var docContent = document.querySelector('.docs-content');
    if (docContent) {
        var sideLinks = document.querySelectorAll('.docs-side a[href^="#"]');
        var tocLinks = document.querySelectorAll('.doc-toc a[href^="#"]');
        var headings = Array.prototype.slice.call(docContent.querySelectorAll('h2[id], h3[id]'));

        var allLinks = Array.prototype.slice.call(sideLinks).concat(Array.prototype.slice.call(tocLinks));

        function onScroll() {
            var pos = window.scrollY + window.innerHeight / 3;
            var currentId = null;
            headings.forEach(function (h) {
                if (h.offsetTop <= pos) currentId = h.id;
            });
            allLinks.forEach(function (a) {
                var active = a.getAttribute('href') === '#' + currentId;
                a.classList.toggle('active', active);
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
})();
