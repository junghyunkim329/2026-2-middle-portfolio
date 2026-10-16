import { ExperienceCard } from '@/components/experience-card'
import { SiteFooter, SiteHeader } from '@/components/site-header'
import { getExperiences } from '@/lib/experiences'

export default async function Home() {
  const experiences = await getExperiences()
  return (
    <>
      <SiteHeader />
      <main>
        <section className="about">
          <h1>About me</h1>
          <div className="intro">
            <img src="/main.png" alt="오늘의 기록을 상징하는 캐릭터" />
            <div>
              <h2>Introduction</h2>
              <p>
                중부대학교 정보보호학전공에 재학중인 김정현입니다
                <br />
                웹개발부터 시스템 해킹까지 공부하였으며
                <br />
                현재는 차량 보안 솔루션 개발 공부를 하고 있습니다
              </p>
            </div>
          </div>
        </section>
        {/* <section className="interests">
          <h2>Interests and hobbies</h2>
          <p className="section-lede">
            A little section to round out the professional purpose of this
            webpage. Who&apos;s the person behind it, really? What do they
            like—and what are they like? Sections like this can go a little bit
            longer because it&apos;s nice to learn more about what makes someone
            tick.
          </p>
          <div className="card-grid">
            {experiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        </section> */}
      </main>
      <SiteFooter />
    </>
  )
}
