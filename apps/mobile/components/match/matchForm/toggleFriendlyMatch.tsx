import { Switch } from 'react-native'
import { FormLabel } from './formLabel'

type toggleFriendlyMatch = {
  isMatchFriendly: boolean
  setIsMatchFriendly: (value: boolean) => void
}

export function ToggleFriendlyMatch({ isMatchFriendly, setIsMatchFriendly }: toggleFriendlyMatch) {
  return (
    <>
      <FormLabel text="Partido Amistoso" />
      <Switch value={isMatchFriendly} onValueChange={setIsMatchFriendly} />
    </>
  )
}
