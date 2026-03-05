import { useState, useEffect, useRef } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { useAgentState, useAgentDispatch } from '../../context/AgentContext'
import { usePromptFeedback } from '../../context/PromptFeedbackContext'
import type { Agent } from '../../types/agent'

// Glow color per model — used only for the submit button micro-interaction
const modelGlow = {
  gpt:    'rgba(124, 92, 255, 0.55)',
  gemini: 'rgba(29, 185, 84,  0.55)',
  claude: 'rgba(255, 138, 61, 0.55)',
} as const

// ── Helpers reused from AgentCard (kept local to avoid coupling) ───────────
const modelLabel = { gpt: 'GPT-4', gemini: 'Gemini', claude: 'Claude' } as const

const modelBadgeClasses = {
  gpt:    'text-gpt    bg-gpt-dim',
  gemini: 'text-gemini bg-gemini-dim',
  claude: 'text-claude bg-claude-dim',
} as const

const statusLabel = {
  thinking:  'Thinking…',
  executing: 'Executing',
  done:      'Done',
  idle:      'Idle',
  error:     'Error',
} as const

const statusColor = {
  thinking:  'text-blue-400/60',
  executing: 'text-text-primary',
  done:      'text-status-done/60',
  idle:      'text-text-muted/50',
  error:     'text-status-error',
} as const

const statusDotColor = {
  thinking:  'bg-blue-400/60',
  executing: 'bg-text-primary',
  done:      'bg-status-done',
  idle:      'bg-text-muted/40',
  error:     'bg-status-error',
} as const

// ── Sub-components ─────────────────────────────────────────────────────────
function AgentIdentityBlock({ agent }: { agent: Agent }) {
  const progress = Math.min(100, Math.max(0, agent.progress))

  return (
    <div className="rounded-2xl bg-bg-elevated border border-border-subtle p-5 flex flex-col gap-3">
      {/* Name + badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-text-primary truncate">
          {agent.name}
        </span>
        <span className={`
          shrink-0 text-[12px] font-medium font-mono tracking-[0.04em]
          px-2 py-0.5 rounded-badge opacity-75
          ${modelBadgeClasses[agent.model]}
        `}>
          {modelLabel[agent.model]}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor[agent.status]}`} />
        <span className={`text-xs font-medium ${statusColor[agent.status]}`}>
          {statusLabel[agent.status]}
        </span>
        {agent.currentTask && agent.status !== 'idle' && (
          <span className="ml-auto text-[10px] text-text-muted font-mono truncate max-w-[120px]">
            {agent.currentTask}
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[3px] rounded-full bg-bg-overlay overflow-hidden">
          <div
            className="h-full rounded-full bg-white/20 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-text-muted shrink-0">{progress}%</span>
      </div>
    </div>
  )
}

function PromptHistoryBlock({ agent }: { agent: Agent }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on each new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [agent.promptHistory.length])

  if (agent.promptHistory.length === 0) {
    return (
      <div className="rounded-2xl bg-bg-elevated border border-border-subtle p-4 flex items-center justify-center min-h-[80px]">
        <span className="text-xs text-text-muted">No prompts yet</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {agent.promptHistory.map((msg, i) => (
        <div
          key={i}
          className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
            {msg.role}
          </span>
          <p className={`
            text-xs leading-relaxed px-3 py-2 rounded-xl max-w-[90%]
            ${msg.role === 'user'
              ? 'bg-bg-overlay text-text-primary'
              : 'bg-bg-surface border border-border-subtle text-text-secondary'
            }
          `}>
            {msg.content}
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AgentDetail() {
  const { agents, selectedAgentId } = useAgentState()
  const dispatch = useAgentDispatch()
  const selected = agents.find(a => a.id === selectedAgentId) ?? null

  const { signalSubmit } = usePromptFeedback()
  const [input, setInput] = useState('')
  const [btnScope, animateBtn] = useAnimate()

  // Clear input when the selected agent changes
  useEffect(() => { setInput('') }, [selectedAgentId])

  async function triggerButtonFeedback() {
    if (!btnScope.current || !selected) return
    const glow = modelGlow[selected.model]
    await animateBtn(
      btnScope.current,
      { scale: 0.96, boxShadow: `0 0 8px 2px ${glow}` },
      { duration: 0.08, ease: 'easeInOut' },
    )
    await animateBtn(
      btnScope.current,
      { scale: 1, boxShadow: '0 0 0px 0px transparent' },
      { duration: 0.08, ease: 'easeInOut' },
    )
  }

  function handleSubmit() {
    const text = input.trim()
    if (!text || !selected) return
    dispatch({ type: 'SUBMIT_PROMPT', id: selected.id, prompt: text })
    signalSubmit(selected.id)
    setInput('')
    triggerButtonFeedback()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <aside className="flex flex-col bg-bg-surface border-l border-border-subtle overflow-hidden">

      {/* Header — fixed */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Agent Detail
        </h2>
      </div>

      {/* Body — flex column, does NOT scroll as a whole */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {!selected ? (
          /* Empty state — scrollable only in the no-agent case */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="rounded-2xl bg-bg-elevated border border-border-subtle p-5 flex flex-col items-center justify-center gap-2 min-h-[120px]">
              <span className="text-xs text-text-muted">No agent selected</span>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Prompt History
              </span>
              <div className="flex-1 rounded-2xl bg-bg-elevated border border-border-subtle p-4 min-h-[160px] flex items-center justify-center">
                <span className="text-xs text-text-muted">No prompts yet</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Identity block — fixed height, does not scroll */}
            <div className="shrink-0 p-6 pb-4">
              <AgentIdentityBlock agent={selected} />
            </div>

            {/* History label — fixed */}
            <div className="shrink-0 px-6 pb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Prompt History
              </span>
            </div>

            {/* History scroll zone — only this region scrolls */}
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <PromptHistoryBlock agent={selected} />
            </div>
          </>
        )}

        {/* Input — pinned to bottom, never scrolls away */}
        <div className="shrink-0 border-t border-border-subtle p-6 pt-4">
          <div className="rounded-2xl bg-bg-elevated border border-border-subtle p-4 flex items-center gap-3">
            <input
              className="flex-1 bg-transparent text-xs font-mono text-text-primary placeholder:text-text-muted outline-none"
              placeholder={selected ? 'Enter prompt…' : 'Select an agent first'}
              disabled={!selected}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <motion.button
              ref={btnScope}
              onClick={handleSubmit}
              disabled={!selected || !input.trim()}
              className="w-6 h-6 rounded-lg bg-bg-overlay flex items-center justify-center transition-opacity duration-150 disabled:opacity-30"
            >
              <span className="text-text-muted text-xs">↵</span>
            </motion.button>
          </div>
        </div>

      </div>
    </aside>
  )
}
