import './App.css'
import { SnakeClockProvider } from './context/SnakeClockProvider'
import { AgentProvider } from './context/AgentContext'
import { PromptFeedbackProvider } from './context/PromptFeedbackContext'
import DashboardLayout from './components/layout/DashboardLayout'

export default function App() {
  return (
    <SnakeClockProvider>
      <AgentProvider>
        <PromptFeedbackProvider>
          <div className="h-screen w-screen bg-bg-base text-text-primary overflow-hidden">
            <DashboardLayout />
          </div>
        </PromptFeedbackProvider>
      </AgentProvider>
    </SnakeClockProvider>
  )
}
