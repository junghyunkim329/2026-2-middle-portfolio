'use server'

import { ObjectId } from 'mongodb'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  clearAdminSession,
  createAdminSession,
  hasAdminSession,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/lib/admin-auth'
import {
  getDatabaseExperiences,
  getExperienceCollection,
  saveHomepageFeaturedExperienceIds,
  type Experience,
} from '@/lib/experiences'
import { isExperienceTemplateId } from '@/lib/experience-templates'
import { parseExperienceAttachments } from '@/lib/experience-attachments'
import {
  formatExperienceDate,
  isValidDateInput,
} from '@/lib/experience-dates'

export type AdminActionState = {
  error?: string
  success?: boolean
}

function getText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function loginAdmin(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const passwordValue = formData.get('password')
  const password = typeof passwordValue === 'string' ? passwordValue : ''
  if (!verifyAdminPassword(password)) {
    return {
      error: isAdminConfigured()
        ? '비밀번호가 올바르지 않습니다.'
        : '관리자 인증 환경 변수(ADMIN_PASSWORD, ADMIN_SESSION_SECRET)를 설정해주세요.',
    }
  }

  await createAdminSession()
  redirect('/admin')
}

export async function logoutAdmin() {
  await clearAdminSession()
  redirect('/admin')
}

function parseExperience(formData: FormData): Experience | string {
  const id = getText(formData, 'id')
  const template = getText(formData, 'template')
  const title = getText(formData, 'title')
  const description = getText(formData, 'description')
  const image = getText(formData, 'image')
  const startDate = getText(formData, 'startDate')
  const endDate = getText(formData, 'endDate')
  const referenceLink = getText(formData, 'referenceLink')
  const quote = getText(formData, 'quote')
  const tags = getText(formData, 'tags')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
  const headings = formData.getAll('sectionHeading')
  const bodies = formData.getAll('sectionBody')
  const attachments = parseExperienceAttachments(
    formData.getAll('attachmentKind'),
    formData.getAll('attachmentTitle'),
    formData.getAll('attachmentUrl'),
  )

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return 'ID는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.'
  }
  if (!isExperienceTemplateId(template)) {
    return '지원하는 경험 템플릿을 선택해주세요.'
  }
  if (typeof attachments === 'string') return attachments
  if (!title || !description || !image) {
    return '모든 필수 항목을 입력해주세요.'
  }
  if (!isValidDateInput(startDate)) {
    return '올바른 시작 날짜를 선택해주세요.'
  }
  if (endDate && !isValidDateInput(endDate)) {
    return '올바른 종료 날짜를 선택해주세요.'
  }
  if (endDate && endDate < startDate) {
    return '종료 날짜는 시작 날짜보다 빠를 수 없습니다.'
  }
  if (tags.length === 0 || tags.length > 20 || tags.some((tag) => tag.length > 40)) {
    return '태그를 1개 이상 입력해주세요. 태그는 쉼표로 구분하며 최대 20개까지 가능합니다.'
  }
  if (headings.length === 0 || headings.length !== bodies.length || headings.length > 20) {
    return '경험 내용은 1개 이상 입력해주세요.'
  }
  if (
    !(
      image.startsWith('/') && !image.startsWith('//')
    ) &&
    !/^https?:\/\/\S+$/i.test(image)
  ) {
    return '이미지는 https:// 또는 / 로 시작하는 주소를 입력해주세요.'
  }
  if (referenceLink && !isHttpUrl(referenceLink)) {
    return '참고 링크는 http:// 또는 https:// 로 시작하는 주소를 입력해주세요.'
  }

  const sections = headings.map((heading, index) => ({
    heading: typeof heading === 'string' ? heading.trim() : '',
    body: typeof bodies[index] === 'string' ? String(bodies[index]).trim() : '',
  }))
  if (sections.some((section) => !section.heading || !section.body)) {
    return '경험 내용의 제목과 본문을 모두 입력해주세요.'
  }

  return {
    id,
    template,
    title,
    description,
    image,
    date: formatExperienceDate(startDate, endDate || undefined),
    startDate,
    ...(endDate ? { endDate } : {}),
    tags: [...new Set(tags)],
    ...(referenceLink ? { referenceLink } : {}),
    attachments,
    sections,
    ...(quote ? { quote } : {}),
  }
}

function recordIdFilter(id: string) {
  const alternatives: Array<{ id: string } | { _id: ObjectId }> = [{ id }]
  if (/^[a-f\d]{24}$/i.test(id)) {
    alternatives.push({ _id: new ObjectId(id) })
  }
  return { $or: alternatives }
}

export async function saveExperience(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await hasAdminSession())) redirect('/admin')

  const parsed = parseExperience(formData)
  if (typeof parsed === 'string') return { error: parsed }

  const originalId = getText(formData, 'originalId')
  try {
    const collection = await getExperienceCollection()
    const existing = originalId
      ? await collection.findOne(recordIdFilter(originalId))
      : null
    if (originalId && !existing) {
      return { error: '수정할 경험을 찾을 수 없습니다.' }
    }

    const duplicate = await collection.findOne({
      id: parsed.id,
      ...(existing ? { _id: { $ne: existing._id } } : {}),
    })
    if (duplicate) return { error: '이미 사용 중인 ID입니다.' }

    if (existing) {
      await collection.updateOne(
        { _id: existing._id },
        {
          $set: parsed,
          $unset: {
            author: '',
            ...(!parsed.quote ? { quote: '' } : {}),
            ...(!parsed.endDate ? { endDate: '' } : {}),
            ...(!parsed.referenceLink ? { referenceLink: '' } : {}),
          },
        },
      )
    } else {
      await collection.insertOne(parsed)
    }
  } catch (error) {
    console.error('Failed to save experience:', error)
    return { error: '저장에 실패했습니다. DB 연결 및 설정을 확인해주세요.' }
  }

  revalidatePath('/')
  revalidatePath('/experience')
  revalidatePath('/experience/[id]', 'page')
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteExperience(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await hasAdminSession())) redirect('/admin')
  const id = getText(formData, 'id')
  if (!id) return { error: '삭제할 경험 ID가 없습니다.' }

  try {
    const collection = await getExperienceCollection()
    const result = await collection.deleteOne(recordIdFilter(id))
    if (!result.deletedCount) {
      return { error: '삭제할 경험을 찾을 수 없습니다.' }
    }
  } catch (error) {
    console.error('Failed to delete experience:', error)
    return { error: '삭제에 실패했습니다. DB 연결 및 설정을 확인해주세요.' }
  }

  revalidatePath('/')
  revalidatePath('/experience')
  revalidatePath('/experience/[id]', 'page')
  revalidatePath('/admin')
  return { success: true }
}

export async function saveFeaturedExperiences(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await hasAdminSession())) redirect('/admin')

  const rawIds = formData.getAll('featuredExperienceIds')
  if (rawIds.length > 3 || rawIds.some((id) => typeof id !== 'string' || !id)) {
    return { error: '홈 화면에는 경험을 최대 3개까지 선택할 수 있습니다.' }
  }

  const ids = rawIds.filter((id): id is string => typeof id === 'string')
  if (new Set(ids).size !== ids.length) {
    return { error: '같은 경험을 중복해서 선택할 수 없습니다.' }
  }

  try {
    const experiences = await getDatabaseExperiences()
    if (ids.some((id) => !experiences.some((experience) => experience.id === id))) {
      return { error: '목록에서 경험을 다시 선택해주세요.' }
    }
    await saveHomepageFeaturedExperienceIds(ids)
  } catch (error) {
    console.error('Failed to save featured experiences:', error)
    return { error: '홈 화면 설정 저장에 실패했습니다. DB 연결 및 설정을 확인해주세요.' }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}
