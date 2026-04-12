import { ApiError } from './api-error';

export const isValidEmail = (value: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim());
};

export const isStrongPassword = (value: string): boolean => {
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  return value.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
};

export const normalizeText = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

export const requireString = (
  field: string,
  value: unknown,
  minLength = 1,
  maxLength = 255
): string => {
  if (typeof value !== 'string') {
    throw new ApiError(400, `${field} must be a string`);
  }

  const normalized = normalizeText(value);
  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new ApiError(400, `${field} must be between ${minLength} and ${maxLength} characters`);
  }

  return normalized;
};

export const requireNumber = (field: string, value: unknown): number => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    throw new ApiError(400, `${field} must be a valid number`);
  }
  return numericValue;
};

export const requirePositiveInt = (field: string, value: unknown): number => {
  const numericValue = requireNumber(field, value);
  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new ApiError(400, `${field} must be a positive integer`);
  }
  return numericValue;
};

export const assertAllowedFields = (
  payload: Record<string, unknown>,
  allowedFields: string[]
): void => {
  const allowedSet = new Set(allowedFields);
  const invalidFields = Object.keys(payload).filter((field) => !allowedSet.has(field));

  if (invalidFields.length > 0) {
    throw new ApiError(400, `Unexpected fields: ${invalidFields.join(', ')}`);
  }
};
