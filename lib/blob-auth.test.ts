import assert from 'node:assert/strict'
import test from 'node:test'
import * as blobAuth from './blob-auth.ts'

const { hasBlobCredentials } = blobAuth

test('기존 Blob 읽기-쓰기 토큰을 인증 수단으로 허용한다', () => {
  assert.equal(
    hasBlobCredentials({ BLOB_READ_WRITE_TOKEN: 'legacy-token' }),
    true,
  )
})

test('Vercel CLI가 만든 비밀값 자리표시자는 인증 수단으로 허용하지 않는다', () => {
  assert.equal(
    hasBlobCredentials({ BLOB_READ_WRITE_TOKEN: '[SENSITIVE]' }),
    false,
  )
})

test('실제 읽기-쓰기 토큰만 Blob SDK에 전달한다', () => {
  const getBlobReadWriteToken = (
    blobAuth as typeof blobAuth & {
      getBlobReadWriteToken?: (
        environment: Record<string, string | undefined>,
      ) => string | undefined
    }
  ).getBlobReadWriteToken

  assert.equal(typeof getBlobReadWriteToken, 'function')
  assert.equal(
    getBlobReadWriteToken?.({ BLOB_READ_WRITE_TOKEN: '[SENSITIVE]' }),
    undefined,
  )
  assert.equal(
    getBlobReadWriteToken?.({
      BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_secret',
    }),
    'vercel_blob_rw_store_secret',
  )
})

test('스토어 ID가 있는 로컬 OIDC 환경을 인증 수단으로 허용한다', () => {
  assert.equal(
    hasBlobCredentials({
      VERCEL_OIDC_TOKEN: 'oidc-token',
      BLOB_STORE_ID: 'store-id',
    }),
    true,
  )
})

test('배포 요청의 OIDC 헤더와 스토어 ID를 인증 수단으로 허용한다', () => {
  const headers = new Headers({ 'x-vercel-oidc-token': 'oidc-token' })

  assert.equal(hasBlobCredentials({ BLOB_STORE_ID: 'store-id' }, headers), true)
})

test('OIDC 토큰만 있고 스토어 ID가 없으면 인증 수단으로 허용하지 않는다', () => {
  assert.equal(hasBlobCredentials({ VERCEL_OIDC_TOKEN: 'oidc-token' }), false)
})

