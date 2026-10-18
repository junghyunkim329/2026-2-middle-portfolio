import Link from 'next/link'
import { AdminLoginForm } from './admin-login-form'
import { logoutAdmin } from './actions'
import { DeleteExperienceForm } from './delete-experience-form'
import { ExperienceEditor } from './experience-editor'
import { hasAdminSession, isAdminConfigured } from '@/lib/admin-auth'
import {
  getDatabaseExperiences,
  getHomepageFeaturedExperienceIds,
  type Experience,
} from '@/lib/experiences'
import { getExperienceTemplateLabel } from '@/lib/experience-templates'
import { listPublicImagePaths } from '@/lib/public-images'
import { FeaturedExperiencesForm } from './featured-experiences-form'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; status?: string }>
}) {
  const params = await searchParams
  const authenticated = await hasAdminSession()

  if (!authenticated) {
    return (
      <main className="admin-page">
        <div className="admin-panel admin-login-panel">
          <Link className="admin-back-link" href="/">
            ← 포트폴리오로 돌아가기
          </Link>
          <p className="admin-eyebrow">ADMIN</p>
          <h1>관리자 로그인</h1>
          <p className="admin-description">
            경험 데이터를 관리하려면 관리자 비밀번호를 입력하세요.
          </p>
          {!isAdminConfigured() && (
            <p className="admin-notice">
              서버 환경 변수 <code>ADMIN_PASSWORD</code>와{' '}
              <code>ADMIN_SESSION_SECRET</code>(32자 이상)을 설정해야 로그인할
              수 있습니다.
            </p>
          )}
          <AdminLoginForm />
        </div>
      </main>
    )
  }

  if (!process.env.MONGODB_URI) {
    return (
      <main className="admin-page">
        <div className="admin-panel">
          <AdminTopBar />
          <h1>경험 관리</h1>
          <p className="admin-notice">
            경험을 저장하려면 서버 환경 변수 <code>MONGODB_URI</code>를
            설정해주세요.
          </p>
        </div>
      </main>
    )
  }

  let experiences: Experience[]
  let featuredExperienceIds: string[] = []
  let availableImages: string[] = []
  let databaseError = false
  try {
    const [loadedExperiences, loadedFeaturedExperienceIds, publicImagePaths] =
      await Promise.all([
        getDatabaseExperiences(),
        getHomepageFeaturedExperienceIds(),
        listPublicImagePaths(),
      ])
    experiences = loadedExperiences
    featuredExperienceIds = loadedFeaturedExperienceIds
    availableImages = publicImagePaths
  } catch (error) {
    console.error('Failed to load admin experiences:', error)
    experiences = []
    databaseError = true
  }
  const validFeaturedExperienceIds = featuredExperienceIds
    .filter((id) => experiences.some((experience) => experience.id === id))
    .slice(0, 3)

  const selectedExperience = params.edit
    ? experiences.find((experience) => experience.id === params.edit) ?? null
    : null
  const showEditor = params.new === '1' || Boolean(params.edit)

  return (
    <main className="admin-page">
      <div className="admin-panel admin-dashboard">
        <AdminTopBar />
        <div className="admin-title-row">
          <div>
            <p className="admin-eyebrow">CONTENT MANAGEMENT</p>
            <h1>경험 관리</h1>
          </div>
          <Link className="admin-primary-button" href="/admin?new=1">
            새 경험 추가
          </Link>
        </div>
        {params.status === 'saved' && (
          <p className="admin-success-message">경험을 저장했습니다.</p>
        )}
        {params.status === 'deleted' && (
          <p className="admin-success-message">경험을 삭제했습니다.</p>
        )}
        {databaseError && (
          <p className="admin-notice">
            DB에서 경험을 불러오지 못했습니다. 연결 설정을 확인해주세요.
          </p>
        )}
        <section className="admin-featured-section">
          <div className="admin-section-title">
            <h2>홈 화면에 표시할 경험</h2>
            <span>{validFeaturedExperienceIds.length}/3개 선택</span>
          </div>
          <p className="admin-description">
            최대 3개까지 선택할 수 있습니다. 선택하지 않으면 최신 프로젝트
            3개가 표시됩니다.
          </p>
          <FeaturedExperiencesForm
            experiences={experiences}
            selectedIds={validFeaturedExperienceIds}
          />
        </section>
        {showEditor && (
          <section className="admin-editor-panel">
            <div className="admin-section-title">
              <h2>{selectedExperience ? '경험 수정' : '새 경험'}</h2>
              <Link className="admin-text-button" href="/admin">
                닫기
              </Link>
            </div>
            {params.edit && !selectedExperience ? (
              <p className="admin-notice">수정할 경험을 찾을 수 없습니다.</p>
            ) : (
              <ExperienceEditor
                availableImages={availableImages}
                experience={selectedExperience}
                key={selectedExperience?.id ?? 'new-experience'}
              />
            )}
          </section>
        )}
        <section className="admin-experience-list">
          <div className="admin-section-title">
            <h2>등록된 경험</h2>
            <span>{experiences.length}개</span>
          </div>
          {experiences.length === 0 && !databaseError ? (
            <p className="admin-empty">아직 등록된 경험이 없습니다.</p>
          ) : (
            <ul>
              {experiences.map((experience) => (
                <li className="admin-experience-row" key={experience.id}>
                  <div className="admin-experience-copy">
                    <strong>{experience.title}</strong>
                    <small>
                      {getExperienceTemplateLabel(experience.template)}
                    </small>
                    <span>{experience.tags.join(' · ')}</span>
                  </div>
                  <div className="admin-row-actions">
                    <Link
                      className="admin-secondary-button"
                      href={`/admin?edit=${encodeURIComponent(experience.id)}`}
                    >
                      수정
                    </Link>
                    <DeleteExperienceForm id={experience.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

function AdminTopBar() {
  return (
    <div className="admin-top-bar">
      <Link className="admin-back-link" href="/">
        ← 포트폴리오
      </Link>
      <form action={logoutAdmin}>
        <button className="admin-text-button" type="submit">
          로그아웃
        </button>
      </form>
    </div>
  )
}
