import { motion } from 'framer-motion'
import { MoreHorizontal, Play, CheckCircle2, AlertCircle, Clock, Archive, MessageSquare } from 'lucide-react'
import { RoadmapBlock } from '../lib/roadmap'

interface RoadmapUIProps {
  blocks: RoadmapBlock[]
  onAskAI: (block: RoadmapBlock) => void
  onUpdateStatus?: (id: string, status: RoadmapBlock['status']) => void
}

const STATUS_ICONS = {
  not_started: Clock,
  in_progress: Play,
  completed: CheckCircle2,
  blocked: AlertCircle,
  skipped: Archive,
  archived: Archive
}

const STATUS_COLORS = {
  not_started: 'text-muted-foreground',
  in_progress: 'text-blue-500',
  completed: 'text-green-500',
  blocked: 'text-red-500',
  skipped: 'text-muted-foreground/40',
  archived: 'text-muted-foreground/20'
}

export default function RoadmapUI({ blocks, onAskAI }: RoadmapUIProps) {
  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full pb-20">
      {blocks.map((block, index) => {
        const Icon = STATUS_ICONS[block.status]
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={block.id}
            className="group relative bg-white border border-black/5 rounded-2xl p-6 hover:shadow-xl hover:shadow-black/5 hover:border-black/10 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className={`mt-1 ${STATUS_COLORS[block.status]}`}>
                   <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg tracking-tight">{block.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {block.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAskAI(block)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.03] hover:bg-black/[0.08] rounded-full text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask AI
                </button>
                <button className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {block.priority === 'high' && (
              <div className="mt-4 flex items-center gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-50 px-2 py-0.5 rounded">High Priority</span>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
