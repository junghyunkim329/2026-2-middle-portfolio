import { ExperienceCard } from '@/components/experience-card'
import { SiteFooter, SiteHeader } from '@/components/site-header'
import { getExperiences } from '@/lib/experiences'

export default async function ExperiencePage() {
  const experiences = await getExperiences()
  return (
    <>
      <SiteHeader />
      <main className="experience-page">
        <h1>Experience</h1>
        <div className="card-grid">
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
