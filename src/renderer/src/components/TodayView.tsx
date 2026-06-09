import { Calendar, Target, AlertCircle, ArrowRight } from 'lucide-react'
import { RoadmapBlock } from '../lib/roadmap'

interface TodayViewProps {
  projectName: string
  blocks: RoadmapBlock[]
}

export default function TodayView({ projectName, blocks }: TodayViewProps) {
  const priorityBlock = blocks.find(b => b.priority === 'high' && b.status !== 'completed') || blocks[0]
  const inProgressCount = blocks.filter(b => b.status === 'in_progress').length
  const blockedCount = blocks.filter(b => b.status === 'blocked').length

  return (
    <div className="max-w-4xl mx-auto w-full space-y-12">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Welcome back, founder.</h1>
        <p className="text-muted-foreground font-medium">Here is the state of {projectName} today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-black text-white space-y-6 shadow-2xl shadow-black/10">
          <div className="flex items-center gap-2 text-white/60">
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Today's Priority</span>
          </div>
          <div className="space-y-4">
             <h2 className="text-3xl font-medium leading-tight">{priorityBlock?.title}</h2>
             <p className="text-white/60 leading-relaxed">{priorityBlock?.description}</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all group">
            Start Execution
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="space-y-6">
           <div className="p-6 rounded-3xl border border-black/5 bg-white space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-xs font-bold uppercase tracking-widest">In Progress</span>
              </div>
              <p className="text-4xl font-semibold tabular-nums">{inProgressCount}</p>
           </div>

           <div className="p-6 rounded-3xl border border-black/5 bg-white space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                 <AlertCircle className="w-4 h-4 text-red-500" />
                 <span className="text-xs font-bold uppercase tracking-widest">Blocked</span>
              </div>
              <p className="text-4xl font-semibold tabular-nums">{blockedCount}</p>
           </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl border border-black/5 bg-black/[0.01] space-y-6">
         <h3 className="font-semibold text-lg">Next Steps</h3>
         <div className="space-y-4">
            {blocks.slice(0, 3).map(block => (
              <div key={block.id} className="flex items-center justify-between p-4 bg-white border border-black/5 rounded-xl">
                 <span className="font-medium text-sm">{block.title}</span>
                 <span className="text-xs text-muted-foreground">{block.priority} priority</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  )
}
