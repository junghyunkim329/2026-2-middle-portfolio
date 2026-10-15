'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteExperience } from './actions'
import type { AdminActionState } from './actions'

const initialState: AdminActionState = {}

export function DeleteExperienceForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteExperience,
    initialState,
  )
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.refresh()
  }, [router, state.success])

  return (
    <div>
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm('이 경험을 삭제할까요?')) {
            event.preventDefault()
          }
        }}
      >
        <input name="id" type="hidden" value={id} />
        <button
          className="admin-delete-button"
          disabled={pending}
          type="submit"
        >
          {pending ? '삭제 중...' : '삭제'}
        </button>
      </form>
      {state.error && <p className="admin-form-message">{state.error}</p>}
    </div>
  )
}
