import { useState } from 'react'
import { Alert } from 'react-native'

export function useCommentDeletion(removeComment: (commentId: string) => Promise<void>) {
  const [error, setError] = useState<string | null>(null)

  const confirmDelete = (commentId: string) => {
    Alert.alert('Borrar comentario', '¿Borrar este comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          setError(null)
          removeComment(commentId).catch(() => setError('No se pudo borrar el comentario. Intentá de nuevo.'))
        },
      },
    ])
  }

  return { error, confirmDelete }
}
