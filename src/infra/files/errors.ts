/**
 * Custom error types for FileSystemProvider
 */
export class FileSystemError extends Error {
  readonly code:
    | 'NOT_SUPPORTED'
    | 'PERMISSION_DENIED'
    | 'ABORTED'
    | 'INVALID_STATE'
    | 'WRITE_FAILED'
    | 'READ_FAILED'

  constructor(
    message: string,
    code:
      | 'NOT_SUPPORTED'
      | 'PERMISSION_DENIED'
      | 'ABORTED'
      | 'INVALID_STATE'
      | 'WRITE_FAILED'
      | 'READ_FAILED'
  ) {
    super(message)
    this.name = 'FileSystemError'
    this.code = code
  }
}
