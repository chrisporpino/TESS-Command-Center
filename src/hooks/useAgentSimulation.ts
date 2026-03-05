import { useEffect, useRef } from 'react'
import type { Dispatch, MutableRefObject } from 'react'
import type { AppState, Action } from '../context/agentReducer'
import type { Model } from '../types/agent'

// ── Log message pools ──────────────────────────────────────────────────────
const LOG_REASONING = [
  'analyzing prompt intent',
  'planning tool usage',
  'querying vector memory',
  'synthesizing response',
  'validating output',
  'finalizing response',
]

const LOG_THINKING = [
  'Loading context window...',
  'Evaluating task constraints',
  'Retrieving memory fragment',
  'Analyzing candidate approaches',
  'Building chain-of-thought...',
  'Cross-referencing knowledge base',
  'Scoring candidate reasoning paths',
]

const LOG_EXECUTING = [
  'Calling tool: web_search',
  'Tool response received',
  'Writing to scratchpad',
  'Processing response tokens',
  'Spawning subtask',
  'Validating output schema',
  'Committing intermediate results',
  'Parsing API response',
  'Streaming output buffer',
]

const LOG_WARN = [
  'Rate limit approaching, throttling',
  'Retrying after transient failure',
  'Context window near capacity',
]

// ── Task pools per model ───────────────────────────────────────────────────
const TASKS: Record<Model, string[]> = {
  gpt: [
    'Analyzing conversation structure',
    'Cross-referencing knowledge base',
    'Drafting multi-step plan',
    'Evaluating decision tree',
    'Synthesizing research findings',
    'Running inference chain',
    'Fact-checking assertions',
  ],
  gemini: [
    'Indexing document corpus',
    'Running vector similarity search',
    'Aggregating data sources',
    'Building knowledge graph',
    'Parsing structured dataset',
    'Generating embeddings',
    'Multi-modal analysis',
  ],
  claude: [
    'Reviewing content for accuracy',
    'Drafting technical summary',
    'Checking constraint compliance',
    'Generating structured output',
    'Iterating on draft response',
    'API tool call sequence',
    'Validating reasoning trace',
  ],
}

// ── Helpers ────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function timestamp() {
  return new Date().toTimeString().slice(0, 8)
}

function buildLogLine(pool: string[], level: 'INFO' | 'WARN' | 'ERROR' = 'INFO') {
  return `[${timestamp()}] [${level}] ${randomFrom(pool)}`
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useAgentSimulation(
  stateRef: MutableRefObject<AppState>,
  dispatch: Dispatch<Action>,
) {
  // Tracks whether each agent already has a pending timed transition
  const pendingRef = useRef<Map<string, boolean>>(new Map())
  // Tracks all active timeouts so we can clear them on cleanup
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  // Tracks last reasoning step per agent to prevent consecutive repeats
  const lastReasonRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    function scheduleTransition(id: string, delayMs: number, cb: () => void) {
      if (pendingRef.current.get(id)) return
      pendingRef.current.set(id, true)
      const t = setTimeout(() => {
        timeoutsRef.current.delete(t)
        pendingRef.current.set(id, false)
        cb()
      }, delayMs)
      timeoutsRef.current.add(t)
    }

    // ── Interval A (800ms) — append logs to active agents ─────────────────
    const logInterval = setInterval(() => {
      for (const agent of stateRef.current.agents) {
        if (agent.status === 'executing') {
          // 15% chance of a warn line; otherwise info
          const isWarn = Math.random() < 0.15
          const line = isWarn
            ? buildLogLine(LOG_WARN, 'WARN')
            : buildLogLine(LOG_EXECUTING, 'INFO')
          dispatch({ type: 'APPEND_LOG', id: agent.id, line })

          // ~22% chance of an interleaved reasoning trace step
          if (Math.random() < 0.22) {
            const last = lastReasonRef.current.get(agent.id)
            const pool = last ? LOG_REASONING.filter(r => r !== last) : LOG_REASONING
            const step = randomFrom(pool)
            lastReasonRef.current.set(agent.id, step)
            dispatch({ type: 'APPEND_LOG', id: agent.id, line: `[${timestamp()}] [REASON] ${step}` })
          }
        } else if (agent.status === 'thinking') {
          dispatch({ type: 'APPEND_LOG', id: agent.id, line: buildLogLine(LOG_THINKING) })
        }
      }
    }, 800)

    // ── Interval B (2000ms) — increment progress for executing agents ──────
    const progressInterval = setInterval(() => {
      for (const agent of stateRef.current.agents) {
        if (agent.status === 'executing') {
          dispatch({
            type: 'TICK_PROGRESS',
            id: agent.id,
            amount: randomBetween(3, 8),
          })
        }
      }
    }, 2000)

    // ── Interval C (600ms) — schedule per-agent status transitions ─────────
    // Each agent operates independently: transitions are staggered via random delays
    const coordinatorInterval = setInterval(() => {
      for (const agent of stateRef.current.agents) {
        if (pendingRef.current.get(agent.id)) continue

        switch (agent.status) {
          case 'thinking': {
            // thinking → executing after 4–9s
            scheduleTransition(agent.id, randomBetween(4000, 9000), () => {
              const current = stateRef.current.agents.find(a => a.id === agent.id)
              if (!current || current.status !== 'thinking') return
              const task = randomFrom(TASKS[current.model])
              dispatch({ type: 'TRANSITION_STATUS', id: agent.id, status: 'executing', currentTask: task })
              dispatch({ type: 'APPEND_LOG', id: agent.id, line: `[${timestamp()}] [INFO] Starting execution: ${task}` })
            })
            break
          }

          case 'done': {
            // done → idle after 2–4s
            scheduleTransition(agent.id, randomBetween(2000, 4000), () => {
              const current = stateRef.current.agents.find(a => a.id === agent.id)
              if (!current || current.status !== 'done') return
              dispatch({ type: 'TRANSITION_STATUS', id: agent.id, status: 'idle' })
              dispatch({ type: 'APPEND_LOG', id: agent.id, line: `[${timestamp()}] [INFO] Agent entering idle state` })
            })
            break
          }

          case 'idle': {
            // idle → thinking after 8–15s
            scheduleTransition(agent.id, randomBetween(8000, 15000), () => {
              const current = stateRef.current.agents.find(a => a.id === agent.id)
              if (!current || current.status !== 'idle') return
              const task = randomFrom(TASKS[current.model])
              dispatch({ type: 'TRANSITION_STATUS', id: agent.id, status: 'thinking', currentTask: task })
              dispatch({ type: 'APPEND_LOG', id: agent.id, line: `[${timestamp()}] [INFO] New task assigned: ${task}` })
            })
            break
          }

          case 'error': {
            // error → idle after 3s (auto-recovery)
            scheduleTransition(agent.id, 3000, () => {
              const current = stateRef.current.agents.find(a => a.id === agent.id)
              if (!current || current.status !== 'error') return
              dispatch({ type: 'TRANSITION_STATUS', id: agent.id, status: 'idle' })
              dispatch({ type: 'APPEND_LOG', id: agent.id, line: `[${timestamp()}] [WARN] Recovering from error, entering idle state` })
            })
            break
          }

          // 'executing' needs no coordinator — TICK_PROGRESS handles done transition
        }
      }
    }, 600)

    return () => {
      clearInterval(logInterval)
      clearInterval(progressInterval)
      clearInterval(coordinatorInterval)
      for (const t of timeoutsRef.current) clearTimeout(t)
      timeoutsRef.current.clear()
      pendingRef.current.clear()
    }
  }, [dispatch, stateRef])
}
