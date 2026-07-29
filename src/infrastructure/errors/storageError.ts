export type StorageErrorCode =
  | 'unavailable'
  | 'quotaExceeded'
  | 'corruptedData'
  | 'writeFailed'
  | 'unsupportedBackup'
  | 'invalidBackup'

export class StorageError extends Error {
  constructor(
    public readonly code: StorageErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'StorageError'
  }
}

export function toStorageError(
  error: unknown,
  fallback: StorageErrorCode = 'writeFailed',
): StorageError {
  if (error instanceof StorageError) return error
  const name = error instanceof DOMException ? error.name : ''
  if (name === 'QuotaExceededError') {
    return new StorageError('quotaExceeded', 'Локальне сховище переповнене.', { cause: error })
  }
  if (name === 'InvalidStateError' || name === 'UnknownError') {
    return new StorageError('unavailable', 'Локальне сховище недоступне.', { cause: error })
  }
  return new StorageError(fallback, 'Не вдалося зберегти локальні дані.', { cause: error })
}

export const storageErrorMessages: Record<StorageErrorCode, string> = {
  unavailable: 'Локальне сховище недоступне. Перевір налаштування браузера.',
  quotaExceeded: 'На пристрої бракує місця для збереження. Експортуй копію та звільни місце.',
  corruptedData: 'Частину локальних даних пошкоджено. Можна відновити їх із резервної копії.',
  writeFailed: 'Не вдалося зберегти зміни. Спробуй ще раз.',
  unsupportedBackup: 'Цю версію резервної копії застосунок поки не підтримує.',
  invalidBackup: 'Файл не є коректною резервною копією Math Kitty Academy.',
}
