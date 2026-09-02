import type { User, LoginResponse } from '@/types/auth'

export const mockUser: User = {
  id: 'usr_01',
  email: 'unk.rodolfo@gmail.com',
  name: 'Rodolfo',
  role: 'OWNER',
  tenantId: 'ten_01',
  tenantName: 'esse.rodolfo',
  avatarUrl: undefined,
  createdAt: '2025-01-15T10:00:00Z',
}

export const mockLoginResponse: LoginResponse = {
  accessToken: 'mock_access_token_jwt',
  refreshToken: 'mock_refresh_token_jwt',
  expiresIn: 900,
  user: mockUser,
}
