import { notFound } from 'next/navigation'
import { ExperienceBackButton } from '@/components/experience-back-button'
import { SiteFooter, SiteHeader } from '@/components/site-header'
import { getExperience, getExperiences } from '@/lib/experiences'
import { getExperienceTemplateLabel } from '@/lib/experience-templates'

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
        <ExperienceBackButton />
        <header className="article-heading">
          <p>
            {getExperienceTemplateLabel(experience.template)} · {experience.date}
          </p>
          <h1>{experience.title}</h1>
        </header>
        <img className="article-image" src={experience.image} alt="" />
        <div className="article-body">
          {experience.sections.slice(0).map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          {/* {experience.sections.slice(2).map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))} */}
          {experience.attachments.length > 0 && (
            <section className="article-attachments">
              <h2>첨부 자료</h2>
              <div className="article-attachment-list">
                {experience.attachments.map((attachment, index) => {
                  const key = `${attachment.kind}-${attachment.url}-${index}`
                  if (attachment.kind === 'image') {
                    return (
                      <figure className="article-attachment-media" key={key}>
                        <img src={attachment.url} alt={attachment.title} />
                        <figcaption>{attachment.title}</figcaption>
                      </figure>
                    )
                  }
                  if (attachment.kind === 'video') {
                    return (
                      <figure className="article-attachment-media" key={key}>
                        <video controls playsInline preload="metadata" src={attachment.url}>
                          브라우저가 동영상 재생을 지원하지 않습니다.
                        </video>
                        <figcaption>{attachment.title}</figcaption>
                      </figure>
                    )
                  }
                  return (
                    <a
                      className="article-attachment-link"
                      href={attachment.url}
                      key={key}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <span>
                        {attachment.kind === 'pdf'
                          ? 'PDF'
                          : attachment.kind === 'presentation'
                            ? 'PPT'
                            : 'URL'}
                      </span>
                      <strong>{attachment.title}</strong>
                      <small>새 탭에서 보기 ↗</small>
                    </a>
                  )
                })}
              </div>
            </section>
          )}
          {experience.quote && <blockquote>“{experience.quote}”</blockquote>}
          {experience.referenceLink && (
            <a
              className="article-reference-link"
              href={experience.referenceLink}
              rel="noopener noreferrer"
              target="_blank"
            >
              참고 링크 보기 ↗
            </a>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
