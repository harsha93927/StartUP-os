import { Calendar, Target, AlertCircle, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react'
import { RoadmapBlock } from '../lib/roadmap'

interface TodayViewProps {
  projectName: string
  blocks: RoadmapBlock[]
}

export default function TodayView({ projectName, blocks }: TodayViewProps) {
  const priorityBlock = blocks.find(b => b.priority === 'high' && b.status !== 'completed') || blocks[0]
  const inProgressCount = blocks.filter(b => b.status === 'in_progress').length
  const completedCount = blocks.filter(b => b.status === 'completed').length
  const totalCount = blocks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto w-full space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground font-medium">Tracking progress for <span className="text-foreground">{projectName}</span></p>
        </div>

        <div className="flex items-center gap-6 bg-secondary/50 border border-border px-5 py-3 rounded-2xl">
           <div className="space-y-1 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completion</p>
              <p className="text-xl font-semibold tabular-nums">{progressPercent}%</p>
           </div>
           <div className="w-px h-8 bg-border" />
           <div className="space-y-1 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Tasks</p>
              <p className="text-xl font-semibold tabular-nums">{inProgressCount}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 p-8 rounded-[2rem] bg-primary text-primary-foreground space-y-8 shadow-2xl shadow-primary/10 relative overflow-hidden group">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-primary-foreground/60">
              <Target className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Immediate Priority</span>
            </div>
            <div className="space-y-3">
               <h2 className="text-3xl font-medium leading-tight tracking-tight">{priorityBlock?.title}</h2>
               <p className="text-primary-foreground/70 leading-relaxed text-sm max-w-md">{priorityBlock?.description}</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all">
              Execute Block
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 ml-12 mb-12 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="space-y-6 flex flex-col">
           <div className="flex-1 p-6 rounded-[2rem] border border-border bg-background flex flex-col justify-between group hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between">
                 <div className="p-2 bg-secondary rounded-xl">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Velocity</span>
              </div>
              <div>
                 <p className="text-3xl font-semibold tabular-nums tracking-tighter">Normal</p>
                 <p className="text-[10px] text-muted-foreground mt-1 font-medium">Progress steady this week</p>
              </div>
           </div>

           <div className="p-6 rounded-[2rem] border border-border bg-background flex flex-col justify-between group hover:border-primary/20 transition-colors">
              <div className="flex items-center justify-between">
                 <div className="p-2 bg-secondary rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Done</span>
              </div>
              <p className="text-4xl font-semibold tabular-nums tracking-tighter">{completedCount}</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Up Next</h3>
            <button className="text-xs font-medium text-primary hover:underline">View Roadmap</button>
         </div>
         <div className="grid grid-cols-1 gap-3">
            {blocks.filter(b => b.status === 'not_started').slice(0, 3).map(block => (
              <div key={block.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:bg-secondary/30 transition-colors group">
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-muted-foreground transition-colors" />
                    <span className="font-medium text-sm tracking-tight">{block.title}</span>
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{block.priority}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  )
}
