'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveExperience, type AdminActionState } from './actions'
import type { Experience } from '@/lib/experiences'

const initialState: AdminActionState = {}

export function ExperienceEditor({
  experience,
}: {
  experience: Experience | null
}) {
  const [state, formAction, pending] = useActionState(saveExperience, initialState)
  const [sections, setSections] = useState(
    (experience?.sections ?? [{ heading: '', body: '' }]).map(
      (section, index) => ({ ...section, key: `section-${index}` }),
    ),
  )
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin?status=saved')
  }, [router, state.success])

  return (
    <form className="admin-form experience-editor" action={formAction}>
      {experience && (
        <input name="originalId" type="hidden" value={experience.id} />
      )}
      <div className="admin-form-grid">
        <label>
          URL ID
          <input
            defaultValue={experience?.id}
            name="id"
            placeholder="예: vehicle-security"
            required
          />
        </label>
        <label>
          제목
          <input defaultValue={experience?.title} name="title" required />
        </label>
        <label className="admin-field-wide">
          한 줄 소개
          <textarea
            defaultValue={experience?.description}
            name="description"
            required
            rows={2}
          />
        </label>
        <label className="admin-field-wide">
          이미지 URL
          <input
            defaultValue={experience?.image}
            name="image"
            placeholder="https://... 또는 /image.jpg"
            required
          />
        </label>
        <label>
          날짜
          <input
            defaultValue={experience?.date}
            name="date"
            placeholder="2025년 1월 1일"
            required
          />
        </label>
        <label>
          작성자
          <input defaultValue={experience?.author} name="author" required />
        </label>
        <label className="admin-field-wide">
          분류 태그
          <input
            defaultValue={experience?.tags.join(', ')}
            name="tags"
            placeholder="정보 보안, 해킹"
            required
          />
          <span className="admin-field-hint">태그는 쉼표로 구분합니다.</span>
        </label>
        <label className="admin-field-wide">
          인용 문구
          <textarea
            defaultValue={experience?.quote}
            name="quote"
            required
            rows={2}
          />
        </label>
      </div>

      <div className="admin-sections-heading">
        <h3>경험 내용</h3>
        <button
          className="admin-secondary-button"
          onClick={() =>
            setSections((current) => [
              ...current,
              { heading: '', body: '', key: crypto.randomUUID() },
            ])
          }
          type="button"
        >
          내용 추가
        </button>
      </div>
      <div className="admin-section-list">
        {sections.map((section, index) => (
          <fieldset className="admin-section-fieldset" key={section.key}>
            <legend>내용 {index + 1}</legend>
            <label>
              소제목
              <input
                onChange={(event) =>
                  setSections((current) =>
                    current.map((item, sectionIndex) =>
                      sectionIndex === index
                        ? { ...item, heading: event.target.value }
                        : item,
                    ),
                  )
                }
                name="sectionHeading"
                required
                value={section.heading}
              />
            </label>
            <label>
              본문
              <textarea
                onChange={(event) =>
                  setSections((current) =>
                    current.map((item, sectionIndex) =>
                      sectionIndex === index
                        ? { ...item, body: event.target.value }
                        : item,
                    ),
                  )
                }
                name="sectionBody"
                required
                rows={4}
                value={section.body}
              />
            </label>
            {sections.length > 1 && (
              <button
                className="admin-text-button"
                onClick={() =>
                  setSections((current) =>
                    current.filter((_, sectionIndex) => sectionIndex !== index),
                  )
                }
                type="button"
              >
                이 내용 삭제
              </button>
            )}
          </fieldset>
        ))}
      </div>
      {state.error && <p className="admin-form-message">{state.error}</p>}
      <button className="admin-primary-button" disabled={pending} type="submit">
        {pending ? '저장 중...' : '경험 저장'}
      </button>
    </form>
  )
}
