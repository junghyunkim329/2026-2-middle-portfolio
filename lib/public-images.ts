import { readdir } from 'node:fs/promises'
import path from 'node:path'

const supportedImageExtensions = new Set([
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.webp',
])

async function collectImagePaths(
  directory: string,
  publicDirectory: string,
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const collected = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return collectImagePaths(absolutePath, publicDirectory)
      }

      if (
        !entry.isFile() ||
        !supportedImageExtensions.has(path.extname(entry.name).toLowerCase())
      ) {
        return []
      }

      const relativePath = path.relative(publicDirectory, absolutePath)
      return [`/${relativePath.split(path.sep).join('/')}`]
    }),
  )

  return collected.flat()
}

export async function listPublicImagePaths(
  publicDirectory = path.join(process.cwd(), 'public'),
): Promise<string[]> {
  try {
    const images = await collectImagePaths(publicDirectory, publicDirectory)
    return images.sort((left, right) =>
      left.toLowerCase().localeCompare(right.toLowerCase()),
    )
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}
