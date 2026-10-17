'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ExperienceCard } from '@/components/experience-card'
import type { Experience } from '@/lib/experiences'

export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('전체')

  const tags = useMemo(
    () => [
      '전체',
      ...new Set(experiences.flatMap((experience) => experience.tags)),
    ],
    [experiences],
  )
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
        <div className="experience-filters" aria-label="태그로 필터">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={selectedTag === tag ? 'active' : ''}
              aria-pressed={selectedTag === tag}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
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
