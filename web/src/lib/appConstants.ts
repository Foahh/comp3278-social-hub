import raw from "./constants.json"

/** Mirrors repository-root `constants.json` / `web/src/lib/constants.json`. */
type ConstantsJson = {
  USERNAME_MIN_LEN: number
  USERNAME_MAX_LEN: number
  NAME_MAX_LENGTH: number
  PASSWORD_MIN_LENGTH: number
  PASSWORD_MAX_LENGTH: number
  MAX_POST_TEXT_LENGTH: number
  MAX_COMMENT_LENGTH: number
  FEED_PAGE_SIZE: number
  ALLOWED_IMAGE_MIME_TYPES: readonly string[]
  IMAGE_UPLOAD_MAX_MB: number
  DEFAULT_IMAGE_MIME_TYPE: string
}

const c = raw as unknown as ConstantsJson

export const appConstants = {
  usernameMinLen: c.USERNAME_MIN_LEN,
  usernameMaxLen: c.USERNAME_MAX_LEN,
  nameMaxLength: c.NAME_MAX_LENGTH,
  passwordMinLength: c.PASSWORD_MIN_LENGTH,
  passwordMaxLength: c.PASSWORD_MAX_LENGTH,
  maxPostTextLength: c.MAX_POST_TEXT_LENGTH,
  maxCommentLength: c.MAX_COMMENT_LENGTH,
  feedPageSize: c.FEED_PAGE_SIZE,
  allowedImageMimeTypes: c.ALLOWED_IMAGE_MIME_TYPES,
  imageUploadMaxMb: c.IMAGE_UPLOAD_MAX_MB,
  defaultImageMimeType: c.DEFAULT_IMAGE_MIME_TYPE,
} as const
