import type { ErrorDetail } from './response'

export function buildMissingFieldDetails(
  payload: Record<string, unknown>,
  requiredFields: string[]
): ErrorDetail[] {
  const details: ErrorDetail[] = []

  for (const field of requiredFields) {
    const value = payload[field]
    if (value === undefined || value === null || value === '') {
      details.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD_MISSING',
      })
    }
  }

  return details
}
