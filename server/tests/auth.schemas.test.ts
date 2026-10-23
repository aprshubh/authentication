import assert from 'node:assert/strict';
import test from 'node:test';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../src/auth/auth.schemas.js';

test('registration trims the name and email', () => {
  const result = registerSchema.parse({
    name: '  Shubh  ',
    email: '  shubh@example.com  ',
    password: 'long-enough-password',
  });

  assert.equal(result.name, 'Shubh');
  assert.equal(result.email, 'shubh@example.com');
});

test('registration rejects a short password', () => {
  const result = registerSchema.safeParse({
    name: 'Shubh',
    email: 'shubh@example.com',
    password: 'short',
  });

  assert.equal(result.success, false);
});

test('login rejects invalid email and empty password', () => {
  assert.equal(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success, false);
  assert.equal(loginSchema.safeParse({ email: 'shubh@example.com', password: '' }).success, false);
});

test('email verification accepts exactly six digits', () => {
  assert.equal(verifyEmailSchema.safeParse({ code: '123456' }).success, true);
  assert.equal(verifyEmailSchema.safeParse({ code: '12ab56' }).success, false);
  assert.equal(verifyEmailSchema.safeParse({ code: '12345' }).success, false);
});

test('password reset rejects an empty or whitespace-only token', () => {
  assert.equal(resetPasswordSchema.safeParse({ token: '', password: 'long-enough-password' }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: '   ', password: 'long-enough-password' }).success, false);
});
