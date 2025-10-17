import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith('/admin') && token?.role !== 'HOSPITAL_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (path.startsWith('/surgeon') && token?.role !== 'SURGEON' && token?.role !== 'HOSPITAL_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (path.startsWith('/nurse') && token?.role !== 'NURSE' && token?.role !== 'HOSPITAL_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (path.startsWith('/fulfillment') && token?.role !== 'FULFILLMENT_AGENT' && token?.role !== 'HOSPITAL_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
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
  matcher: ['/admin/:path*', '/surgeon/:path*', '/nurse/:path*', '/fulfillment/:path*', '/dashboard/:path*'],
}
