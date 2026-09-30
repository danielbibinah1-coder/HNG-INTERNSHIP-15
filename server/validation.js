const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

export function cleanName(name) {
  return typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : ''
}

/** Returns a per-field error map; empty object means the payload is valid. */
export function validateRegistration({ name, email, password }) {
  const errors = {}
  const trimmedName = cleanName(name)
  const normalizedEmail = normalizeEmail(email)

  if (trimmedName.length < 2) errors.name = 'Enter your name (at least 2 characters).'
  else if (trimmedName.length > 60) errors.name = 'That name is a little too long.'

  if (!normalizedEmail) errors.email = 'Enter your email address.'
  else if (!EMAIL_RE.test(normalizedEmail)) errors.email = 'That email address looks incomplete.'
  else if (normalizedEmail.length > 190) errors.email = 'That email address is too long.'

  if (!password) errors.password = 'Choose a password.'
  else if (password.length < 8) errors.password = 'Use at least 8 characters.'
  else if (password.length > 100) errors.password = 'Keep it under 100 characters.'
  else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Mix in at least one letter and one number.'
  }

  return errors
}

export function validateLogin({ email, password }) {
  const errors = {}
  if (!normalizeEmail(email)) errors.email = 'Enter your email address.'
  if (!password) errors.password = 'Enter your password.'
  return errors
}

/** Shape check for the workspace blob the client syncs. */
export function validateWorkspaceState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return 'Workspace state must be an object.'
  }
  if (JSON.stringify(state).length > 900_000) return 'Workspace state is too large to store.'
  return null
}
