import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { corsHeaders } from '@/lib/cors'

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin')
    const headers = corsHeaders(origin)

    if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers })
    }

    const response = NextResponse.next()
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
    return response
}

export const config = {
    matcher: '/api/:path*',
}
