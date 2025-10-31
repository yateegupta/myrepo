import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith('/admin') && token?.role !== 'HOSPITAL_ADMIN' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (path.startsWith('/surgeon') && token?.role !== 'SURGEON' && token?.role !== 'HOSPITAL_ADMIN' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (path.startsWith('/nurse') && token?.role !== 'NURSE' && token?.role !== 'HOSPITAL_ADMIN' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (path.startsWith('/api/orders') && token?.role !== 'FULFILLMENT_AGENT' && token?.role !== 'FULFILLMENT' && token?.role !== 'ADMIN' && token?.role !== 'HOSPITAL_ADMIN') {
      if (req.method === 'PATCH' || req.method === 'PUT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path.startsWith('/login')) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/api/orders/:path*',
    '/admin/:path*',
    '/surgeon/:path*',
    '/nurse/:path*',
    '/fulfillment/:path*'
  ],
}
