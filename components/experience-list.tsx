'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ExperienceCard } from '@/components/experience-card'
import { rankExperienceTags } from '@/lib/experience-tags'
import type { Experience } from '@/lib/experiences'

const POPULAR_TAG_COUNT = 7

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('전체')
  const [showAllTags, setShowAllTags] = useState(false)

  const rankedTags = useMemo(
    () => rankExperienceTags(experiences),
    [experiences],
  )
  const popularTags = rankedTags.slice(0, POPULAR_TAG_COUNT)
  const visibleTags = showAllTags
    ? rankedTags
    : selectedTag !== '전체' && !popularTags.includes(selectedTag)
      ? [...popularTags, selectedTag]
      : popularTags
  const hiddenTagCount = Math.max(0, rankedTags.length - POPULAR_TAG_COUNT)
  const filteredExperiences = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return experiences.filter((experience) => {
      const matchesTag =
        selectedTag === '전체' || experience.tags.includes(selectedTag)
      const searchableText = [
        experience.title,
        experience.description,
        experience.date,
        ...experience.tags,
      ]
        .join(' ')
        .toLocaleLowerCase()
      return matchesTag && searchableText.includes(normalizedQuery)
    })
  }, [experiences, query, selectedTag])

  return (
    <>
      <section className="experience-controls" aria-label="경험 검색 및 필터">
        <label className="experience-search">
          <Search size={20} aria-hidden="true" />
          <span className="sr-only">경험 검색</span>
          <input
            type="search"
            placeholder="경험이나 태그를 검색해보세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div
          id="experience-tag-options"
          className="experience-filters"
          aria-label="태그로 필터"
        >
          <button
            type="button"
            className={`experience-filter-option ${selectedTag === '전체' ? 'active' : ''}`}
            aria-pressed={selectedTag === '전체'}
            onClick={() => setSelectedTag('전체')}
          >
            전체
          </button>
          {visibleTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`experience-filter-option ${selectedTag === tag ? 'active' : ''}`}
              aria-pressed={selectedTag === tag}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
          {hiddenTagCount > 0 ? (
            <button
              type="button"
              className="experience-filter-toggle"
              aria-expanded={showAllTags}
              aria-controls="experience-tag-options"
              onClick={() => setShowAllTags((current) => !current)}
            >
              {showAllTags ? '접기' : `더보기 +${hiddenTagCount}`}
            </button>
          ) : null}
        </div>
      </section>
      <p className="experience-result-count" aria-live="polite">
        {filteredExperiences.length}개의 경험
      </p>
      {filteredExperiences.length ? (
        <div className="card-grid">
          {filteredExperiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      ) : (
        <p className="experience-empty">검색 결과가 없습니다.</p>
      )}
    </>
  )
}
