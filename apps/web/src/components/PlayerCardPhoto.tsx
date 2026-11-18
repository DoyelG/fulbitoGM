'use client'

import { useState } from 'react'
import Image from 'next/image'
import GoldSpinner from '@/components/GoldSpinner'

const avatarFrame = 'relative mx-auto h-[132px] w-[132px] shrink-0 overflow-hidden rounded-2xl'

function Silhouette() {
  return (
    <div className={`${avatarFrame} mask-x-from-89% mask-y-from-89%`}>
      <Image src="/silhouette-transparent.svg" alt="" fill sizes="132px" className="object-cover" />
    </div>
  )
}

function Photo({ src, name }: { src: string; name: string }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  if (status === 'error') return <Silhouette />

  return (
    <div className={avatarFrame}>
      {status === 'loading' && <GoldSpinner label={`Cargando foto de ${name}`} />}
      <Image
        src={src}
        alt={`Foto de ${name}`}
        fill
        sizes="132px"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`object-cover object-center transition-opacity duration-300 mask-x-from-89% mask-y-from-89% ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

export default function PlayerCardPhoto({ src, name }: { src?: string | null; name: string }) {
  return src ? <Photo key={src} src={src} name={name} /> : <Silhouette />
}
