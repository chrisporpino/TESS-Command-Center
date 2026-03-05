import TopBar from './TopBar'
import AgentFeed from './AgentFeed'
import LogTerminal from './LogTerminal'
import AgentDetail from './AgentDetail'

export default function DashboardLayout() {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <TopBar />

      {/* 3-column main grid */}
      <div
        className="flex-1 grid overflow-hidden"
        style={{ gridTemplateColumns: '280px 1fr 320px' }}
      >
        <AgentFeed />
        <LogTerminal />
        <AgentDetail />
      </div>
    </div>
  )
}
