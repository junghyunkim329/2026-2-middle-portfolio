import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EXPERIENCE_TEMPLATE_IDS,
  EXPERIENCE_TEMPLATES,
  createTemplateSections,
  isExperienceTemplateId,
  shouldPreserveTemplateSections,
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

test('본문이 작성된 경험은 템플릿을 변경해도 기존 내용을 보존한다', () => {
  assert.equal(
    shouldPreserveTemplateSections('activity', [
      { heading: '활동', body: '중부대학교 웹서버보안프로그래밍 실습' },
    ]),
    true,
  )
})

test('아직 작성하지 않은 기본 항목은 다른 템플릿의 권장 항목으로 교체한다', () => {
  assert.equal(
    shouldPreserveTemplateSections(
      'activity',
      createTemplateSections('activity'),
    ),
    false,
  )
})
