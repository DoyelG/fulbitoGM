export function corsHeaders(origin: string | null): Record<string, string> {
    if (!origin) return {}

    const VERCEL_ENV = process.env.VERCEL_ENV
    const NEXT_PUBLIC_FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL

    console.log('[CORS corsHeaders]', {
        origin,
        VERCEL_ENV,
        NEXT_PUBLIC_FRONTEND_URL,
    })

    const allowedOrigins = [
        'http://localhost:3000',
        NEXT_PUBLIC_FRONTEND_URL,
    ].filter(Boolean) as string[]

    // DEBUG: temporarily allow all *.vercel.app regardless of VERCEL_ENV
    const isVercelApp = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)
    const isAllowed =
        allowedOrigins.includes(origin) ||
        isVercelApp

    console.log('[CORS corsHeaders] result', { isAllowed, isVercelApp, allowedOrigins })

    if (!isAllowed) return {}

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    }
}
