import assert from 'node:assert/strict'
import test from 'node:test'
import { moveExperienceSection } from './experience-sections.ts'

test('경험 내용 블록을 지정한 방향으로 한 칸 이동한다', () => {
  const first = { key: 'first' }
  const second = { key: 'second' }
  const third = { key: 'third' }

  assert.deepEqual(
    moveExperienceSection([first, second, third], 1, -1),
    [second, first, third],
  )
  assert.deepEqual(
    moveExperienceSection([first, second, third], 1, 1),
    [first, third, second],
  )
})

test('첫 블록을 위로 또는 마지막 블록을 아래로 이동하면 순서를 유지한다', () => {
  const sections = [{ key: 'first' }, { key: 'second' }]

  assert.deepEqual(moveExperienceSection(sections, 0, -1), sections)
  assert.deepEqual(moveExperienceSection(sections, 1, 1), sections)
})
