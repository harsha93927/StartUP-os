import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, Command, Map, FileText, Plus, Zap, Trash2, Milestone, LucideIcon } from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onAction: (actionId: string, data?: any) => void
  projectPath?: string
}

const COMMANDS = [
  { id: 'create_block', label: 'Create Roadmap Block', icon: Plus, shortcut: 'N' },
  { id: 'regenerate_roadmap', label: 'Regenerate Roadmap', icon: Zap, shortcut: 'R' },
  { id: 'open_reports', label: 'Open Reports', icon: FileText, shortcut: 'O' },
  { id: 'view_roadmap', label: 'View Full Roadmap', icon: Map, shortcut: 'M' },
  { id: 'delete_project', label: 'Delete Project', icon: Trash2, shortcut: 'D', danger: true },
]

const TYPE_ICONS: Record<string, LucideIcon> = {
  report: FileText,
  roadmap: Map,
  memory: Milestone,
  project: Zap
}

export default function CommandPalette({ isOpen, onClose, onAction, projectPath }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else onAction('toggle')
      }
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onAction])

  useEffect(() => {
    const search = async () => {
      if (query.length > 2 && projectPath) {
        const res = await window.api.searchQuery(projectPath, query)
        if (res.success) {
          setResults(res.results)
        }
      } else {
        setResults([])
      }
    }
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query, projectPath])

  const filteredCommands = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.98, y: 10, x: '-50%' }}
            className="fixed top-[20%] left-1/2 w-full max-w-xl bg-background border border-border shadow-2xl rounded-2xl z-[110] overflow-hidden"
          >
            <div className="p-4 border-b border-border flex items-center gap-3 bg-secondary/20">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search everything or type a command..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg outline-none placeholder:text-muted-foreground/50"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded text-[10px] font-bold text-muted-foreground uppercase">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            <div className="p-2 max-h-[450px] overflow-y-auto">
               {results.length > 0 && (
                 <div className="mb-4">
                    <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Search Results</p>
                    <div className="space-y-1">
                      {results.map((res, i) => {
                        const Icon = TYPE_ICONS[res.type] || Zap
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              onAction(`open_\${res.type}`, res)
                              onClose()
                            }}
                            className="w-full flex flex-col p-3 rounded-xl hover:bg-secondary text-left transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                               <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                               <span className="text-sm font-semibold">{res.title}</span>
                               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{res.type}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 ml-7 italic">...{res.snippet}...</p>
                          </button>
                        )
                      })}
                    </div>
                 </div>
               )}

               <div>
                 <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Commands</p>
                 <div className="space-y-1">
                    {filteredCommands.map(cmd => {
                      const Icon = cmd.icon
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            onAction(cmd.id)
                            onClose()
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors \${
                            cmd.danger
                            ? 'hover:bg-red-50 text-red-500'
                            : 'hover:bg-secondary text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                             <Icon className={`w-4 h-4 \${cmd.danger ? 'text-red-500' : 'text-muted-foreground'}`} />
                             <span className="text-sm font-medium">{cmd.label}</span>
                          </div>
                          {cmd.shortcut && (
                             <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded uppercase tracking-tighter">{cmd.shortcut}</span>
                          )}
                        </button>
                      )
                    })}
                 </div>
               </div>

               {results.length === 0 && filteredCommands.length === 0 && (
                 <div className="p-12 text-center space-y-2 opacity-50">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm">No results found for "{query}"</p>
                 </div>
               )}
            </div>

            <div className="p-3 bg-secondary/30 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-[0.1em]">
               <div className="flex gap-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
               </div>
               <span>ESC Close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
