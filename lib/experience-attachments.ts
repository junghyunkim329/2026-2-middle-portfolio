export const MAX_EXPERIENCE_ATTACHMENTS = 10

export const EXPERIENCE_ATTACHMENT_KINDS = [
  'image',
  'video',
  'pdf',
  'presentation',
  'link',
] as const

export type ExperienceAttachmentKind =
  (typeof EXPERIENCE_ATTACHMENT_KINDS)[number]

export type ExperienceAttachment = {
  kind: ExperienceAttachmentKind
  title: string
  url: string
}

type DirectUploadRule = {
  extension: string
  kind: Extract<ExperienceAttachmentKind, 'image' | 'video'>
  maximumSizeInBytes: number
}

const directUploadRules: Record<string, DirectUploadRule> = {
  'image/jpeg': {
    extension: 'jpg',
    kind: 'image',
    maximumSizeInBytes: 5 * 1024 * 1024,
  },
  'image/png': {
    extension: 'png',
    kind: 'image',
    maximumSizeInBytes: 5 * 1024 * 1024,
  },
  'image/webp': {
    extension: 'webp',
    kind: 'image',
    maximumSizeInBytes: 5 * 1024 * 1024,
  },
  'image/gif': {
    extension: 'gif',
    kind: 'image',
    maximumSizeInBytes: 10 * 1024 * 1024,
  },
  'video/mp4': {
    extension: 'mp4',
    kind: 'video',
    maximumSizeInBytes: 50 * 1024 * 1024,
  },
  'video/webm': {
    extension: 'webm',
    kind: 'video',
    maximumSizeInBytes: 50 * 1024 * 1024,
  },
}

export const DIRECT_UPLOAD_CONTENT_TYPES = Object.keys(directUploadRules)

export function getDirectUploadRule(contentType: string) {
  return directUploadRules[contentType]
}

export function getDirectUploadRuleFromPathname(pathname: string) {
  const extension = pathname.split('.').pop()?.toLowerCase()
  if (!extension) return undefined

  const entry = Object.entries(directUploadRules).find(
    ([, rule]) => rule.extension === extension,
  )
  if (!entry) return undefined

  const [contentType, rule] = entry
  return { contentType, ...rule }
}

function isAttachmentKind(value: string): value is ExperienceAttachmentKind {
  return EXPERIENCE_ATTACHMENT_KINDS.some((kind) => kind === value)
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function parseExperienceAttachments(
  kinds: unknown[],
  titles: unknown[],
  urls: unknown[],
): ExperienceAttachment[] | string {
  if (kinds.length !== titles.length || kinds.length !== urls.length) {
    return '첨부 자료 정보가 올바르지 않습니다.'
  }
  if (kinds.length > MAX_EXPERIENCE_ATTACHMENTS) {
    return `첨부 자료는 최대 ${MAX_EXPERIENCE_ATTACHMENTS}개까지 등록할 수 있습니다.`
  }

  const attachments: ExperienceAttachment[] = []
  for (let index = 0; index < kinds.length; index += 1) {
    const rawKind = kinds[index]
    const rawTitle = titles[index]
    const rawUrl = urls[index]
    const kind = typeof rawKind === 'string' ? rawKind.trim() : ''
    const title = typeof rawTitle === 'string' ? rawTitle.trim() : ''
    const url = typeof rawUrl === 'string' ? rawUrl.trim() : ''

    if (!isAttachmentKind(kind)) {
      return '지원하지 않는 첨부 자료 형식입니다.'
    }
    if (!title || !url) {
      return '첨부 자료 이름과 주소를 모두 입력해주세요.'
    }
    if (!isHttpUrl(url)) {
      return '첨부 자료 주소는 http:// 또는 https:// 로 시작해야 합니다.'
    }

    attachments.push({ kind, title, url })
  }

  return attachments
}

export function normalizeExperienceAttachments(
  value: unknown,
): ExperienceAttachment[] {
  if (!Array.isArray(value)) return []

  return value
    .slice(0, MAX_EXPERIENCE_ATTACHMENTS)
    .flatMap((item) => {
      if (!item || typeof item !== 'object') return []
      const candidate = item as Record<string, unknown>
      const parsed = parseExperienceAttachments(
        [candidate.kind],
        [candidate.title],
        [candidate.url],
      )
      return typeof parsed === 'string' ? [] : parsed
    })
}
