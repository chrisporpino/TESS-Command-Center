import { useState } from 'react'
import { useAgentDispatch } from '../../context/AgentContext'
import { usePromptFeedback } from '../../context/PromptFeedbackContext'

export default function TopBar() {
  const dispatch = useAgentDispatch()
  const { signalBroadcast } = usePromptFeedback()
  const [input, setInput] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    const text = input.trim()
    if (!text) return
    dispatch({ type: 'BROADCAST_PROMPT', prompt: text })
    signalBroadcast()
    setInput('')
  }

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-bg-surface border-b border-border-subtle shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-status-done" />
        <span className="text-sm font-semibold tracking-widest uppercase text-text-primary">
          TESS
        </span>
        <span className="text-sm text-text-muted font-normal tracking-wide">
          Command Center
        </span>
      </div>

      {/* Global command input */}
      <div className="flex-1 mx-8 max-w-xl">
        <div className="flex items-center gap-2 rounded-xl bg-bg-elevated border border-border-subtle px-3 py-1.5">
          <span className="text-text-muted text-xs font-mono shrink-0">⌘</span>
          <input
            className="flex-1 bg-transparent text-xs font-mono text-text-primary placeholder:text-text-muted/60 outline-none"
            placeholder="Send instruction to all agents..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Right slot */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-text-muted font-mono">v0.1.0</span>
      </div>
    </header>
  )
}
