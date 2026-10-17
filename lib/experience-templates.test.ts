import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EXPERIENCE_TEMPLATE_IDS,
  EXPERIENCE_TEMPLATES,
  createTemplateSections,
  isExperienceTemplateId,
} from './experience-templates.ts'

test('관리자 편집기에서 선택할 수 있는 템플릿은 정확히 네 가지다', () => {
  assert.deepEqual(EXPERIENCE_TEMPLATE_IDS, [
    'project',
    'competition',
    'conference',
    'activity',
  ])
})

test('각 템플릿은 빈 본문과 고유한 소제목을 생성한다', () => {
  for (const templateId of EXPERIENCE_TEMPLATE_IDS) {
    const sections = createTemplateSections(templateId)

    assert.deepEqual(
      sections.map(({ heading }) => heading),
      EXPERIENCE_TEMPLATES[templateId].headings,
    )
    assert.ok(sections.every(({ body }) => body === ''))
    assert.equal(new Set(sections.map(({ heading }) => heading)).size, sections.length)
  }
})

test('지원하는 템플릿 ID만 검증을 통과한다', () => {
  assert.equal(isExperienceTemplateId('competition'), true)
  assert.equal(isExperienceTemplateId('custom'), false)
  assert.equal(isExperienceTemplateId(''), false)
})
