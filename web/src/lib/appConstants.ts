import raw from "./constants.json";

export const appConstants = {
  maxPostTextLength: raw.MAX_POST_TEXT_LENGTH,
  maxCommentLength: raw.MAX_COMMENT_LENGTH,
  feedPageSize: raw.FEED_PAGE_SIZE,
  allowedImageMimeTypes: raw.ALLOWED_IMAGE_MIME_TYPES,
  imageUploadMaxMb: raw.IMAGE_UPLOAD_MAX_MB,
  defaultImageMimeType: raw.DEFAULT_IMAGE_MIME_TYPE,
} as const;
