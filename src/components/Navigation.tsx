'use client'

import { useSession, useRole } from '@/hooks/useSession'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const { data: session } = useSession()
  const role = useRole()
  const router = useRouter()

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const getNavigationItems = () => {
    const items = [
      { href: '/dashboard', label: 'Dashboard', roles: ['HOSPITAL_ADMIN', 'SURGEON', 'NURSE', 'FULFILLMENT_AGENT'] },
    ]

    if (role === 'HOSPITAL_ADMIN') {
      items.push(
        { href: '/admin', label: 'Admin Panel', roles: ['HOSPITAL_ADMIN'] },
        { href: '/admin/users', label: 'Manage Users', roles: ['HOSPITAL_ADMIN'] },
        { href: '/surgeon', label: 'Surgeon Area', roles: ['HOSPITAL_ADMIN'] },
        { href: '/nurse', label: 'Nurse Area', roles: ['HOSPITAL_ADMIN'] },
        { href: '/fulfillment', label: 'Fulfillment Area', roles: ['HOSPITAL_ADMIN'] }
      )
    } else if (role === 'SURGEON') {
      items.push(
        { href: '/surgeon', label: 'Surgeon Dashboard', roles: ['SURGEON'] },
        { href: '/surgeon/procedures', label: 'Procedures', roles: ['SURGEON'] }
      )
    } else if (role === 'NURSE') {
      items.push(
        { href: '/nurse', label: 'Nurse Dashboard', roles: ['NURSE'] },
        { href: '/nurse/patients', label: 'Patients', roles: ['NURSE'] }
      )
    } else if (role === 'FULFILLMENT_AGENT') {
      items.push(
        { href: '/fulfillment', label: 'Fulfillment Dashboard', roles: ['FULFILLMENT_AGENT'] },
        { href: '/fulfillment/orders', label: 'Orders', roles: ['FULFILLMENT_AGENT'] }
      )
    }

    return items.filter(item => item.roles.includes(role || ''))
  }

  const navItems = getNavigationItems()

  return (
    <nav className="bg-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold">Hospital System</span>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {session.user.name} ({role})
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 hover:bg-indigo-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
