export const ADMIN_SESSION_COOKIE_NAME = 'portfolio-admin-session'
export const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 12

function getAdminSessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    path: '/admin',
  }
}

export function createAdminSessionCookie(value: string, secure: boolean) {
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value,
    options: {
      ...getAdminSessionCookieOptions(secure),
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
    },
  }
}

export function expireAdminSessionCookie(secure: boolean) {
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value: '',
    options: {
      ...getAdminSessionCookieOptions(secure),
      maxAge: 0,
    },
  }
}
