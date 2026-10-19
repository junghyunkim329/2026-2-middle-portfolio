export function rankExperienceTags(
  experiences: ReadonlyArray<{ tags: readonly string[] }>,
) {
  const tagCounts = new Map<string, { count: number; firstSeen: number }>()
  let firstSeen = 0

  for (const experience of experiences) {
    for (const tag of new Set(experience.tags)) {
      const existing = tagCounts.get(tag)
      if (existing) {
        existing.count += 1
        continue
      }

      tagCounts.set(tag, { count: 1, firstSeen })
      firstSeen += 1
    }
  }

  return [...tagCounts.entries()]
    .sort(
      ([, first], [, second]) =>
        second.count - first.count || first.firstSeen - second.firstSeen,
    )
    .map(([tag]) => tag)
}
