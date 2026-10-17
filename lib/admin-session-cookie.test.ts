import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createAdminSessionCookie,
  expireAdminSessionCookie,
} from './admin-session-cookie.ts'

test('로그아웃 쿠키는 로그인 쿠키와 동일한 경로에서 즉시 만료된다', () => {
  const created = createAdminSessionCookie('signed-token', false)
  const expired = expireAdminSessionCookie(false)

  assert.equal(created.options.path, '/admin')
  assert.equal(expired.options.path, created.options.path)
  assert.equal(expired.options.maxAge, 0)
  assert.equal(expired.value, '')
})

test('운영 환경의 생성·만료 쿠키에는 모두 secure 속성이 적용된다', () => {
  assert.equal(createAdminSessionCookie('signed-token', true).options.secure, true)
  assert.equal(expireAdminSessionCookie(true).options.secure, true)
})
