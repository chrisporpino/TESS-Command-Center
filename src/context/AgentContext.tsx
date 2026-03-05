import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import type { Dispatch, ReactNode, MutableRefObject } from 'react'
import { agentReducer } from './agentReducer'
import type { AppState, Action } from './agentReducer'
import { mockAgents } from '../mock/agents'
import { useAgentSimulation } from '../hooks/useAgentSimulation'

// ── Contexts ───────────────────────────────────────────────────────────────
const AgentStateContext    = createContext<AppState | null>(null)
const AgentDispatchContext = createContext<Dispatch<Action> | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────
const initialState: AppState = {
  agents: mockAgents,
  selectedAgentId: null,
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentReducer, initialState)

  // Auto-select an agent on initial load
  useEffect(() => {
    const active =
      state.agents.find(a => a.status === 'executing') ||
      state.agents.find(a => a.status === 'thinking') ||
      state.agents[0]
    if (active) dispatch({ type: 'SELECT_AGENT', id: active.id })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Always-fresh ref so simulation callbacks never read stale closures
  const stateRef = useRef<AppState>(state) as MutableRefObject<AppState>
  useEffect(() => { stateRef.current = state }, [state])

  useAgentSimulation(stateRef, dispatch)

  return (
    <AgentStateContext.Provider value={state}>
      <AgentDispatchContext.Provider value={dispatch}>
        {children}
      </AgentDispatchContext.Provider>
    </AgentStateContext.Provider>
  )
}

// ── Hooks ──────────────────────────────────────────────────────────────────
export function useAgentState(): AppState {
  const ctx = useContext(AgentStateContext)
  if (!ctx) throw new Error('useAgentState must be used inside AgentProvider')
  return ctx
}

export function useAgentDispatch(): Dispatch<Action> {
  const ctx = useContext(AgentDispatchContext)
  if (!ctx) throw new Error('useAgentDispatch must be used inside AgentProvider')
  return ctx
}
