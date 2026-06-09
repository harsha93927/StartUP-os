import { useState, useEffect } from 'react'
import SplashScreen from './components/SplashScreen'
import AuthScreen from './components/AuthScreen'
import WorkspaceSetup from './components/WorkspaceSetup'
import ProjectCreation from './components/ProjectCreation'
import PlannerInitialization from './components/PlannerInitialization'
import ClarificationPhase from './components/ClarificationPhase'
import AgentSelection from './components/AgentSelection'
import StrategyGeneration from './components/StrategyGeneration'
import TodayView from './components/TodayView'
import RoadmapUI from './components/RoadmapUI'
import ReportsTab from './components/ReportsTab'
import ContextualAIPanel from './components/ContextualAIPanel'
import CommandPalette from './components/CommandPalette'
import { useAppStore } from './store/useAppStore'
import { RoadmapBlock, generateRoadmap } from './lib/roadmap'
import { LayoutDashboard, Map, FileText, Settings, LogOut } from 'lucide-react'

enum AppPhase {
  AUTHENTICATION,
  WORKSPACE_SETUP,
  PROJECT_CREATION,
  PLANNER_INITIALIZATION,
  CLARIFICATION,
  AGENT_SELECTION,
  STRATEGY_GENERATION,
  DASHBOARD
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [phase, setPhase] = useState<AppPhase>(AppPhase.AUTHENTICATION)
  const [activeTab, setActiveTab] = useState<'today' | 'roadmap' | 'reports'>('today')
  const [roadmap, setRoadmap] = useState<RoadmapBlock[]>([])
  const [memory, setMemory] = useState<any>(null)
  const [selectedBlock, setSelectedBlock] = useState<RoadmapBlock | null>(null)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])

  const { workspacePath, setWorkspacePath, currentProject, setCurrentProject } = useAppStore()

  const handleCreateProject = async (data: { name: string; description: string }, _attachments: File[]) => {
    setIsCreatingProject(true)
    try {
      const result = await window.api.createProjectFolder(workspacePath!, data.name, data.description)
      if (result.success) {
        setCurrentProject({
          name: data.name,
          path: result.path,
          description: data.description
        })
        setPhase(AppPhase.PLANNER_INITIALIZATION)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingProject(false)
    }
  }

  const handleAgentSelectionComplete = async (ids: string[], apiKey: string) => {
    await window.api.setAiKey(apiKey)
    setSelectedAgentIds(ids)
    setPhase(AppPhase.STRATEGY_GENERATION)
  }

  const handleStrategyComplete = async () => {
    try {
      const memoryData = await window.api.readJson(currentProject!.path, 'Memory/memory.json')
      setMemory(memoryData)
      const blocks = await generateRoadmap(currentProject, memoryData)
      setRoadmap(blocks)
      await window.api.writeJson(currentProject!.path, 'Memory/roadmap.json', blocks)
      setPhase(AppPhase.DASHBOARD)
    } catch (error) {
      console.error(error)
    }
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => setIsAuthenticated(true)} />
  }

  if (!workspacePath) {
    return <WorkspaceSetup onWorkspaceSelected={setWorkspacePath} />
  }

  if (!currentProject) {
    return <ProjectCreation onCreateProject={handleCreateProject} isLoading={isCreatingProject} />
  }

  switch (phase) {
    case AppPhase.PLANNER_INITIALIZATION:
      return <PlannerInitialization projectName={currentProject.name} onComplete={() => setPhase(AppPhase.CLARIFICATION)} />

    case AppPhase.CLARIFICATION:
      return <ClarificationPhase onComplete={() => setPhase(AppPhase.AGENT_SELECTION)} />

    case AppPhase.AGENT_SELECTION:
      return <AgentSelection onComplete={handleAgentSelectionComplete} />

    case AppPhase.STRATEGY_GENERATION:
      return (
        <StrategyGeneration
          projectContext={currentProject}
          selectedAgentIds={selectedAgentIds}
          onComplete={handleStrategyComplete}
        />
      )

    case AppPhase.DASHBOARD:
      return (
        <div className="flex h-screen bg-background overflow-hidden">
          {/* SIDEBAR */}
          <div className="w-64 border-r border-black/5 flex flex-col p-6 space-y-8 bg-[#FBF9F7]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-black rounded" />
              <span className="font-semibold tracking-tight">Startup OS</span>
            </div>

            <nav className="flex-1 space-y-1">
              {[
                { id: 'today', label: 'Today', icon: LayoutDashboard },
                { id: 'roadmap', label: 'Roadmap', icon: Map },
                { id: 'reports', label: 'Strategy', icon: FileText },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === item.id ? 'bg-black text-white' : 'hover:bg-black/5 text-muted-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="space-y-1">
               <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5">
                  <Settings className="w-4 h-4" />
                  Settings
               </button>
               <button
                  onClick={() => {
                    setCurrentProject(null)
                    setPhase(AppPhase.PROJECT_CREATION)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Exit Project
               </button>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto p-12">
             {activeTab === 'today' && <TodayView projectName={currentProject.name} blocks={roadmap} />}
             {activeTab === 'roadmap' && (
               <RoadmapUI
                 blocks={roadmap}
                 onAskAI={(block) => {
                   setSelectedBlock(block)
                   setIsAIPanelOpen(true)
                 }}
               />
             )}
             {activeTab === 'reports' && (
               <ReportsTab
                 reports={memory?.reports || []}
                 onOpenReport={() => {}}
               />
             )}
          </main>

          <ContextualAIPanel
            isOpen={isAIPanelOpen}
            onClose={() => setIsAIPanelOpen(false)}
            block={selectedBlock}
            projectContext={currentProject}
          />

          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onAction={(action) => {
              if (action === 'toggle') setIsCommandPaletteOpen(true)
              if (action === 'view_roadmap') setActiveTab('roadmap')
              if (action === 'open_reports') setActiveTab('reports')
            }}
          />
        </div>
      )

    default:
      return null
  }
}

export default App
