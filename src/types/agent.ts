export type Model = 'gpt' | 'gemini' | 'claude'

export type AgentStatus = 'thinking' | 'executing' | 'done' | 'idle' | 'error'

export interface Agent {
  id: string
  name: string
  model: Model
  status: AgentStatus
  progress: number        // 0–100
  currentTask: string
  logs: string[]
  promptHistory: PromptMessage[]
  startedAt: number
  lastUpdatedAt: number
}

export interface PromptMessage {
  role: 'user' | 'assistant'
  content: string
}
