import { randomBytes, scrypt as scryptAsync, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import bcrypt from 'bcryptjs';

const scrypt = promisify(scryptAsync);

const SCRYPT_PREFIX = 'scrypt$';
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;
const SCRYPT_SALT_BYTES = 16;
const SCRYPT_MAXMEM = 64 * 1024 * 1024;

const BCRYPT_PREFIXES = ['$2a$', '$2b$', '$2y$'];

export const isBcryptHash = (hash) =>
  typeof hash === 'string' && BCRYPT_PREFIXES.some((p) => hash.startsWith(p));

const isScryptHash = (hash) => typeof hash === 'string' && hash.startsWith(SCRYPT_PREFIX);

/**
 * Hashes a password using scrypt (native, libuv threadpool).
 * The encoded string embeds the cost params so they can be raised later
 * without breaking verification of previously stored hashes.
 *
 * @param {string} password
 * @returns {Promise<string>} Format: scrypt$<N>$<r>$<p>$<saltB64>$<hashB64>
 */
export const hashPassword = async (password) => {
  const salt = randomBytes(SCRYPT_SALT_BYTES);
  const derived = await scrypt(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  });
  return `${SCRYPT_PREFIX}${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${derived.toString('base64')}`;
};

/**
 * Verifies a password against a stored hash. Handles both scrypt hashes and
 * legacy bcrypt hashes (pre-migration users).
 *
 * @param {string} password
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export const verifyPassword = async (password, storedHash) => {
  if (isScryptHash(storedHash)) {
    const [prefix, n, r, p, saltB64, hashB64] = storedHash.split('$');
    const derived = await scrypt(password, Buffer.from(saltB64, 'base64'), SCRYPT_KEYLEN, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: SCRYPT_MAXMEM,
    });
    const expected = Buffer.from(hashB64, 'base64');
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  }

  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(password, storedHash);
  }

  return false;
};