export const EXPERIENCE_TEMPLATE_IDS = [
  'project',
  'competition',
  'conference',
  'activity',
] as const

export type ExperienceTemplateId = (typeof EXPERIENCE_TEMPLATE_IDS)[number]

type ExperienceTemplate = {
  label: string
  description: string
  headings: readonly string[]
}

export const EXPERIENCE_TEMPLATES: Record<
  ExperienceTemplateId,
  ExperienceTemplate
> = {
  project: {
    label: '프로젝트',
    description: '문제 해결 과정과 구현 결과를 중심으로 작성합니다.',
    headings: [
      '배경과 문제',
      '나의 역할',
      '진행 과정',
      '어려움과 해결',
      '결과',
      '회고',
    ],
  },
  competition: {
    label: '공모전',
    description: '공모 주제부터 아이디어, 기여와 결과를 정리합니다.',
    headings: [
      '공모 주제',
      '아이디어',
      '나의 기여',
      '진행 과정',
      '결과',
      '회고',
    ],
  },
  conference: {
    label: '컨퍼런스',
    description: '참여 목적과 배운 내용, 이후의 적용을 기록합니다.',
    headings: ['참여 목적', '주요 세션과 활동', '핵심 배움', '적용 내용'],
  },
  activity: {
    label: '활동',
    description: '대외활동과 동아리 등에서 맡은 역할과 성과를 기록합니다.',
    headings: ['참여 배경', '주요 활동', '나의 역할', '성과', '배운 점'],
  },
}

export function isExperienceTemplateId(
  value: string,
): value is ExperienceTemplateId {
  return EXPERIENCE_TEMPLATE_IDS.some((templateId) => templateId === value)
}

export function createTemplateSections(templateId: ExperienceTemplateId) {
  return EXPERIENCE_TEMPLATES[templateId].headings.map((heading) => ({
    heading,
    body: '',
  }))
}

export function getExperienceTemplateLabel(templateId: ExperienceTemplateId) {
  return EXPERIENCE_TEMPLATES[templateId].label
}
