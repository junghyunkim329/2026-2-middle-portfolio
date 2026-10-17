export function moveExperienceSection<T>(
  sections: readonly T[],
  index: number,
  direction: -1 | 1,
): T[] {
  const destination = index + direction
  if (
    index < 0 ||
    index >= sections.length ||
    destination < 0 ||
    destination >= sections.length
  ) {
    return [...sections]
  }

  const reordered = [...sections]
  reordered.splice(destination, 0, ...reordered.splice(index, 1))
  return reordered
}
