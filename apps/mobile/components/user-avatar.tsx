import { Image } from 'expo-image'

const PLACEHOLDER = require('@/assets/images/user-placeholder.png')

type Props = {
  imageUrl?: string | null
  size: number
  ringColor?: string
}

export function UserAvatar({ imageUrl, size, ringColor }: Props) {
  return (
    <Image
      source={imageUrl ? { uri: imageUrl } : PLACEHOLDER}
      contentFit="cover"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ringColor ? 1.5 : 0,
        borderColor: ringColor ?? 'transparent',
      }}
    />
  )
}
