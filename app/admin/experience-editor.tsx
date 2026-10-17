'use client'

import { uploadPresigned } from '@vercel/blob/client'
import { useActionState, useEffect, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { saveExperience, type AdminActionState } from './actions'
import type { Experience } from '@/lib/experiences'
import {
  createTemplateSections,
  EXPERIENCE_TEMPLATE_IDS,
  EXPERIENCE_TEMPLATES,
  type ExperienceTemplateId,
} from '@/lib/experience-templates'
import { toDateInputValue } from '@/lib/experience-dates'
import {
  getDirectUploadRule,
  MAX_EXPERIENCE_ATTACHMENTS,
  type ExperienceAttachment,
  type ExperienceAttachmentKind,
} from '@/lib/experience-attachments'
import { moveExperienceSection } from '@/lib/experience-sections'

const initialState: AdminActionState = {}
const maximumCoverImageSize = 5 * 1024 * 1024

type EditableAttachment = ExperienceAttachment & { key: string }

function createEditableAttachment(
  attachment: ExperienceAttachment,
): EditableAttachment {
  return { ...attachment, key: crypto.randomUUID() }
}

export function ExperienceEditor({
  experience,
}: {
  experience: Experience | null
}) {
  const [state, formAction, pending] = useActionState(
    saveExperience,
    initialState,
  )
  const [template, setTemplate] = useState<ExperienceTemplateId>(
    experience?.template ?? 'project',
  )
  const [sections, setSections] = useState(
    (experience?.sections ?? createTemplateSections('project')).map(
      (section, index) => ({ ...section, key: `section-${index}` }),
    ),
  )
  const [image, setImage] = useState(experience?.image ?? '')
  const [attachments, setAttachments] = useState<EditableAttachment[]>(() =>
    (experience?.attachments ?? []).map(createEditableAttachment),
  )
  const [uploading, setUploading] = useState(false)
  const [uploadingArea, setUploadingArea] = useState<
    'cover' | 'attachments' | null
  >(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [attachmentUploadError, setAttachmentUploadError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (state.success) router.push('/admin?status=saved')
  }, [router, state.success])

  function selectTemplate(nextTemplate: ExperienceTemplateId) {
    if (nextTemplate === template) return

    const currentHeadings = EXPERIENCE_TEMPLATES[template].headings
    const hasEditedSections =
      sections.length !== currentHeadings.length ||
      sections.some(
        (section, index) =>
          section.body.trim() || section.heading !== currentHeadings[index],
      )

    if (
      hasEditedSections &&
      !window.confirm(
        '템플릿을 변경하면 현재 경험 내용이 새 템플릿 항목으로 교체됩니다. 계속할까요?',
      )
    ) {
      return
    }

    setTemplate(nextTemplate)
    setSections(
      createTemplateSections(nextTemplate).map((section) => ({
        ...section,
        key: crypto.randomUUID(),
      })),
    )
  }

  async function uploadCoverImage(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    const uploadRule = getDirectUploadRule(file.type)
    if (!uploadRule || uploadRule.kind !== 'image') {
      setUploadError('JPG, PNG, WebP, GIF 형식의 이미지 파일만 업로드할 수 있습니다.')
      input.value = ''
      return
    }
    if (file.size > maximumCoverImageSize) {
      setUploadError('이미지는 5MB 이하로 업로드해주세요.')
      input.value = ''
      return
    }

    setUploading(true)
    setUploadingArea('cover')
    setUploadError('')
    setUploadProgress(0)
    try {
      const blob = await uploadPresigned(
        `experience-images/${crypto.randomUUID()}.${uploadRule.extension}`,
        file,
        {
          access: 'public',
          handleUploadUrl: '/admin/api/upload',
          contentType: file.type,
          onUploadProgress: ({ percentage }) =>
            setUploadProgress(Math.round(percentage)),
        },
      )
      setImage(blob.url)
    } catch (error) {
      console.error('Failed to upload experience image:', error)
      setUploadError(
        '사진 업로드에 실패했습니다. Blob 저장소 설정과 연결을 확인해주세요.',
      )
    } finally {
      setUploading(false)
      setUploadingArea(null)
      input.value = ''
    }
  }

  async function uploadAttachments(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const files = Array.from(input.files ?? [])
    if (!files.length) return

    if (attachments.length + files.length > MAX_EXPERIENCE_ATTACHMENTS) {
      setAttachmentUploadError(
        `첨부 자료는 최대 ${MAX_EXPERIENCE_ATTACHMENTS}개까지 등록할 수 있습니다.`,
      )
      input.value = ''
      return
    }

    const uploadItems = files.map((file) => ({
      file,
      rule: getDirectUploadRule(file.type),
    }))
    if (uploadItems.some(({ rule }) => !rule)) {
      setAttachmentUploadError(
        'JPG, PNG, WebP, GIF, MP4, WebM 파일만 직접 업로드할 수 있습니다.',
      )
      input.value = ''
      return
    }
    const oversized = uploadItems.find(
      ({ file, rule }) => rule && file.size > rule.maximumSizeInBytes,
    )
    if (oversized?.rule) {
      setAttachmentUploadError(
        `${oversized.file.name}의 크기가 제한을 초과했습니다. 사진은 5MB, GIF는 10MB, 동영상은 50MB 이하로 올려주세요.`,
      )
      input.value = ''
      return
    }

    setUploading(true)
    setUploadingArea('attachments')
    setAttachmentUploadError('')
    setUploadProgress(0)
    try {
      for (const [index, item] of uploadItems.entries()) {
        const rule = item.rule
        if (!rule) continue
        const blob = await uploadPresigned(
          `experience-media/${crypto.randomUUID()}.${rule.extension}`,
          item.file,
          {
            access: 'public',
            handleUploadUrl: '/admin/api/upload',
            contentType: item.file.type,
            onUploadProgress: ({ percentage }) =>
              setUploadProgress(
                Math.round(((index + percentage / 100) / files.length) * 100),
              ),
          },
        )
        const uploaded = createEditableAttachment({
          kind: rule.kind,
          title: item.file.name.replace(/\.[^.]+$/, ''),
          url: blob.url,
        })
        setAttachments((current) => [...current, uploaded])
      }
    } catch (error) {
      console.error('Failed to upload experience attachments:', error)
      setAttachmentUploadError(
        '첨부 파일 업로드에 실패했습니다. Blob 저장소 설정과 연결을 확인해주세요.',
      )
    } finally {
      setUploading(false)
      setUploadingArea(null)
      input.value = ''
    }
  }

  function addDocumentLink(
    kind: Extract<ExperienceAttachmentKind, 'pdf' | 'presentation'>,
  ) {
    if (attachments.length >= MAX_EXPERIENCE_ATTACHMENTS) {
      setAttachmentUploadError(
        `첨부 자료는 최대 ${MAX_EXPERIENCE_ATTACHMENTS}개까지 등록할 수 있습니다.`,
      )
      return
    }
    setAttachmentUploadError('')
    setAttachments((current) => [
      ...current,
      createEditableAttachment({ kind, title: '', url: '' }),
    ])
  }

  function updateAttachment(
    key: string,
    field: 'title' | 'url',
    value: string,
  ) {
    setAttachments((current) =>
      current.map((attachment) =>
        attachment.key === key
          ? { ...attachment, [field]: value }
          : attachment,
      ),
    )
  }

  return (
    <form className="admin-form experience-editor" action={formAction}>
      {experience && (
        <input name="originalId" type="hidden" value={experience.id} />
      )}
      <fieldset className="admin-template-picker">
        <legend>작성 템플릿</legend>
        <p>경험 유형을 선택하면 권장 소제목이 자동으로 준비됩니다.</p>
        <div className="admin-template-options">
          {EXPERIENCE_TEMPLATE_IDS.map((templateId) => {
            const templateOption = EXPERIENCE_TEMPLATES[templateId]
            return (
              <label
                className={template === templateId ? 'selected' : ''}
                key={templateId}
              >
                <input
                  checked={template === templateId}
                  name="template"
                  onChange={() => selectTemplate(templateId)}
                  type="radio"
                  value={templateId}
                />
                <span>
                  <strong>{templateOption.label}</strong>
                  <small>{templateOption.description}</small>
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <div className="admin-form-grid">
        <label>
          URL ID
          <input
            defaultValue={experience?.id}
            name="id"
            placeholder="예: vehicle-security"
            required
          />
        </label>
        <label>
          제목
          <input defaultValue={experience?.title} name="title" required />
        </label>
        <label className="admin-field-wide">
          한 줄 소개
          <textarea
            defaultValue={experience?.description}
            name="description"
            required
            rows={2}
          />
        </label>
        <label className="admin-field-wide">
          대표 이미지 URL
          <input
            onChange={(event) => setImage(event.target.value)}
            name="image"
            placeholder="https://... 또는 /image.jpg"
            required
            value={image}
          />
          <span className="admin-field-hint">
            목록 카드와 상세 페이지 상단에 표시되는 필수 이미지입니다. 5MB 이하의
            JPG, PNG, WebP, GIF를 사용할 수 있습니다.
          </span>
          <input
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={uploadCoverImage}
            type="file"
          />
          {uploadingArea === 'cover' && (
            <span className="admin-image-upload-status" aria-live="polite">
              대표 이미지 업로드 중... {uploadProgress}%
            </span>
          )}
          {uploadError && (
            <span className="admin-image-upload-error" role="alert">
              {uploadError}
            </span>
          )}
          {image && (
            <img
              className="admin-image-preview"
              src={image}
              alt="경험 사진 미리보기"
            />
          )}
        </label>
        <div className="admin-attachments admin-field-wide">
          <div className="admin-attachments-heading">
            <div>
              <strong>추가 자료</strong>
              <span className="admin-field-hint">
                사진·GIF·동영상은 직접 업로드하고, PDF·PPT는 공개 공유 링크를
                등록합니다. ({attachments.length}/{MAX_EXPERIENCE_ATTACHMENTS})
              </span>
            </div>
            <div className="admin-attachment-actions">
              <button
                className="admin-secondary-button"
                disabled={uploading}
                onClick={() => addDocumentLink('pdf')}
                type="button"
              >
                PDF 링크 추가
              </button>
              <button
                className="admin-secondary-button"
                disabled={uploading}
                onClick={() => addDocumentLink('presentation')}
                type="button"
              >
                PPT 링크 추가
              </button>
            </div>
          </div>
          <input
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            disabled={uploading || attachments.length >= MAX_EXPERIENCE_ATTACHMENTS}
            multiple
            onChange={uploadAttachments}
            type="file"
          />
          <span className="admin-field-hint">
            여러 파일을 한 번에 선택할 수 있습니다. 사진 5MB, GIF 10MB,
            MP4·WebM 동영상 50MB 이하만 가능합니다.
          </span>
          {uploadingArea === 'attachments' && (
            <span className="admin-image-upload-status" aria-live="polite">
              첨부 파일 업로드 중... {uploadProgress}%
            </span>
          )}
          {attachmentUploadError && (
            <span className="admin-image-upload-error" role="alert">
              {attachmentUploadError}
            </span>
          )}
          <div className="admin-attachment-list">
            {attachments.map((attachment, index) => (
              <article className="admin-attachment-item" key={attachment.key}>
                {attachment.kind === 'image' && attachment.url && (
                  <img src={attachment.url} alt="" />
                )}
                {attachment.kind === 'video' && attachment.url && (
                  <video src={attachment.url} muted preload="metadata" />
                )}
                <div className="admin-attachment-fields">
                  <span className="admin-attachment-type">
                    {attachment.kind === 'image'
                      ? '사진/GIF'
                      : attachment.kind === 'video'
                        ? '동영상'
                        : attachment.kind === 'pdf'
                          ? 'PDF 링크'
                          : 'PPT 링크'}{' '}
                    · 자료 {index + 1}
                  </span>
                  <input name="attachmentKind" type="hidden" value={attachment.kind} />
                  <label>
                    자료 이름
                    <input
                      name="attachmentTitle"
                      onChange={(event) =>
                        updateAttachment(attachment.key, 'title', event.target.value)
                      }
                      placeholder="예: 프로젝트 시연 영상"
                      required
                      value={attachment.title}
                    />
                  </label>
                  {attachment.kind === 'pdf' ||
                  attachment.kind === 'presentation' ? (
                    <label>
                      공개 공유 링크
                      <input
                        name="attachmentUrl"
                        onChange={(event) =>
                          updateAttachment(attachment.key, 'url', event.target.value)
                        }
                        placeholder="https://drive.google.com/..."
                        required
                        type="url"
                        value={attachment.url}
                      />
                    </label>
                  ) : (
                    <input name="attachmentUrl" type="hidden" value={attachment.url} />
                  )}
                  <button
                    className="admin-text-button"
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter((item) => item.key !== attachment.key),
                      )
                    }
                    type="button"
                  >
                    이 자료 삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="admin-date-fields admin-field-wide">
          <label>
            시작 날짜
            <input
              defaultValue={toDateInputValue(
                experience?.startDate ?? experience?.date,
              )}
              name="startDate"
              required
              type="date"
            />
          </label>
          <label>
            종료 날짜 (선택)
            <input
              defaultValue={toDateInputValue(experience?.endDate)}
              name="endDate"
              type="date"
            />
          </label>
          <span className="admin-field-hint">
            하루 일정은 시작 날짜만 선택하고, 기간은 종료 날짜도 선택해주세요.
          </span>
        </div>
        <label className="admin-field-wide">
          분류 태그
          <input
            defaultValue={experience?.tags.join(', ')}
            name="tags"
            placeholder="정보 보안, 해킹"
            required
          />
          <span className="admin-field-hint">태그는 쉼표로 구분합니다.</span>
        </label>
        <label className="admin-field-wide">
          참고 링크 (선택)
          <input
            defaultValue={experience?.referenceLink}
            name="referenceLink"
            placeholder="https://example.com"
            type="url"
          />
          <span className="admin-field-hint">
            입력하면 경험 상세 페이지에 새 탭으로 여는 링크가 표시됩니다.
          </span>
        </label>
        <label className="admin-field-wide">
          인용 문구 (선택)
          <textarea
            defaultValue={experience?.quote}
            name="quote"
            placeholder="인용 문구를 입력하지 않으면 표시되지 않습니다."
            rows={2}
          />
          <span className="admin-field-hint">
            입력하면 경험 상세 페이지에 표시됩니다.
          </span>
        </label>
      </div>

      <div className="admin-sections-heading">
        <h3>경험 내용</h3>
        <button
          className="admin-secondary-button"
          onClick={() =>
            setSections((current) => [
              ...current,
              { heading: '', body: '', key: crypto.randomUUID() },
            ])
          }
          type="button"
        >
          내용 추가
        </button>
      </div>
      <div className="admin-section-list">
        {sections.map((section, index) => (
          <fieldset className="admin-section-fieldset" key={section.key}>
            <legend>내용 {index + 1}</legend>
            <label>
              소제목
              <input
                onChange={(event) =>
                  setSections((current) =>
                    current.map((item, sectionIndex) =>
                      sectionIndex === index
                        ? { ...item, heading: event.target.value }
                        : item,
                    ),
                  )
                }
                name="sectionHeading"
                required
                value={section.heading}
              />
            </label>
            <label>
              본문
              <textarea
                onChange={(event) =>
                  setSections((current) =>
                    current.map((item, sectionIndex) =>
                      sectionIndex === index
                        ? { ...item, body: event.target.value }
                        : item,
                    ),
                  )
                }
                name="sectionBody"
                required
                rows={4}
                value={section.body}
              />
            </label>
            {sections.length > 1 && (
              <div className="admin-section-actions">
                <button
                  aria-label={`내용 ${index + 1} 위로 이동`}
                  className="admin-text-button"
                  disabled={index === 0}
                  onClick={() =>
                    setSections((current) =>
                      moveExperienceSection(current, index, -1),
                    )
                  }
                  type="button"
                >
                  ↑ 위로
                </button>
                <button
                  aria-label={`내용 ${index + 1} 아래로 이동`}
                  className="admin-text-button"
                  disabled={index === sections.length - 1}
                  onClick={() =>
                    setSections((current) =>
                      moveExperienceSection(current, index, 1),
                    )
                  }
                  type="button"
                >
                  ↓ 아래로
                </button>
                <button
                  className="admin-delete-button admin-text-button"
                  onClick={() =>
                    setSections((current) =>
                      current.filter(
                        (_, sectionIndex) => sectionIndex !== index,
                      ),
                    )
                  }
                  type="button"
                >
                  이 내용 삭제
                </button>
              </div>
            )}
          </fieldset>
        ))}
      </div>
      {state.error && <p className="admin-form-message">{state.error}</p>}
      <button
        className="admin-primary-button"
        disabled={pending || uploading}
        type="submit"
      >
        {uploading ? '파일 업로드 중...' : pending ? '저장 중...' : '경험 저장'}
      </button>
    </form>
  )
}
