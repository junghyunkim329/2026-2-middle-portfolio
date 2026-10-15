import 'server-only'

import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'portfolio-admin-session'
const SESSION_DURATION_SECONDS = 60 * 60 * 12

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error('ADMIN_SESSION_SECRET must contain at least 32 bytes.')
  }
  return secret
}

function equalSecret(value: string, expected: string) {
  const valueHash = createHash('sha256').update(value).digest()
  const expectedHash = createHash('sha256').update(expected).digest()
  return timingSafeEqual(valueHash, expectedHash)
}

function sign(payload: string) {
  return createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url')
}

export function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      Buffer.byteLength(process.env.ADMIN_SESSION_SECRET) >= 32,
  )
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !isAdminConfigured()) return false
  return equalSecret(password, expected)
}

export async function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  const payload = String(expiresAt)
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function hasAdminSession() {
  if (!isAdminConfigured()) return false
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return false

  const [payload, signature, ...extra] = token.split('.')
  if (!payload || !signature || extra.length) return false

  const expiresAt = Number(payload)
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() / 1000) {
    return false
  }

  try {
    return equalSecret(signature, sign(payload))
  } catch {
    return false
  }
}
