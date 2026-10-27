import type { IconType } from 'react-icons'
import WidgetCard from '@/components/home/WidgetCard'

type ProfileSectionProps = {
  icon: IconType
  title: string
  index: number
  children: React.ReactNode
}

export default function ProfileSection({ icon: Icon, title, index, children }: ProfileSectionProps) {
  return (
    <div style={{ animationDelay: `${index * 80}ms` }} className="animate-fade-up">
      <WidgetCard id={`profile-section-${index}`} title={title} icon={<Icon />} tone="brand">
        {children}
      </WidgetCard>
    </div>
  )
}
