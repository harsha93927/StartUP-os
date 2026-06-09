import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
}

const CLARIFICATION_QUESTIONS: Question[] = [
  {
    id: 'target_market',
    question: "Who is your primary target audience?",
    options: ["B2B Enterprises", "Individual Consumers", "Small Business Owners", "Software Developers"]
  },
  {
    id: 'monetization',
    question: "What is your planned revenue model?",
    options: ["Subscription SaaS", "One-time Purchase", "Transaction Fees", "Advertising/Freemium"]
  },
  {
    id: 'technical_exp',
    question: "What is your level of technical expertise?",
    options: ["Non-Technical Founder", "Product/Design Focused", "Experienced Engineer", "Full-Stack Team Ready"]
  }
]

interface ClarificationPhaseProps {
  onComplete: (answers: Record<string, string>) => void
}

export default function ClarificationPhase({ onComplete }: ClarificationPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleSelect = (option: string) => {
    const newAnswers = { ...answers, [CLARIFICATION_QUESTIONS[currentIndex].id]: option }
    setAnswers(newAnswers)

    if (currentIndex < CLARIFICATION_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      onComplete(newAnswers)
    }
  }

  const currentQuestion = CLARIFICATION_QUESTIONS[currentIndex]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-black/[0.03] rounded-lg">
                <HelpCircle className="w-5 h-5 text-black/60" />
             </div>
             <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clarification Phase</p>
                <p className="text-sm font-medium">Question {currentIndex + 1} of {CLARIFICATION_QUESTIONS.length}</p>
             </div>
          </div>
          <div className="flex gap-1">
             {CLARIFICATION_QUESTIONS.map((_, i) => (
               <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i <= currentIndex ? 'bg-black' : 'bg-black/5'}`} />
             ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h2 className="text-4xl font-semibold tracking-tight leading-tight">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="flex items-center justify-between p-6 rounded-2xl border border-black/5 bg-black/[0.01] hover:bg-black/[0.03] hover:border-black/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    {answers[currentQuestion.id] === option && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    <span className="text-lg font-medium">{option}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black/20 group-hover:text-black/60 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
              <button
                onClick={() => handleSelect('Other')}
                className="p-6 rounded-2xl border border-dashed border-black/10 text-muted-foreground hover:text-black hover:border-black/20 transition-all text-left"
              >
                Other / Skip
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
