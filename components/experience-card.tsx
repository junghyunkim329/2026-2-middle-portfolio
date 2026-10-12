import Link from 'next/link'
import type { Experience } from '@/lib/experiences'

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="experience-card">
      <img src={experience.image} alt="" />
      <div className="card-copy">
        <h2>{experience.title}</h2>
        <p>{experience.description}</p>
        <Link href={`/experience/${experience.id}`}>자세히 보기 →</Link>
      </div>
    </article>
  )
}
