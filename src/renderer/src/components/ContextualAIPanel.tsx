import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { X, Send, Sparkles, Loader2 } from 'lucide-react'
import { RoadmapBlock } from '../lib/roadmap'

interface ContextualAIPanelProps {
  isOpen: boolean
  onClose: () => void
  block: RoadmapBlock | null
  projectContext: any
}

export default function ContextualAIPanel({ isOpen, onClose, block, projectContext }: ContextualAIPanelProps) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!query.trim() || !block) return

    const userMessage = query
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setQuery('')
    setIsLoading(true)

    try {
      const systemPrompt = `
        You are the Planner Agent for Startup OS.
        You are helping the founder with a specific roadmap block: "${block.title}".
        Block Description: ${block.description}
        Project Context: ${projectContext.description}

        Provide specific, actionable advice for this step. Do not be generic.
      `

      // @ts-ignore
      const response = await window.api.aiChat({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
          { role: 'user', content: userMessage }
        ]
      })

      const assistantMessage = response.choices[0].message.content
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please check your connection or API key." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-background border-l border-black/10 shadow-2xl z-[70] flex flex-col"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-black/60" />
                <div>
                  <h3 className="font-semibold">{block?.title}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Contextual AI Assistant</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <MessageSquare className="w-12 h-12" />
                    <p className="text-sm max-w-[240px]">Ask anything about this roadmap block. The AI knows your project and this specific task.</p>
                 </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-black/[0.03] text-foreground'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="bg-black/[0.03] rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-black/40" />
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-black/5">
               <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about this step..."
                    className="w-full h-12 pl-4 pr-12 rounded-xl border border-black/10 focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!query.trim() || isLoading}
                    className="absolute right-2 top-2 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center disabled:opacity-30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function MessageSquare({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
