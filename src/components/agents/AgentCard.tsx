import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

// Left border accent — inline style for precise opacity control
const modelBorderColor: Record<Model, string> = {
  gpt:    'rgba(124, 92, 255, 0.45)',
  gemini: 'rgba(29, 185, 84,  0.45)',
  claude: 'rgba(255, 138, 61, 0.45)',
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

// ── Debug overlay — active only when URL contains ?debug=1 ─────────────────
const isDebug = typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === '1'

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
    animate(
      scope.current,
      { scale: 1.025, boxShadow: glow },
      { duration: 0.12, ease: 'easeInOut' },
    ).then(() =>
      animate(
        scope.current,
        { scale: 1, boxShadow: 'none' },
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

  // ── Snake border phase-lock ────────────────────────────────────────────────
  // lastSnakeStatusRef guards against recomputing delay on every re-render
  // (progress ticks, log appends). The delay is computed exactly once per
  // true status transition into or between thinking / executing.
  const lastSnakeStatusRef = useRef<AgentStatus | null>(null)
  const snakeDebugRef = useRef<{ t0: number; cycleMs: number; delayMs: number; now: number } | null>(null)

  useLayoutEffect(() => {
    const isNowActive = status === 'thinking' || status === 'executing'

    if (!isNowActive) {
      lastSnakeStatusRef.current = null
      const el = scope.current
      if (el) {
        el.style.removeProperty('--snake-delay')
        el.style.removeProperty('--snake-duration')
      }
      return
    }

    // Unrelated re-render (progress tick, log append) — keep existing phase.
    if (lastSnakeStatusRef.current === status) return
    lastSnakeStatusRef.current = status

    const el = scope.current
    if (!el) return

    // SnakeClockProvider's ready gate ensures --snake-t0 exists before any
    // child useLayoutEffect can reach this point, so no fallback is needed.
    const t0 = Number(
      getComputedStyle(document.documentElement).getPropertyValue('--snake-t0').trim()
    )

    const cycleMs = status === 'executing' ? 2000 : 6000

    // Positive-modulo helper — keeps result in [0, cycleMs) regardless of sign.
    // Standard JS % preserves sign, so (−X % M) can be negative; the +M term
    // corrects that.  Here now ≥ t0 always holds (t0 set at mount, now = later),
    // but the helper makes the invariant explicit and immune to clock drift.
    const mod = (n: number, m: number) => ((n % m) + m) % m

    const now = Date.now()

    // Why −mod(now − t0, cycleMs) and NOT −mod(t0 − now, cycleMs):
    //   −mod(t0 − now, M) = −(M − (now−t0)%M) = −M + (now−t0)%M
    //   That is off by −M from the correct delay.  For a periodic animation
    //   these differ in phase by M−X vs X (symmetric about M/2), causing
    //   cards to rotate in opposite quadrants of the cycle — visibly out of sync.
    //
    //   Correct: delayMs = −(now−t0)%M makes the animation appear to have
    //   started (now−t0)%M ms ago.  At any later time T:
    //     phase(T) = (T − now + (now−t0)%M) % M = (T − t0) % M
    //   which is the same global value for every card, regardless of entry time.
    const delayMs = -mod(now - t0, cycleMs)

    if (isDebug) snakeDebugRef.current = { t0, cycleMs, delayMs, now }

    // Force the ::before animation to restart with the new delay.
    // Simply changing animation-delay on a running animation has no visible
    // effect (CSS spec: the delay only applies at animation start time).
    // Removing and re-adding the class that carries animation-name on ::before
    // makes the browser treat it as a brand-new animation, applying the delay
    // from scratch.  Everything runs inside useLayoutEffect → before first
    // paint → zero visible flicker.
    el.classList.remove('snake-border')
    el.style.setProperty('--snake-delay',    `${delayMs}ms`)
    el.style.setProperty('--snake-duration', status === 'executing' ? '2s' : '6s')
    el.getBoundingClientRect()  // force style recalc + reflow
    el.classList.add('snake-border')
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  const isActive = status === 'thinking' || status === 'executing'

  // ── Debug computed styles (only evaluated when ?debug=1) ───────────────────
  let dbgHostVars: { delay: string; dur: string } | null = null
  let dbgBefore:   { delay: string; dur: string; name: string } | null = null
  if (isDebug && scope.current) {
    const hostCS = getComputedStyle(scope.current)
    dbgHostVars = {
      delay: hostCS.getPropertyValue('--snake-delay').trim()    || '(unset)',
      dur:   hostCS.getPropertyValue('--snake-duration').trim() || '(unset)',
    }
    const beforeCS = getComputedStyle(scope.current, '::before')
    dbgBefore = {
      delay: beforeCS.animationDelay,
      dur:   beforeCS.animationDuration,
      name:  beforeCS.animationName,
    }
  }

  return (
    <div
      ref={scope}
      onClick={onClick}
      className={`${isSelected ? 'bg-bg-elevated' : 'bg-bg-surface'} border border-border-subtle rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-opacity duration-200${isActive ? ` snake-border snake-${status} snake-${model}` : ''}`}
      style={{
        borderLeftColor: modelBorderColor[model],
        borderLeftWidth: '2px',
      } as React.CSSProperties}
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

      {/* ── Debug overlay — visible only when ?debug=1 in URL ── */}
      {isDebug && (
        <div
          style={{ position: 'absolute', bottom: 4, left: 4, right: 4, zIndex: 100 }}
          className="bg-black/85 text-[7px] font-mono leading-snug p-1 rounded pointer-events-none"
        >
          {/* Row 1: identity */}
          <span className="text-cyan-400">{name}</span>
          {' · status='}
          <span className={isActive ? 'text-green-400' : 'text-red-400'}>{status}</span>
          <br />
          {/* Row 2: computed phase values */}
          <span className="text-yellow-300">
            cycleMs={snakeDebugRef.current?.cycleMs ?? '—'}
            {' | now-t0='}
            {snakeDebugRef.current
              ? `${snakeDebugRef.current.now - snakeDebugRef.current.t0}ms`
              : '—'}
            {' | delayMs='}
            {snakeDebugRef.current?.delayMs ?? '—'}
          </span>
          <br />
          {/* Row 3: host element computed readback — confirms vars reached DOM */}
          <span className="text-lime-400">
            host: delay={dbgHostVars?.delay ?? '?'} | dur={dbgHostVars?.dur ?? '?'}
          </span>
          <br />
          {/* Row 4: ::before pseudo-element computed readback */}
          <span className="text-orange-300">
            ::before: delay={dbgBefore?.delay ?? '?'} | dur={dbgBefore?.dur ?? '?'} | name={dbgBefore?.name ?? '?'}
          </span>
        </div>
      )}
    </div>
  )
}
