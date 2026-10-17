import { issueSignedToken } from '@vercel/blob'
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from '@vercel/blob/client'
import { hasAdminSession } from '@/lib/admin-auth'
import {
  getBlobReadWriteToken,
  hasBlobCredentials,
} from '@/lib/blob-auth'
import { getDirectUploadRuleFromPathname } from '@/lib/experience-attachments'

const allowedPathname =
  /^experience-(images|media)\/[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm)$/

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return Response.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 })
  }
  if (!hasBlobCredentials(process.env, request.headers)) {
    return Response.json(
      {
        error:
          'Blob 연결 정보가 없습니다. BLOB_STORE_ID가 포함된 OIDC 환경 또는 BLOB_READ_WRITE_TOKEN을 설정해주세요.',
      },
      { status: 503 },
    )
  }

  try {
    const body = (await request.json()) as HandleUploadPresignedBody
    const response = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!(await hasAdminSession())) {
          throw new Error('관리자 로그인이 필요합니다.')
        }
        if (!allowedPathname.test(pathname)) {
          throw new Error('허용되지 않은 첨부 파일 경로입니다.')
        }
        const uploadRule = getDirectUploadRuleFromPathname(pathname)
        if (!uploadRule) throw new Error('허용되지 않은 첨부 파일 형식입니다.')

        return {
          token: await issueSignedToken({
            token: getBlobReadWriteToken(process.env),
            pathname,
            operations: ['put'],
            allowedContentTypes: [uploadRule.contentType],
            maximumSizeInBytes: uploadRule.maximumSizeInBytes,
          }),
          urlOptions: {
            allowedContentTypes: [uploadRule.contentType],
            maximumSizeInBytes: uploadRule.maximumSizeInBytes,
            addRandomSuffix: false,
            cacheControlMaxAge: 60 * 60 * 24 * 365,
          },
        }
      },
    })
    return Response.json(response)
  } catch (error) {
    console.error('Failed to authorize experience attachment upload:', error)
    return Response.json(
      { error: '첨부 파일 업로드를 승인하지 못했습니다.' },
      { status: 400 },
    )
  }
}
