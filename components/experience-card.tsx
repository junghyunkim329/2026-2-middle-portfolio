import Link from 'next/link'
import type { Experience } from '@/lib/experiences'
import { getExperienceTemplateLabel } from '@/lib/experience-templates'

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <Link
      className="experience-card"
      href={`/experience/${experience.id}`}
    >
      <img src={experience.image} alt="" />
      <div className="card-copy">
        <span className="experience-type-badge">
          {getExperienceTemplateLabel(experience.template)}
        </span>
        <h2>{experience.title}</h2>
        <p>{experience.description}</p>
        <span className="card-details-link">자세히 보기 →</span>
      </div>
    </Link>
  )
}
