import { motion } from 'framer-motion'
import { useState } from 'react'
import { FolderOpen, CheckCircle2 } from 'lucide-react'

interface WorkspaceSetupProps {
  onWorkspaceSelected: (path: string) => void
}

export default function WorkspaceSetup({ onWorkspaceSelected }: WorkspaceSetupProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  const handleSelect = async () => {
    setIsSelecting(true)
    try {
      // @ts-ignore
      const result = await window.api.selectFolder()
      if (result) {
        setSelectedPath(result)
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
    } finally {
      setIsSelecting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-background border border-black/10 rounded-2xl shadow-2xl p-8"
      >
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Select Your Workspace</h2>
            <p className="text-sm text-muted-foreground">
              Choose where Startup OS should store reports, roadmaps, project memory and generated files.
            </p>
          </div>

          <div className="space-y-4">
            {!selectedPath ? (
              <button
                onClick={handleSelect}
                disabled={isSelecting}
                className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-black/10 rounded-xl hover:border-black/20 hover:bg-black/[0.02] transition-all group"
              >
                <div className="p-3 bg-black/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-6 h-6 text-black/60" />
                </div>
                <span className="text-sm font-medium text-black/80">Select Workspace Folder</span>
              </button>
            ) : (
              <div className="p-4 bg-black/[0.02] border border-black/5 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Workspace Connected</p>
                    <p className="text-sm font-mono text-black/60 truncate max-w-[280px]">
                      {selectedPath}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedPath && (
              <button
                onClick={() => onWorkspaceSelected(selectedPath)}
                className="w-full h-12 bg-black text-white rounded-md text-sm font-medium hover:bg-black/90 transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
