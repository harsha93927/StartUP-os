import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Loader2, CheckCircle2, FileText, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const generationStarted = useRef(false)

  const runGeneration = async (startIndex = 0) => {
    setError(null)
    setIsRetrying(false)
    generationStarted.current = true

    for (let i = startIndex; i < selectedAgentIds.length; i++) {
      const agentId = selectedAgentIds[i]
      setCurrentAgentIndex(i)
      setStatus(`Agent ${i + 1} of ${selectedAgentIds.length}: Researching ${agentId.replace('_', ' ')}...`)

      try {
        const report = await generateAgentReport(agentId, projectContext)
        setStatus(`Saving ${agentId} report...`)

        await window.api.saveReport(projectContext.path, `${agentId}_report.md`, report.content)

        await updateProjectMemory(projectContext.path, {
          reports: [{
            agentId,
            filename: `${agentId}_report.md`,
            summary: report.content.substring(0, 200) + '...'
          }]
        })

        setCompletedAgents(prev => [...prev, agentId])
      } catch (err: any) {
        console.error(`Failed to generate report for \${agentId}:`, err)
        setError(`Failed to generate report for \${agentId.replace('_', ' ')}. Check your API key or connection.`)
        return // Stop the loop on error
      }
    }

    setStatus('All agents finished. Finalizing knowledge base...')
    setTimeout(onComplete, 2000)
  }

  useEffect(() => {
    if (!generationStarted.current) {
      runGeneration()
    }
  }, [])

  const handleRetry = () => {
    setIsRetrying(true)
    runGeneration(completedAgents.length)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-2xl space-y-12 text-center">
        <div className="space-y-4">
           <motion.div
             animate={{ rotate: error ? 0 : 360 }}
             transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
             className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg \${error ? 'bg-red-50 text-red-500' : 'bg-primary text-primary-foreground'}`}
           >
              {error ? <AlertCircle className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
           </motion.div>
           <h1 className="text-3xl font-semibold tracking-tight">Generating Strategy</h1>
           <p className={`text-sm \${error ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>{error || status}</p>
        </div>

        <div className="space-y-3">
          {selectedAgentIds.map((id, index) => {
            const isCompleted = completedAgents.includes(id)
            const isCurrent = index === currentAgentIndex && !isCompleted && !error
            const isFailed = index === currentAgentIndex && error

            return (
              <div key={id} className={`flex items-center justify-between p-4 rounded-xl border transition-all \${
                isCurrent ? 'border-primary bg-secondary/50' : 'border-border'
              } \${isCompleted ? 'bg-green-50/30 border-green-500/20' : ''} \${isFailed ? 'bg-red-50/30 border-red-500/20' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg \${isCompleted ? 'bg-green-500 text-white' : 'bg-secondary'}`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm capitalize">{id.replace('_', ' ')}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isCompleted ? 'Report Generated' : isCurrent ? 'Working...' : isFailed ? 'Failed' : 'Waiting'}
                    </p>
                  </div>
                </div>
                {isCurrent && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {isFailed && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
            )
          })}
        </div>

        {error && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {isRetrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Retry Generation
          </motion.button>
        )}
      </div>
    </div>
  )
}
