import Image from 'next/image'
import type { Role } from '@fulbito/types'
import { roleLabels } from '@fulbito/utils'
import GradientHeader from '@/components/GradientHeader'

type ProfileHeaderProps = {
  email: string
  roles: Role[]
  photoUrl?: string | null
}

export default function ProfileHeader({ email, roles, photoUrl }: ProfileHeaderProps) {
  const avatar = (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 text-4xl font-bold uppercase ring-4 ring-white/60 backdrop-blur">
      {photoUrl ? (
        <Image src={photoUrl} alt="Foto de perfil" fill unoptimized className="object-cover" />
      ) : (
        <span aria-hidden>{email.charAt(0)}</span>
      )}
    </div>
  )

  return (
    <GradientHeader leading={avatar} title={email.split('@')[0]} subtitle={email} stackedOnMobile>
      <ul aria-label="Roles" className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
        {roles.map((role) => (
          <li key={role} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {roleLabels[role]}
          </li>
        ))}
      </ul>
    </GradientHeader>
  )
}
