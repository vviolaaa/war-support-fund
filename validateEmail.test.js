const validateEmail = require('./validateEmail');

test('приймає коректний email', () => {
  expect(validateEmail('test@example.com')).toBe(true);
});

test('відхиляє email без @', () => {
  expect(validateEmail('testexample.com')).toBe(false);
});

test('відхиляє email без домену', () => {
  expect(validateEmail('test@')).toBe(false);
});

test('відхиляє порожній рядок', () => {
  expect(validateEmail('')).toBe(false);
});

test('відхиляє email із пробілами', () => {
  expect(validateEmail('test @example.com')).toBe(false);
});

test('приймає email зі складним доменом', () => {
  expect(validateEmail('user.name@sub.example.co.uk')).toBe(true);
});