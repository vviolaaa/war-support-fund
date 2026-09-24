(() => {
    const body = document.body;

    function openModal(dialog) {
        if (!dialog) return;
        dialog.showModal();
        body.classList.add('modal-open');
    }

    function closeAllModals() {
        document.querySelectorAll('dialog[open]').forEach((d) => d.close());
        body.classList.remove('modal-open');
    }

    // Знімаємо блокування скролу, коли вікно закрили через Esc
    document.querySelectorAll('dialog.modal').forEach((dialog) => {
        dialog.addEventListener('close', () => {
            if (!document.querySelector('dialog[open]')) {
                body.classList.remove('modal-open');
            }
        });
    });

    document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-open-modal]');
        if (opener) {
            const dialog = document.getElementById(opener.dataset.openModal);
            openModal(dialog);
            const slider = dialog && dialog.querySelector('.slider');
            if (slider && slider.goTo) slider.goTo(0, true);
            return;
        }

        const scroller = e.target.closest('[data-scroll-to]');
        if (scroller) {
            closeAllModals();
            const target = document.getElementById(scroller.dataset.scrollTo);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        if (e.target.closest('[data-close-modal]')) {
            closeAllModals();
            return;
        }

        // Клік по темному фону за карткою
        if (e.target instanceof HTMLDialogElement) {
            closeAllModals();
        }
    });

    // Слайдер
    function initSlider(root) {
        const track = root.querySelector('.slider-track');
        const slides = Array.from(track.children);
        const dots = Array.from(root.querySelectorAll('[data-dot]'));
        const prev = root.querySelector('[data-slide="prev"]');
        const next = root.querySelector('[data-slide="next"]');
        let index = 0;

        function goTo(i, instant) {
            index = Math.max(0, Math.min(slides.length - 1, i));
            if (instant) track.style.transition = 'none';
            track.style.transform = `translateX(-${index * 100}%)`;
            if (instant) {
                void track.offsetWidth; // застосувати без анімації
                track.style.transition = '';
            }
            slides.forEach((s, n) => { s.inert = n !== index; });
            dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
            prev.disabled = index === 0;
            next.disabled = index === slides.length - 1;
            const dialog = root.closest('dialog');
            if (dialog) dialog.scrollTop = 0;
        }

        prev.addEventListener('click', () => goTo(index - 1));
        next.addEventListener('click', () => goTo(index + 1));
        dots.forEach((d) => d.addEventListener('click', () => goTo(Number(d.dataset.dot))));

        root.closest('dialog').addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') goTo(index - 1);
            if (e.key === 'ArrowRight') goTo(index + 1);
        });

        root.goTo = goTo;
        goTo(0, true);
    }

    document.querySelectorAll('.slider').forEach(initSlider);

    // Форма підписки
    const form = document.getElementById('newsletter-form');
    const status = document.getElementById('newsletter-status');

    if (form && status) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = form.elements['subscriber-name'];
            const emailInput = form.elements['subscriber-email'];
            [nameInput, emailInput].forEach((i) => i.classList.remove('is-invalid'));

            if (!nameInput.value.trim()) {
                nameInput.classList.add('is-invalid');
                status.textContent = "Введіть, будь ласка, ім'я.";
                status.className = 'form-status is-error';
                nameInput.focus();
                return;
            }

            if (!emailInput.checkValidity() || !emailInput.value.trim()) {
                emailInput.classList.add('is-invalid');
                status.textContent = 'Введіть коректний email, наприклад name@example.com.';
                status.className = 'form-status is-error';
                emailInput.focus();
                return;
            }

            // TODO: тут можна відправити дані на сервер / сервіс розсилок (fetch)
            status.textContent = `Дякуємо, ${nameInput.value.trim()}! Ви підписані на розсилку.`;
            status.className = 'form-status is-success';
            form.reset();
        });
    }
})();