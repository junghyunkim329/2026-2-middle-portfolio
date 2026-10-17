interface BlobEnvironment {
  [key: string]: string | undefined
  BLOB_READ_WRITE_TOKEN?: string
  VERCEL_OIDC_TOKEN?: string
  BLOB_STORE_ID?: string
}

export function getBlobReadWriteToken(environment: BlobEnvironment) {
  const token = environment.BLOB_READ_WRITE_TOKEN?.trim()
  return token && token !== '[SENSITIVE]' ? token : undefined
}

export function hasBlobCredentials(
  environment: BlobEnvironment,
  headers?: Headers,
) {
  const oidcToken =
    environment.VERCEL_OIDC_TOKEN ?? headers?.get('x-vercel-oidc-token')
  const hasReadWriteToken = Boolean(getBlobReadWriteToken(environment))

  return Boolean(
    hasReadWriteToken || (oidcToken && environment.BLOB_STORE_ID),
  )
}
