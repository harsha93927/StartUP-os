import { motion } from 'framer-motion'
import { Plus, Folder, Clock, ChevronRight } from 'lucide-react'

interface Project {
  id: number
  name: string
  path: string
  description: string
  created_at: string
}

interface ProjectSelectionProps {
  projects: Project[]
  onSelect: (project: Project) => void
  onNew: () => void
}

export default function ProjectSelection({ projects, onSelect, onNew }: ProjectSelectionProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col p-8 md:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <img src="/logo.png" className="w-4 h-4 invert" alt="SOS" />
             </div>
             <span className="text-xl font-bold tracking-tight">Startup OS</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Your Projects</h1>
          <p className="text-muted-foreground font-medium">Select a project to continue execution or start a new venture.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.button
            whileHover={{ y: -4 }}
            onClick={onNew}
            className="h-[200px] rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-secondary/50 transition-all group"
          >
            <div className="p-4 bg-secondary rounded-full group-hover:bg-background group-hover:scale-110 transition-all shadow-sm">
               <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold">Start New Project</span>
          </motion.button>

          {projects.map((project) => (
            <motion.button
              key={project.id}
              whileHover={{ y: -4 }}
              onClick={() => onSelect(project)}
              className="h-[200px] rounded-[2rem] border border-border bg-background p-8 flex flex-col justify-between text-left hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all group"
            >
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <div className="p-2 bg-secondary rounded-lg">
                       <Folder className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       <Clock className="w-3 h-3" />
                       <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                 </div>
                 <h3 className="text-xl font-semibold tracking-tight">{project.name}</h3>
                 <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{project.description}</p>
              </div>

              <div className="flex items-center justify-between mt-4">
                 <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">{project.path}</span>
                 <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
