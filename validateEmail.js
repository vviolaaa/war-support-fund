function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = validateEmail;
}