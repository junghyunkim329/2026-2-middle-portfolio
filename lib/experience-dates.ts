export function isValidDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const [, year, month, day] = match
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day))
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  )
}

export function formatExperienceDate(startDate: string, endDate?: string) {
  const format = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return `${year}년 ${month}월 ${day}일`
  }

  return endDate
    ? `${format(startDate)} ~ ${format(endDate)}`
    : format(startDate)
}

export function toDateInputValue(value?: string) {
  if (!value) return ''
  if (isValidDateInput(value)) return value

  const koreanDate = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일$/.exec(value)
  if (koreanDate) {
    const [, year, month, day] = koreanDate
    const parsed = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    return isValidDateInput(parsed) ? parsed : ''
  }

  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return ''

  const parsedDate = new Date(timestamp)
  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
