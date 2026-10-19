import assert from 'node:assert/strict'
import test from 'node:test'
import { rankExperienceTags } from './experience-tags.ts'

test('태그를 사용한 경험 수가 많은 순서로 정렬하고 동률이면 처음 등장한 순서를 유지한다', () => {
  const experiences = [
    { tags: ['개발', '보안', 'Python'] },
    { tags: ['개발', '보안', 'React'] },
    { tags: ['개발', 'React', 'Docker'] },
    { tags: ['CTF', 'Wargame'] },
    { tags: ['CTF', 'PWN'] },
  ]

  assert.deepEqual(rankExperienceTags(experiences), [
    '개발',
    '보안',
    'React',
    'CTF',
    'Python',
    'Docker',
    'Wargame',
    'PWN',
  ])
})
