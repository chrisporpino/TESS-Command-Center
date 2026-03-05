import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

interface PromptFeedbackContextValue {
  activatedId: string | null
  signalSubmit: (id: string) => void
  signalBroadcast: () => void
}

const PromptFeedbackContext = createContext<PromptFeedbackContextValue | null>(null)

export function PromptFeedbackProvider({ children }: { children: ReactNode }) {
  const [activatedId, setActivatedId] = useState<string | null>(null)

  const signalSubmit = useCallback((id: string) => {
    setActivatedId(id)
    setTimeout(() => setActivatedId(null), 350)
  }, [])

  const signalBroadcast = useCallback(() => {
    setActivatedId('__ALL__')
    setTimeout(() => setActivatedId(null), 350)
  }, [])

  return (
    <PromptFeedbackContext.Provider value={{ activatedId, signalSubmit, signalBroadcast }}>
      {children}
    </PromptFeedbackContext.Provider>
  )
}

export function usePromptFeedback(): PromptFeedbackContextValue {
  const ctx = useContext(PromptFeedbackContext)
  if (!ctx) throw new Error('usePromptFeedback must be used inside PromptFeedbackProvider')
  return ctx
}
