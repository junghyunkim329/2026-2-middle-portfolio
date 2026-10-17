'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Experience } from '@/lib/experiences'
import { saveFeaturedExperiences, type AdminActionState } from './actions'

const initialState: AdminActionState = {}

export function FeaturedExperiencesForm({
  experiences,
  selectedIds,
}: {
  experiences: Experience[]
  selectedIds: string[]
}) {
  const [state, formAction, pending] = useActionState(
    saveFeaturedExperiences,
    initialState,
  )
  const [selected, setSelected] = useState(selectedIds)
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.refresh()
  }, [router, state.success])

  return (
    <form className="admin-form" action={formAction}>
      <fieldset className="admin-template-picker">
        <legend>홈 화면 표시 설정</legend>
        <p>표시할 경험을 선택해주세요. 최대 3개까지 선택할 수 있습니다.</p>
        {experiences.length === 0 ? (
          <p>선택할 경험이 없습니다. 경험을 먼저 등록해주세요.</p>
        ) : (
          <div className="admin-template-options">
            {experiences.map((experience) => {
              const isSelected = selected.includes(experience.id)
              return (
                <label
                  className={isSelected ? 'selected' : ''}
                  key={experience.id}
                >
                  <input
                    checked={isSelected}
                    disabled={!isSelected && selected.length >= 3}
                    name="featuredExperienceIds"
                    onChange={(event) => {
                      const isChecked = event.currentTarget.checked
                      setSelected((current) =>
                        isChecked
                          ? [...current, experience.id]
                          : current.filter((id) => id !== experience.id),
                      )
                    }}
                    type="checkbox"
                    value={experience.id}
                  />
                  <span>
                    <strong>{experience.title}</strong>
                    <small>{experience.date}</small>
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </fieldset>
      {state.error && <p className="admin-form-message">{state.error}</p>}
      {state.success && (
        <p className="admin-success-message">홈 화면 표시 설정을 저장했습니다.</p>
      )}
      <button className="admin-primary-button" disabled={pending} type="submit">
        {pending ? '저장 중...' : '홈 화면 설정 저장'}
      </button>
    </form>
  )
}
