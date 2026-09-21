document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.contacts-newsletter-form');
  const emailInput = form.querySelector('input[type="email"]');
  const nameInput = form.querySelector('input[type="text"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateEmail(emailInput.value)) {
      alert('Будь ласка, введіть коректний email');
      return;
    }

    emailjs.send('service_78h2zkl', 'template_du5u86j', {
      name: nameInput.value,
      email: emailInput.value
    })
      .then(function () {
        alert('Дякуємо за підписку! Перевірте свою пошту.');
        form.reset();
      })
      .catch(function (error) {
        alert('Сталася помилка. Спробуйте ще раз.');
        console.error(error);
      });
  });
});