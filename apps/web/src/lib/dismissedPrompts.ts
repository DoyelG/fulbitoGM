export function isPromptDismissed(storageKey: string): boolean {
  return localStorage.getItem(storageKey) === 'true'
}

export function dismissPrompt(storageKey: string): void {
  localStorage.setItem(storageKey, 'true')
}
