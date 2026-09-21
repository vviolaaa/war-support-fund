document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.contacts-newsletter-form');
  const emailInput = form.querySelector('input[type="email"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateEmail(emailInput.value)) {
      alert('Будь ласка, введіть коректний email');
      return;
    }

    alert('Дякуємо за підписку!');
    form.reset();
  });
});

