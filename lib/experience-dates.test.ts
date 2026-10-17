import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatExperienceDate,
  isValidDateInput,
  toDateInputValue,
} from './experience-dates.ts'

test('validates real calendar dates', () => {
  assert.equal(isValidDateInput('2024-02-29'), true)
  assert.equal(isValidDateInput('0001-01-01'), true)
  assert.equal(isValidDateInput('2025-02-29'), false)
  assert.equal(isValidDateInput('2025-13-01'), false)
})

test('formats single dates and date ranges for display', () => {
  assert.equal(formatExperienceDate('2025-01-01'), '2025년 1월 1일')
  assert.equal(
    formatExperienceDate('2025-01-01', '2025-01-03'),
    '2025년 1월 1일 ~ 2025년 1월 3일',
  )
})

test('converts previously saved date labels for editing', () => {
  assert.equal(toDateInputValue('2025-02-14'), '2025-02-14')
  assert.equal(toDateInputValue('2025년 2월 14일'), '2025-02-14')
  assert.equal(toDateInputValue('February 14, 2025'), '2025-02-14')
  assert.equal(toDateInputValue('not a date'), '')
})
