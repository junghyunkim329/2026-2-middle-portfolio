import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { listPublicImagePaths } from './public-images.ts'

test('public 폴더의 지원 이미지 경로를 선택 목록으로 만든다', async (t) => {
  const publicDirectory = await mkdtemp(path.join(tmpdir(), 'public-images-'))

  t.after(async () => {
    await rm(publicDirectory, { force: true, recursive: true })
  })

  await mkdir(path.join(publicDirectory, 'gallery'))
  await Promise.all([
    writeFile(path.join(publicDirectory, 'main.PNG'), ''),
    writeFile(path.join(publicDirectory, 'photo.jpg'), ''),
    writeFile(path.join(publicDirectory, 'gallery', 'demo.WebP'), ''),
    writeFile(path.join(publicDirectory, 'gallery', 'skip.svg'), ''),
    writeFile(path.join(publicDirectory, 'notes.txt'), ''),
  ])

  assert.deepEqual(await listPublicImagePaths(publicDirectory), [
    '/gallery/demo.WebP',
    '/main.PNG',
    '/photo.jpg',
  ])
})

test('public 폴더가 없으면 빈 선택 목록을 반환한다', async () => {
  const missingDirectory = path.join(
    tmpdir(),
    `missing-public-images-${Date.now()}`,
  )

  assert.deepEqual(await listPublicImagePaths(missingDirectory), [])
})
