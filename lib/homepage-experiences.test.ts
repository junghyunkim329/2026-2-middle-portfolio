import assert from 'node:assert/strict'
import test from 'node:test'
import {
  selectHomepageExperiences,
} from './homepage-experiences.ts'
import type { Experience } from './experiences.ts'

function createExperience(
  id: string,
  template: Experience['template'],
  startDate: string,
): Experience {
  return {
    id,
    template,
    title: id,
    description: '',
    image: '',
    date: startDate,
    startDate,
    tags: [],
    attachments: [],
    sections: [],
  }
}

test('선택한 경험을 선택 순서대로 최대 3개 표시한다', () => {
  const experiences = [
    createExperience('first', 'activity', '2025-01-01'),
    createExperience('second', 'project', '2025-02-01'),
    createExperience('third', 'conference', '2025-03-01'),
    createExperience('fourth', 'competition', '2025-04-01'),
  ]

  assert.deepEqual(
    selectHomepageExperiences(experiences, [
      'third',
      'first',
      'fourth',
      'second',
    ]).map(({ id }) => id),
    ['third', 'first', 'fourth'],
  )
})

test('선택된 경험이 없으면 최신 프로젝트 3개를 표시한다', () => {
  const experiences = [
    createExperience('old-project', 'project', '2024-01-01'),
    createExperience('new-project', 'project', '2025-03-01'),
    createExperience('latest-project', 'project', '2025-04-01'),
    createExperience('middle-project', 'project', '2025-02-01'),
    createExperience('latest-activity', 'activity', '2026-01-01'),
  ]

  assert.deepEqual(
    selectHomepageExperiences(experiences, []).map(({ id }) => id),
    ['latest-project', 'new-project', 'middle-project'],
  )
})

test('저장된 선택이 더는 존재하지 않으면 최신 프로젝트로 대체한다', () => {
  const experiences = [
    createExperience('older', 'project', '2024-01-01'),
    createExperience('newer', 'project', '2025-01-01'),
  ]

  assert.deepEqual(
    selectHomepageExperiences(experiences, ['deleted-experience']).map(
      ({ id }) => id,
    ),
    ['newer', 'older'],
  )
})
