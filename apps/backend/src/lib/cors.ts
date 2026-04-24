export function corsHeaders(origin: string | null): Record<string, string> {
    if (!origin) return {}

    const allowedOrigins = [
        'http://localhost:3000',
        process.env.NEXT_PUBLIC_FRONTEND_URL,
    ].filter(Boolean) as string[]

    const isAllowed =
        allowedOrigins.includes(origin) ||
        (process.env.VERCEL_ENV === 'preview' && /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin))

    if (!isAllowed) return {}

    return {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    }
}
