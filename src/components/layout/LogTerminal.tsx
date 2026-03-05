import { useEffect, useRef, useCallback } from 'react'
import { useAnimate } from 'framer-motion'
import { useAgentState } from '../../context/AgentContext'
import { usePromptFeedback } from '../../context/PromptFeedbackContext'

const modelGlow: Record<string, string> = {
  gpt:    'rgba(124, 92, 255, 0.45)',
  gemini: 'rgba(29, 185, 84,  0.45)',
  claude: 'rgba(255, 138, 61, 0.45)',
}

function logStyle(line: string): string {
  if (line.includes('[ERROR]'))  return 'text-status-error'
  if (line.includes('[WARN]'))   return 'text-yellow-400/75'
  if (line.includes('[REASON]')) return 'text-text-muted italic'
  return 'text-text-secondary'
}

export default function LogTerminal() {
  const { agents, selectedAgentId } = useAgentState()
  const selected = agents.find(a => a.id === selectedAgentId) ?? null
  const { activatedId } = usePromptFeedback()

  const bottomRef = useRef<HTMLDivElement>(null)
  const [termScope, animateTerm] = useAnimate()
  const prevStatusRef = useRef<string | null>(null)

  // Auto-scroll to bottom whenever logs change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selected?.logs.length])

  const triggerGlow = useCallback((model: string) => {
    if (!termScope.current) return
    const color = modelGlow[model] ?? 'rgba(255,255,255,0.25)'
    animateTerm(
      termScope.current,
      { boxShadow: `0 0 0 1px ${color}, 0 0 14px 3px ${color}` },
      { duration: 0.15, ease: 'easeIn' },
    ).then(() =>
      animateTerm(
        termScope.current,
        { boxShadow: '0 0 0 0px transparent' },
        { duration: 0.45, ease: 'easeOut' },
      )
    )
  }, [animateTerm, termScope])

  // Trigger on prompt submit targeting the selected agent (or broadcast)
  useEffect(() => {
    if (activatedId && selected && (activatedId === selected.id || activatedId === '__ALL__')) {
      triggerGlow(selected.model)
    }
  }, [activatedId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger on selected agent transitioning into 'executing'
  useEffect(() => {
    const prev = prevStatusRef.current
    const curr = selected?.status ?? null
    if (prev !== null && prev !== 'executing' && curr === 'executing') {
      triggerGlow(selected!.model)
    }
    prevStatusRef.current = curr
  }, [selected?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="flex flex-col bg-bg-base overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Log Terminal
        </h2>
        <div className="flex items-center gap-3">
          {selected ? (
            <span className="text-xs font-mono text-text-muted">{selected.name}</span>
          ) : (
            <span className="text-xs font-mono text-text-muted">— no agent selected —</span>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div ref={termScope} className="h-full rounded-2xl bg-bg-surface border border-border-subtle p-6 flex flex-col gap-0.5 overflow-y-auto">
          {!selected ? (
            <p className="font-mono text-xs text-text-muted mt-auto">
              Select an agent to view its log stream.
            </p>
          ) : selected.logs.length === 0 ? (
            <p className="font-mono text-xs text-text-muted mt-auto">
              No logs yet.
            </p>
          ) : (
            <>
              {selected.logs.map((line, i) => (
                <p
                  key={i}
                  className={`font-mono text-xs leading-relaxed ${logStyle(line)}`}
                >
                  {line}
                </p>
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>
    </main>
  )
}
