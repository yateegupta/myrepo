import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { UserRole } from '@/types/prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function getCurrentRole() {
  const session = await getServerSession(authOptions)
  return session?.user?.role as UserRole | undefined
}

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]
  
  if (!roles.includes(user.role as UserRole)) {
    throw new Error('Forbidden')
  }
  
  return user
}
