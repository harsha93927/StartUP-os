import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  rememberMe: z.boolean().optional(),
})

type AuthFormData = z.infer<typeof authSchema>

const MESSAGES = [
  "Every startup starts with a single decision.",
  "Turn uncertainty into a roadmap.",
  "Build smarter. Execute faster.",
  "Your AI startup strategist.",
]

export default function AuthScreen({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      rememberMe: false
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true)
    setAuthError(null)

    setTimeout(() => {
      if (data.email === "test@example.com" && data.password === "password123") {
        onAuthSuccess()
      } else if (data.email.includes("error")) {
         setAuthError("Invalid credentials. Please try again.")
      } else {
        onAuthSuccess()
      }
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex border-r border-border bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
             <div className="w-3 h-3 bg-background rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Startup OS</span>
        </div>

        <div className="relative h-64 flex flex-col justify-center">
           <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1 }}
              className="text-4xl font-medium leading-tight max-w-md tracking-tight"
            >
              {MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
          <p className="mt-6 text-muted-foreground font-medium">From idea to execution</p>
        </div>

        <div className="text-sm text-muted-foreground font-medium">
          © 2024 Startup OS. All rights reserved.
        </div>

        <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary rounded-full" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary rounded-full" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary rounded-full" />
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm font-medium">Enter your credentials to access your workspace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="email">Email</label>
                <input
                  {...register("email")}
                  className={`flex h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.email ? 'border-red-500' : 'border-border hover:border-muted-foreground/50'} transition-all`}
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground" htmlFor="password">Password</label>
                  <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">Forgot password?</button>
                </div>
                <input
                  {...register("password")}
                  className={`flex h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.password ? 'border-red-500' : 'border-border hover:border-muted-foreground/50'} transition-all`}
                  id="password"
                  type="password"
                />
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  {...register("rememberMe")}
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded-md border-border text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none text-muted-foreground">Keep me signed in</label>
              </div>
            </div>

            {authError && (
              <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                {authError}
              </p>
            )}

            <button
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:opacity-90 h-11 px-8 w-full shadow-lg shadow-primary/10"
              type="submit"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-background px-3 text-muted-foreground">New to Startup OS?</span>
            </div>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-secondary h-11 px-8 w-full"
            type="button"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  )
}
