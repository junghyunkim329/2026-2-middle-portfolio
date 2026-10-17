import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getDirectUploadRule,
  getDirectUploadRuleFromPathname,
  normalizeExperienceAttachments,
  parseExperienceAttachments,
} from './experience-attachments.ts'

test('사진, GIF, MP4, WebM에 맞는 직접 업로드 규칙을 반환한다', () => {
  assert.deepEqual(getDirectUploadRule('image/jpeg'), {
    extension: 'jpg',
    kind: 'image',
    maximumSizeInBytes: 5 * 1024 * 1024,
  })
  assert.deepEqual(getDirectUploadRule('image/gif'), {
    extension: 'gif',
    kind: 'image',
    maximumSizeInBytes: 10 * 1024 * 1024,
  })
  assert.deepEqual(getDirectUploadRule('video/mp4'), {
    extension: 'mp4',
    kind: 'video',
    maximumSizeInBytes: 50 * 1024 * 1024,
  })
  assert.deepEqual(getDirectUploadRule('video/webm'), {
    extension: 'webm',
    kind: 'video',
    maximumSizeInBytes: 50 * 1024 * 1024,
  })
  assert.equal(getDirectUploadRule('application/pdf'), undefined)
  assert.deepEqual(
    getDirectUploadRuleFromPathname(
      'experience-media/123e4567-e89b-12d3-a456-426614174000.mp4',
    ),
    {
      contentType: 'video/mp4',
      extension: 'mp4',
      kind: 'video',
      maximumSizeInBytes: 50 * 1024 * 1024,
    },
  )
  assert.equal(
    getDirectUploadRuleFromPathname('experience-media/file.pdf'),
    undefined,
  )
})

test('업로드 자료와 PDF, PPT 링크를 저장 가능한 첨부 자료로 만든다', () => {
  assert.deepEqual(
    parseExperienceAttachments(
      ['image', 'video', 'pdf', 'presentation'],
      ['화면', '시연 영상', '보고서', '발표자료'],
      [
        'https://example.com/screen.png',
        'https://example.com/demo.mp4',
        'https://drive.google.com/report',
        'https://drive.google.com/slides',
      ],
    ),
    [
      { kind: 'image', title: '화면', url: 'https://example.com/screen.png' },
      { kind: 'video', title: '시연 영상', url: 'https://example.com/demo.mp4' },
      { kind: 'pdf', title: '보고서', url: 'https://drive.google.com/report' },
      {
        kind: 'presentation',
        title: '발표자료',
        url: 'https://drive.google.com/slides',
      },
    ],
  )
})

test('첨부 자료의 개수, 종류, 제목, URL을 검증한다', () => {
  assert.equal(
    parseExperienceAttachments(['archive'], ['파일'], ['https://example.com']),
    '지원하지 않는 첨부 자료 형식입니다.',
  )
  assert.equal(
    parseExperienceAttachments(['pdf'], [''], ['https://example.com/report']),
    '첨부 자료 이름과 주소를 모두 입력해주세요.',
  )
  assert.equal(
    parseExperienceAttachments(['pdf'], ['보고서'], ['javascript:alert(1)']),
    '첨부 자료 주소는 http:// 또는 https:// 로 시작해야 합니다.',
  )
  assert.equal(
    parseExperienceAttachments(
      Array.from({ length: 11 }, () => 'image'),
      Array.from({ length: 11 }, (_, index) => `사진 ${index + 1}`),
      Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.jpg`),
    ),
    '첨부 자료는 최대 10개까지 등록할 수 있습니다.',
  )
})

test('기존 데이터나 잘못된 첨부 자료는 빈 목록 또는 유효한 항목으로 정규화한다', () => {
  assert.deepEqual(normalizeExperienceAttachments(undefined), [])
  assert.deepEqual(
    normalizeExperienceAttachments([
      { kind: 'pdf', title: '보고서', url: 'https://example.com/report' },
      { kind: 'archive', title: '압축 파일', url: 'https://example.com/file' },
      { kind: 'video', title: '', url: 'https://example.com/demo.mp4' },
    ]),
    [{ kind: 'pdf', title: '보고서', url: 'https://example.com/report' }],
  )
})
