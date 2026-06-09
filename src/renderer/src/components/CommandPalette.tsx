import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, Command, Map, FileText, Plus, Zap, Trash2 } from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onAction: (actionId: string) => void
}

const COMMANDS = [
  { id: 'create_block', label: 'Create Roadmap Block', icon: Plus, shortcut: 'N' },
  { id: 'regenerate_roadmap', label: 'Regenerate Roadmap', icon: Zap, shortcut: 'R' },
  { id: 'open_reports', label: 'Open Reports', icon: FileText, shortcut: 'O' },
  { id: 'search_project', label: 'Search Project', icon: Search, shortcut: 'S' },
  { id: 'view_roadmap', label: 'View Full Roadmap', icon: Map, shortcut: 'M' },
  { id: 'delete_project', label: 'Delete Project', icon: Trash2, shortcut: 'D', danger: true },
]

export default function CommandPalette({ isOpen, onClose, onAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('')

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
            className="fixed top-[20%] left-1/2 w-full max-w-xl bg-background border border-black/10 shadow-2xl rounded-2xl z-[110] overflow-hidden"
          >
            <div className="p-4 border-b border-black/5 flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg outline-none"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/5 rounded text-[10px] font-bold text-muted-foreground uppercase">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            <div className="p-2 max-h-[400px] overflow-y-auto">
               {filteredCommands.length > 0 ? (
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
                          className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                            cmd.danger
                            ? 'hover:bg-red-50 text-red-500'
                            : 'hover:bg-black/5 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                             <Icon className={`w-4 h-4 ${cmd.danger ? 'text-red-500' : 'text-muted-foreground'}`} />
                             <span className="text-sm font-medium">{cmd.label}</span>
                          </div>
                          {cmd.shortcut && (
                             <span className="text-[10px] font-bold text-muted-foreground bg-black/5 px-1.5 py-0.5 rounded uppercase">{cmd.shortcut}</span>
                          )}
                        </button>
                      )
                    })}
                 </div>
               ) : (
                 <div className="p-8 text-center text-muted-foreground text-sm">
                    No commands found.
                 </div>
               )}
            </div>

            <div className="p-3 bg-black/[0.02] border-t border-black/5 flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
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
