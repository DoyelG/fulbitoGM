import { SignJWT, jwtVerify } from 'jose'

function getSecret() {
  const s = process.env.NEXTAUTH_SECRET
  if (!s) throw new Error('NEXTAUTH_SECRET is not set')
  return new TextEncoder().encode(s)
}

export async function signMobileToken(userId: string, role: string) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())
}

export async function verifyMobileToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return {
    sub: payload.sub as string,
    role: payload.role as string,
  }
}
