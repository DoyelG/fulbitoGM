import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  const origin = request.headers.get('origin')
  const res = NextResponse.next()
  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*')
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: res.headers })
  }
  return res
}

export const config = {
  matcher: '/api/:path*',
}
