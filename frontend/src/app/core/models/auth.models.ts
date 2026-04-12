export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  isLocked: boolean;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
