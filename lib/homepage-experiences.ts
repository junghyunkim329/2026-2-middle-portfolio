import type { Experience } from './experiences'
import { toDateInputValue } from './experience-dates.ts'

export function selectHomepageExperiences(
  allExperiences: Experience[],
  featuredIds: string[],
) {
  if (featuredIds.length > 0) {
    const experiencesById = new Map(
      allExperiences.map((experience) => [experience.id, experience]),
    )
    const selected = featuredIds
      .map((id) => experiencesById.get(id))
      .filter((experience): experience is Experience => Boolean(experience))
      .slice(0, 3)
    if (selected.length > 0) return selected
  }

  return allExperiences
    .filter((experience) => experience.template === 'project')
    .sort((first, second) => {
      const firstDate = toDateInputValue(first.startDate ?? first.date)
      const secondDate = toDateInputValue(second.startDate ?? second.date)
      return secondDate.localeCompare(firstDate)
    })
    .slice(0, 3)
}
