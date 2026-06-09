import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Loader2, CheckCircle2, FileText, Sparkles } from 'lucide-react'
import { generateAgentReport } from '../lib/reportGenerator'
import { updateProjectMemory } from '../lib/memory'

interface StrategyGenerationProps {
  projectContext: any
  selectedAgentIds: string[]
  onComplete: () => void
}

export default function StrategyGeneration({ projectContext, selectedAgentIds, onComplete }: StrategyGenerationProps) {
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0)
  const [completedAgents, setCompletedAgents] = useState<string[]>([])
  const [status, setStatus] = useState('Initializing strategy team...')

  useEffect(() => {
    async function runGeneration() {
      for (let i = 0; i < selectedAgentIds.length; i++) {
        const agentId = selectedAgentIds[i]
        setCurrentAgentIndex(i)
        setStatus(`Agent ${i + 1} of ${selectedAgentIds.length}: Researching...`)

        try {
          const report = await generateAgentReport(agentId, projectContext)
          setStatus(`Saving ${agentId} report...`)

          // @ts-ignore
          await window.api.saveReport(projectContext.path, `${agentId}_report.md`, report.content)

          // Update memory with basic report info
          await updateProjectMemory(projectContext.path, {
            reports: [{
              agentId,
              filename: `${agentId}_report.md`,
              summary: report.content.substring(0, 200) + '...'
            }]
          })

          setCompletedAgents(prev => [...prev, agentId])
        } catch (error) {
          console.error(`Failed to generate report for ${agentId}:`, error)
        }
      }

      setStatus('All agents finished. Finalizing knowledge base...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      onComplete()
    }

    runGeneration()
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-2xl space-y-12 text-center">
        <div className="space-y-4">
           <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-3xl font-semibold tracking-tight">Generating Strategy</h1>
           <p className="text-muted-foreground">{status}</p>
        </div>

        <div className="space-y-4">
          {selectedAgentIds.map((id, index) => {
            const isCompleted = completedAgents.includes(id)
            const isCurrent = index === currentAgentIndex && !isCompleted

            return (
              <div key={id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                isCurrent ? 'border-black bg-black/[0.02] scale-[1.02]' : 'border-black/5 opacity-50'
              } ${isCompleted ? 'opacity-100 border-green-500/20 bg-green-50/30' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500 text-white' : 'bg-black/5'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm capitalize">{id.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{isCompleted ? 'Report Generated' : isCurrent ? 'Working...' : 'Waiting'}</p>
                  </div>
                </div>
                {isCurrent && <Loader2 className="w-5 h-5 animate-spin text-black/40" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
