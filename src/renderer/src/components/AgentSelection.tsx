import { motion } from 'framer-motion'
import { useState } from 'react'
import { Check, Info, ShieldCheck, Zap } from 'lucide-react'

export interface Agent {
  id: string
  name: string
  role: string
  description: string
  deliverables: string[]
}

const SPECIALISTS: Agent[] = [
  {
    id: 'product_strategist',
    name: "Product Strategist",
    role: "Product positioning & Features",
    description: "Defines the core value proposition and essential feature set for your MVP.",
    deliverables: ["Value Prop Map", "Feature Priority", "UX Direction"]
  },
  {
    id: 'market_analyst',
    name: "Market Analyst",
    role: "Competitors & Trends",
    description: "Identifies market gaps, analyzes competitors, and spots emerging industry trends.",
    deliverables: ["Competitor Matrix", "Market Gap Analysis"]
  },
  {
    id: 'business_strategist',
    name: "Business Strategist",
    role: "Revenue & Viability",
    description: "Focuses on business models, pricing strategies, and long-term sustainability.",
    deliverables: ["Revenue Models", "Pricing Strategy"]
  },
  {
    id: 'technical_architect',
    name: "Technical Architect",
    role: "Tech Stack & Feasibility",
    description: "Recommends the best technology stack and plans the system architecture.",
    deliverables: ["Tech Stack", "System Architecture"]
  },
  {
    id: 'execution_coach',
    name: "Execution Coach",
    role: "Milestones & Action",
    description: "Breaks down the vision into actionable steps and prioritized milestones.",
    deliverables: ["Execution Roadmap", "Initial Milestones"]
  }
]

interface AgentSelectionProps {
  onComplete: (selectedIds: string[], apiKey: string) => void
}

export default function AgentSelection({ onComplete }: AgentSelectionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(['execution_coach']) // Default recommendation
  const [apiKey, setApiKey] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleAgent = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleStart = async () => {
    if (!apiKey.startsWith('nvapi-')) {
      setError('Please enter a valid NVIDIA API Key (starts with nvapi-)')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Mock verification
      await new Promise(resolve => setTimeout(resolve, 1500))
      onComplete(selectedIds, apiKey)
    } catch (err) {
      setError('Failed to verify API key. Please check and try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const isLimitReached = selectedIds.length >= 4

  return (
    <div className="min-h-screen bg-background flex flex-col p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Choose Your Strategy Team</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select up to 4 specialists to work alongside your Planner. The Planner is always active.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {/* PLANNER CARD - ALWAYS ACTIVE */}
           <div className="p-6 rounded-3xl border border-black/10 bg-black/[0.02] flex flex-col justify-between opacity-60 grayscale cursor-not-allowed relative overflow-hidden group">
              <div className="absolute top-4 right-4">
                 <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <div className="space-y-4">
                <div>
                   <h3 className="font-semibold text-lg">Planner Agent</h3>
                   <p className="text-xs font-bold uppercase tracking-widest text-black/40">Always Active</p>
                </div>
                <p className="text-sm text-muted-foreground">The brain of Startup OS. Coordinates all specialists and manages project memory.</p>
              </div>
           </div>

           {SPECIALISTS.map((agent) => {
             const isSelected = selectedIds.includes(agent.id)
             return (
               <motion.button
                whileHover={{ y: -4 }}
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                disabled={!isSelected && isLimitReached}
                className={`p-6 rounded-3xl border text-left flex flex-col justify-between transition-all relative ${
                  isSelected
                  ? 'border-black bg-white shadow-xl shadow-black/5 ring-1 ring-black'
                  : 'border-black/5 bg-black/[0.01] hover:border-black/10 disabled:opacity-30'
                }`}
               >
                 {isSelected && (
                   <div className="absolute top-4 right-4 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                   </div>
                 )}
                 <div className="space-y-4">
                    <div>
                       <h3 className="font-semibold text-lg">{agent.name}</h3>
                       <p className="text-xs font-medium text-muted-foreground">{agent.role}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{agent.description}</p>
                    <div className="flex flex-wrap gap-2">
                       {agent.deliverables.map(d => (
                         <span key={d} className="text-[10px] px-2 py-1 bg-black/5 rounded-md font-medium text-black/60">{d}</span>
                       ))}
                    </div>
                 </div>
               </motion.button>
             )
           })}
        </div>

        <div className="max-w-xl mx-auto w-full pt-12">
          <div className="p-8 rounded-3xl bg-white border border-black/10 shadow-2xl space-y-8">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Connect AI Provider</span>
               </div>
               <p className="text-sm text-muted-foreground">Enter your NVIDIA API Key to power your strategy team.</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="nvapi-................................"
                className="w-full h-12 px-4 rounded-xl border border-black/10 focus:outline-none focus:border-black transition-colors font-mono text-sm"
              />
              {error && <p className="text-sm font-medium text-red-500">{error}</p>}

              <button
                disabled={isVerifying || !apiKey}
                onClick={handleStart}
                className="w-full h-14 bg-black text-white rounded-xl font-medium hover:bg-black/90 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Launch Strategy Team'
                )}
              </button>
            </div>

            <div className="flex items-start gap-2 p-4 bg-black/[0.02] rounded-xl">
               <Info className="w-4 h-4 text-black/40 mt-0.5 shrink-0" />
               <p className="text-xs text-muted-foreground leading-relaxed">
                  Your key is stored locally on this machine and never leaves your computer except to communicate with the provider.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
