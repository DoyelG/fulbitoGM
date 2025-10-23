export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const originalName = file.name || 'upload'
    const parts = originalName.split('.')
    const extRaw = parts.length > 1 ? parts.pop() as string : 'png'
    const ext = extRaw.toLowerCase()
    const safeExt = ['png','jpg','jpeg','webp','gif','svg'].includes(ext) ? ext : 'png'

    const filename = `${crypto.randomUUID()}.${safeExt}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })
    const filepath = path.join(uploadDir, filename)

    await fs.writeFile(filepath, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}


