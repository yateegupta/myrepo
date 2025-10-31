import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/types/prisma'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (
    session.user.role === UserRole.FULFILLMENT ||
    session.user.role === UserRole.FULFILLMENT_AGENT
  ) {
    redirect('/dashboard')
  }

  if (session.user.role === UserRole.HOSPITAL_ADMIN || session.user.role === UserRole.ADMIN) {
    redirect('/dashboard')
  }

  if (session.user.role === UserRole.SURGEON) {
    redirect('/surgeon')
  }

  if (session.user.role === UserRole.NURSE) {
    redirect('/nurse')
  }

  redirect('/orders/new')
}
