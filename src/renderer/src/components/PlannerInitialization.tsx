import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, Check } from 'lucide-react'

interface PlannerInitializationProps {
  projectName: string
  onComplete: () => void
}

const INITIALIZATION_STEPS = [
  "Analyzing Project Intent",
  "Understanding Target Outcome",
  "Identifying Missing Information",
  "Determining Required Specialists",
  "Preparing Planning Session"
]

export default function PlannerInitialization({ projectName, onComplete }: PlannerInitializationProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (currentStep < INITIALIZATION_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
      }, 1500 + Math.random() * 1000)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(onComplete, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, onComplete])

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg text-center space-y-12"
      >
        <div className="space-y-4">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-20 h-20 bg-black/[0.02] border border-black/5 rounded-3xl mx-auto flex items-center justify-center shadow-sm"
          >
            <Sparkles className="w-8 h-8 text-black/60" />
          </motion.div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">{projectName}</h2>
        </div>

        <div className="space-y-6 text-left">
          {INITIALIZATION_STEPS.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="relative w-5 h-5 flex items-center justify-center">
                {index < currentStep ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-black rounded-full flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                ) : index === currentStep ? (
                  <Loader2 className="w-5 h-5 text-black/40 animate-spin" />
                ) : (
                  <div className="w-2 h-2 bg-black/10 rounded-full" />
                )}
              </div>
              <span className={`text-sm font-medium transition-colors ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
