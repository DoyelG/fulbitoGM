import { type NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname + request.nextUrl.search
  const url = `${BACKEND_URL}${path}`

  const headers: HeadersInit = {}
  const contentType = request.headers.get('content-type')
  if (contentType) headers['content-type'] = contentType
  const cookie = request.headers.get('cookie')
  if (cookie) headers['cookie'] = cookie

  const isBodyMethod = !['GET', 'HEAD'].includes(request.method)
  const init = {
    method: request.method,
    headers,
    ...(isBodyMethod && { body: request.body, duplex: 'half' }),
  } as RequestInit

  const res = await fetch(url, init)
  const data = await res.json().catch(() => null)

  return NextResponse.json(data, { status: res.status })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
