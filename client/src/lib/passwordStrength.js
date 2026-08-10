/**
 * Returns 'weak' | 'medium' | 'strong' based on backend password policy:
 * 8+ chars, uppercase, lowercase, number, special character.
 * @param {string} password
 * @returns {'weak'|'medium'|'strong'}
 */
export function getPasswordStrength(password) {
  if (!password) return 'weak'
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const passed = checks.filter(Boolean).length
  if (passed <= 2) return 'weak'
  if (passed <= 4) return 'medium'
  return 'strong'
}
