'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'

export function useSession() {
  return useNextAuthSession()
}

export function useRole() {
  const { data: session } = useNextAuthSession()
  return session?.user?.role
}

export function useUser() {
  const { data: session } = useNextAuthSession()
  return session?.user
}
