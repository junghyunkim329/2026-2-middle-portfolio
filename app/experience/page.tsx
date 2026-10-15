import { ExperienceList } from '@/components/experience-list'
import { SiteFooter, SiteHeader } from '@/components/site-header'
import { getExperiences } from '@/lib/experiences'

export default async function ExperiencePage() {
  const experiences = await getExperiences()
  return (
    <>
      <SiteHeader />
      <main className="experience-page">
        <h1>Experience</h1>

        <ExperienceList experiences={experiences} />
      </main>
      <SiteFooter />
    </>
  )
}
