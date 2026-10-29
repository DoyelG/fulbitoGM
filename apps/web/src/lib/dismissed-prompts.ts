export function isPromptDismissed(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) === 'true'
  } catch {
    return false
  }
}

export function dismissPrompt(storageKey: string): void {
  try {
    localStorage.setItem(storageKey, 'true')
  } catch {
    return
  }
}
