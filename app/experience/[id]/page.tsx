import { notFound } from 'next/navigation'
import { SiteFooter, SiteHeader } from '@/components/site-header'
import { getExperience, getExperiences } from '@/lib/experiences'

export async function generateStaticParams() {
  return (await getExperiences()).map(({ id }) => ({ id }))
}

export default async function ExperienceDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const experience = await getExperience(id)
  if (!experience) notFound()
  return (
    <>
      <SiteHeader />
      <main className="article-page">
        <header className="article-heading">
          <p>{experience.date}</p>
          <h1>{experience.title}</h1>
          <span>Author, {experience.author}</span>
        </header>
        <img className="article-image" src={experience.image} alt="" />
        <div className="article-body">
          {experience.sections.slice(0, 2).map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <blockquote>“{experience.quote}”</blockquote>
          {experience.sections.slice(2).map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
