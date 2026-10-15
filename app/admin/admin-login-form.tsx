'use client'

import { useActionState } from 'react'
import { loginAdmin, type AdminActionState } from './actions'

const initialState: AdminActionState = {}

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState)

  return (
    <form className="admin-form admin-login-form" action={formAction}>
      <label>
        관리자 비밀번호
        <input
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      {state.error && <p className="admin-form-message">{state.error}</p>}
      <button className="admin-primary-button" disabled={pending} type="submit">
        {pending ? '확인 중...' : '로그인'}
      </button>
    </form>
  )
}
