/* ==========================================================
   animations.js — окремий файл, не чіпає ваш script.js
   Усі анімації ПОВТОРЮЮТЬСЯ: вийшов із секції — зʼявилась знову, коли повернувся.
   ========================================================== */
(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canObserve = "IntersectionObserver" in window;
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const observed = []; // усе, що відстежуємо на появу/зникнення

    /* ---------- 1. Заголовки по словах ---------- */
    function splitWords(el, mode) {
        const text = el.textContent.trim();
        if (!text) return;
        el.setAttribute("aria-label", text);
        el.textContent = "";
        text.split(/\s+/).forEach((word, i) => {
            const outer = document.createElement("span");
            outer.className = "word";
            outer.setAttribute("aria-hidden", "true");
            const inner = document.createElement("span");
            inner.className = "word-inner";
            inner.style.setProperty("--i", i);
            inner.textContent = word;
            outer.appendChild(inner);
            el.appendChild(outer);
            el.appendChild(document.createTextNode(" "));
        });
        el.classList.add("split", `split--${mode}`);
        observed.push(el);
    }

    if (!reduceMotion) {
        [
            [".main-title", "rise"],
            [".quote-title", "rise"],
            [".mission-text", "fade"],
            [".support-text", "rise"],
            [".contacts-title", "rise"],
        ].forEach(([selector, mode]) => $$(selector).forEach((el) => splitWords(el, mode)));
    }

    /* ---------- 2. Решта блоків ---------- */
    // offset — затримка (мс), step — крок між сусідніми елементами
    const reveals = [
        { sel: ".main-description", offset: 550 },
        { sel: ".first-screen-container > .button", offset: 700 },
        { sel: ".quote-subtitle", offset: 450 },
        { sel: ".quote-description", offset: 600 },
        { sel: ".description-screen > .button" },
        { sel: ".mission-image", cls: "reveal-pop" },
        { sel: ".support-description", offset: 350 },
        { sel: ".support-goal-wrapper", offset: 500 },
        { sel: ".support-screen > .button", offset: 650 },
        { sel: ".contacts-info > *", offset: 100, step: 160 },
        { sel: ".contacts-newsletter-container" },
    ];

    reveals.forEach(({ sel, cls = "reveal", offset = 0, step = 110 }) => {
        $$(sel).forEach((el) => {
            const siblings = Array.from(el.parentElement.children).filter((c) => c.matches(sel));
            const index = Math.min(siblings.indexOf(el), 4);
            el.style.setProperty("--reveal-delay", `${offset + index * step}ms`);
            el.classList.add(cls);
            observed.push(el);
        });
    });

    // блоки з текстом і картинкою відстежуємо як групу
    $$(".description-block").forEach((block) => observed.push(block));

    // Де стоїть текст відносно картинки — звідти він і заїде
    function setDirection(block) {
        const content = block.querySelector(".description-content");
        const img = block.querySelector(".block-img");
        block.classList.remove("content-left", "content-right");
        if (!content || !img) return;
        const c = content.getBoundingClientRect();
        const i = img.getBoundingClientRect();
        if (Math.abs(c.left - i.left) < 24) return; // елементи одне під одним
        block.classList.add(c.left < i.left ? "content-left" : "content-right");
    }

    /* ---------- 3. Показ / приховування при прокручуванні ---------- */
    const SHOW_AT = 0.15; // яку частину елемента видно, щоб запустити анімацію

    if (!canObserve || reduceMotion) {
        observed.forEach((el) => el.classList.add("is-visible"));
    } else {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const el = entry.target;
                    if (entry.intersectionRatio >= SHOW_AT) {
                        if (!el.classList.contains("is-visible")) {
                            if (el.classList.contains("description-block")) setDirection(el);
                            el.classList.add("is-visible");
                        }
                    } else if (!entry.isIntersecting) {
                        // повністю поза екраном — скидаємо, щоб анімація могла зіграти знову
                        el.classList.remove("is-visible");
                    }
                });
            },
            { threshold: [0, SHOW_AT], rootMargin: "0px 0px -6% 0px" }
        );
        observed.forEach((el) => io.observe(el));
    }

    /* ---------- 4. Смуга прогресу + паралакс першого екрана ---------- */
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const hero = document.querySelector(".first-screen-container");
    let ticking = false;

    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.setProperty("--progress", max > 0 ? (window.scrollY / max).toFixed(4) : 0);

        if (hero && !reduceMotion) {
            const y = Math.min(window.scrollY, window.innerHeight);
            hero.style.translate = `0 ${(y * 0.3).toFixed(1)}px`; // рухається повільніше за сторінку
            hero.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75)));
        }
        ticking = false;
    };
    const requestUpdate = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    };
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    /* ---------- 5. Активний пункт меню ---------- */
    const navLinks = $$('.menu-item a[href^="#"]');
    const linkBySection = new Map();
    navLinks.forEach((link) => {
        const section = document.querySelector(link.getAttribute("href"));
        if (section) linkBySection.set(section, link);
    });

    if (canObserve) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach((l) => l.classList.remove("is-active"));
                    const link = linkBySection.get(entry.target);
                    if (link) link.classList.add("is-active");
                });
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );
        $$("section[id]").forEach((s) => navObserver.observe(s));
    }

    /* ---------- 6. Лічильник «Наша мета» — рахує щоразу заново ---------- */
    const stats = document.querySelector(".support-stats");
    if (stats && canObserve && !reduceMotion) {
        const items = $$(".support-stats-item", stats).map((el) => ({
            el,
            target: parseInt(el.textContent, 10) || 0,
            length: el.textContent.trim().length, // зберігаємо ведучі нулі: 025, 00
        }));

        const setValues = (progress) => {
            items.forEach(({ el, target, length }) => {
                el.textContent = String(Math.round(target * progress)).padStart(length, "0");
            });
        };

        let raf = 0;
        const run = () => {
            cancelAnimationFrame(raf);
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min((now - start) / 1800, 1);
                setValues(1 - Math.pow(1 - t, 3)); // easeOutCubic
                if (t < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        };

        setValues(0);
        let counting = false;
        new IntersectionObserver(
            ([entry]) => {
                if (entry.intersectionRatio >= 0.6 && !counting) {
                    counting = true;
                    run();
                } else if (!entry.isIntersecting) {
                    counting = false;
                    cancelAnimationFrame(raf);
                    setValues(0);
                }
            },
            { threshold: [0, 0.6] }
        ).observe(stats);
    }
})();