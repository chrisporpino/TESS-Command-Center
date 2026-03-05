import { useEffect, useRef, useState } from 'react'
import { useAnimate } from 'framer-motion'
import type { Model, AgentStatus } from '../../types/agent'

interface AgentCardProps {
  name: string
  model: Model
  status: AgentStatus
  progress: number   // 0–100
  currentTask: string
  isSelected?: boolean
  isActivated?: boolean
  onClick?: () => void
}

// ── Model — badge only + left border accent ────────────────────────────────
const modelLabel: Record<Model, string> = {
  gpt:    'GPT-4',
  gemini: 'Gemini',
  claude: 'Claude',
}

const modelBadgeClasses: Record<Model, string> = {
  gpt:    'text-gpt    bg-gpt-dim',
  gemini: 'text-gemini bg-gemini-dim',
  claude: 'text-claude bg-claude-dim',
}

// Left border + selected ring — inline style for precise opacity control
const modelBorderColor: Record<Model, string> = {
  gpt:    'rgba(124, 92, 255, 0.45)',
  gemini: 'rgba(29, 185, 84,  0.45)',
  claude: 'rgba(255, 138, 61, 0.45)',
}

const modelRingColor: Record<Model, string> = {
  gpt:    'rgba(124, 92, 255, 0.7)',
  gemini: 'rgba(29, 185, 84,  0.7)',
  claude: 'rgba(255, 138, 61, 0.7)',
}

const modelActivationGlow: Record<Model, string> = {
  gpt:    '0 0 0 1.5px rgba(124, 92, 255, 0.7), 0 0 10px 2px rgba(124, 92, 255, 0.25)',
  gemini: '0 0 0 1.5px rgba(29, 185, 84,  0.7), 0 0 10px 2px rgba(29, 185, 84,  0.25)',
  claude: '0 0 0 1.5px rgba(255, 138, 61, 0.7), 0 0 10px 2px rgba(255, 138, 61, 0.25)',
}

// ── Status — fully independent from model color ────────────────────────────
const statusDotClasses: Record<AgentStatus, string> = {
  thinking:  'bg-blue-400/60',
  executing: 'bg-text-primary',
  done:      'bg-status-done',
  idle:      'bg-text-muted/40',
  error:     'bg-status-error',
}

const statusLabelClasses: Record<AgentStatus, string> = {
  thinking:  'text-blue-400/60',
  executing: 'text-text-primary',
  done:      'text-status-done/60',
  idle:      'text-text-muted/50',
  error:     'text-status-error',
}

const statusLabel: Record<AgentStatus, string> = {
  thinking:  'Thinking…',
  executing: 'Executing',
  done:      'Done',
  idle:      'Idle',
  error:     'Error',
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AgentCard({
  name,
  model,
  status,
  progress,
  currentTask,
  isSelected = false,
  isActivated = false,
  onClick,
}: AgentCardProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const [scope, animate] = useAnimate()
  const prevStatusRef  = useRef<AgentStatus>(status)
  const startedAtRef   = useRef<number | null>(null)
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null)

  // Cleanup interval on unmount
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  // Prompt-submit card pulse
  useEffect(() => {
    if (!isActivated || !scope.current) return
    const glow = modelActivationGlow[model]
    const ring = `0 0 0 1.5px ${modelRingColor[model]}`
    animate(
      scope.current,
      { scale: 1.025, boxShadow: glow },
      { duration: 0.12, ease: 'easeInOut' },
    ).then(() =>
      animate(
        scope.current,
        { scale: 1, boxShadow: isSelected ? ring : 'none' },
        { duration: 0.14, ease: 'easeInOut' },
      )
    )
  }, [isActivated]) // eslint-disable-line react-hooks/exhaustive-deps

  // Status transition effects: wake-up animations + execution timer
  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = status

    // thinking → executing: visual wake-up
    if (prev === 'thinking' && status === 'executing') {
      animate('[data-dot]', { scale: [1, 1.35, 1] }, { duration: 0.15, ease: 'easeInOut' })
      animate('[data-bar]', { width: '0%' }, { duration: 0 }).then(() =>
        animate('[data-bar]', { width: `${clampedProgress}%` }, { duration: 0.25, ease: 'easeInOut' })
      )
      animate('[data-name]', { color: '#ffffff' }, { duration: 0.1, ease: 'easeIn' }).then(() =>
        animate('[data-name]', { color: '' }, { duration: 0.3, ease: 'easeOut' })
      )
    }

    // Any → executing: start timer
    if (status === 'executing' && prev !== 'executing') {
      startedAtRef.current = Date.now()
      setElapsedSeconds(0)
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current!) / 1000))
      }, 1000)
    }

    // Leaving executing: stop timer
    if (prev === 'executing' && status !== 'executing') {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      if (status !== 'done') setElapsedSeconds(null)
      // done: keep frozen elapsedSeconds
    }

    // Any other transition away from done/executing: clear timer display
    if (status !== 'executing' && status !== 'done') {
      setElapsedSeconds(null)
    }
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={scope}
      onClick={onClick}
      className="bg-bg-surface border border-border-subtle rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-opacity duration-200"
      style={{
        borderLeftColor: modelBorderColor[model],
        borderLeftWidth: '2px',
        boxShadow: isSelected ? `0 0 0 1.5px ${modelRingColor[model]}` : undefined,
      }}
    >
      {/* Row 1 — name + model badge */}
      <div className="flex items-center justify-between gap-2">
        <span data-name className="text-sm font-semibold text-text-primary truncate">
          {name}
        </span>

        <span
          className={`
            shrink-0 text-[12px] font-medium font-mono tracking-[0.04em]
            px-2 py-0.5 rounded-badge opacity-75
            ${modelBadgeClasses[model]}
          `}
        >
          {modelLabel[model]}
        </span>
      </div>

      {/* Row 2 — status */}
      <div className="flex items-center gap-2">
        <span data-dot className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotClasses[status]}`} />
        <span className={`text-xs font-medium ${statusLabelClasses[status]}`}>
          {statusLabel[status]}
        </span>
        {(status === 'executing' || status === 'done') && elapsedSeconds !== null ? (
          <span className="ml-auto text-[10px] font-mono text-text-muted shrink-0">
            {elapsedSeconds}s
          </span>
        ) : status === 'thinking' ? (
          <span className="ml-auto text-[10px] text-text-muted font-mono truncate max-w-[100px]">
            {currentTask}
          </span>
        ) : null}
      </div>

      {/* Row 3 — progress bar (neutral, represents progress only) */}
      <div className="h-[3px] w-full rounded-full bg-bg-elevated overflow-hidden">
        <div
          data-bar
          className="h-full rounded-full bg-white/20 transition-all duration-500"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}
