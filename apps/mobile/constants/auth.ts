export const ROLES = { ADMIN: 'ADMIN', USER: 'USER' } as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];
export type User = { name: string; email: string; role: Role; image: string | null };
