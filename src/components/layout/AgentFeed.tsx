import AgentCard from '../agents/AgentCard'
import { useAgentState, useAgentDispatch } from '../../context/AgentContext'
import { usePromptFeedback } from '../../context/PromptFeedbackContext'

export default function AgentFeed() {
  const { agents, selectedAgentId } = useAgentState()
  const dispatch = useAgentDispatch()
  const { activatedId } = usePromptFeedback()

  const activeCount = agents.filter(
    a => a.status === 'executing' || a.status === 'thinking'
  ).length

  return (
    <aside className="flex flex-col bg-bg-surface border-r border-border-subtle overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Agents
        </h2>
        <span className="text-xs font-mono text-text-muted">{activeCount} active</span>
      </div>

      {/* Scrollable agent list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            name={agent.name}
            model={agent.model}
            status={agent.status}
            progress={agent.progress}
            currentTask={agent.currentTask}
            isSelected={agent.id === selectedAgentId}
            isActivated={activatedId === agent.id || activatedId === '__ALL__'}
            onClick={() => dispatch({ type: 'SELECT_AGENT', id: agent.id })}
          />
        ))}
      </div>
    </aside>
  )
}
