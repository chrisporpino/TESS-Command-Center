import type { Agent, AgentStatus } from '../types/agent'

export interface AppState {
  agents: Agent[]
  selectedAgentId: string | null
}

export type Action =
  | { type: 'TICK_PROGRESS'; id: string; amount: number }
  | { type: 'APPEND_LOG';    id: string; line: string }
  | { type: 'TRANSITION_STATUS'; id: string; status: AgentStatus; currentTask?: string }
  | { type: 'SELECT_AGENT'; id: string | null }
  | { type: 'SUBMIT_PROMPT'; id: string; prompt: string }
  | { type: 'BROADCAST_PROMPT'; prompt: string }

const MAX_LOGS = 200

export function agentReducer(state: AppState, action: Action): AppState {
  switch (action.type) {

    case 'TICK_PROGRESS': {
      return {
        ...state,
        agents: state.agents.map(agent => {
          if (agent.id !== action.id) return agent
          const newProgress = Math.min(100, agent.progress + action.amount)
          // Reaching 100 automatically transitions to done
          const newStatus: AgentStatus = newProgress >= 100 ? 'done' : agent.status
          return {
            ...agent,
            progress: newProgress,
            status: newStatus,
            lastUpdatedAt: Date.now(),
          }
        }),
      }
    }

    case 'APPEND_LOG': {
      return {
        ...state,
        agents: state.agents.map(agent => {
          if (agent.id !== action.id) return agent
          const logs = [...agent.logs, action.line]
          return {
            ...agent,
            logs: logs.length > MAX_LOGS ? logs.slice(logs.length - MAX_LOGS) : logs,
            lastUpdatedAt: Date.now(),
          }
        }),
      }
    }

    case 'TRANSITION_STATUS': {
      return {
        ...state,
        agents: state.agents.map(agent => {
          if (agent.id !== action.id) return agent
          const nextStatus = action.status
          // Reset progress only when starting a fresh execution cycle from non-executing state
          const resetProgress =
            nextStatus === 'thinking' && agent.status !== 'thinking' && agent.status !== 'executing'
          return {
            ...agent,
            status: nextStatus,
            progress: resetProgress ? 0 : agent.progress,
            currentTask: action.currentTask ?? agent.currentTask,
            lastUpdatedAt: Date.now(),
          }
        }),
      }
    }

    case 'SELECT_AGENT': {
      return { ...state, selectedAgentId: action.id }
    }

    case 'SUBMIT_PROMPT': {
      const ts = new Date().toTimeString().slice(0, 8)
      return {
        ...state,
        agents: state.agents.map(agent => {
          if (agent.id !== action.id) return agent
          const logs = [
            ...agent.logs,
            `[${ts}] [INFO] User prompt: ${action.prompt}`,
            `[${ts}] [INFO] Starting execution...`,
          ]
          return {
            ...agent,
            status: 'executing',
            progress: 0,
            currentTask: action.prompt.slice(0, 48),
            logs: logs.length > MAX_LOGS ? logs.slice(logs.length - MAX_LOGS) : logs,
            promptHistory: [
              ...agent.promptHistory,
              { role: 'user', content: action.prompt },
            ],
            lastUpdatedAt: Date.now(),
          }
        }),
      }
    }

    case 'BROADCAST_PROMPT': {
      const ts = new Date().toTimeString().slice(0, 8)
      return {
        ...state,
        agents: state.agents.map(agent => {
          const logs = [
            ...agent.logs,
            `[${ts}] [INFO] User prompt: ${action.prompt}`,
            `[${ts}] [INFO] Starting execution...`,
          ]
          return {
            ...agent,
            status: 'executing',
            progress: 0,
            currentTask: action.prompt.slice(0, 48),
            logs: logs.length > MAX_LOGS ? logs.slice(logs.length - MAX_LOGS) : logs,
            promptHistory: [
              ...agent.promptHistory,
              { role: 'user', content: action.prompt },
            ],
            lastUpdatedAt: Date.now(),
          }
        }),
      }
    }

    default:
      return state
  }
}
