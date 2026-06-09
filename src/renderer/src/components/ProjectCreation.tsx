import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import logo from '../assets/logo.png'

const projectSchema = z.object({
  name: z.string()
    .min(3, "Project name must be at least 3 characters")
    .max(120, "Project name is too long"),
  description: z.string()
    .min(10, "Please provide a more detailed description")
    .max(20000, "Description is too long"),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectCreationProps {
  onCreateProject: (data: ProjectFormData, attachments: File[]) => void
  isLoading?: boolean
}

export default function ProjectCreation({ onCreateProject, isLoading }: ProjectCreationProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: "onChange"
  })

  const descriptionValue = watch("description") || ""
  const projectName = watch("name") || ""

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [descriptionValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/markdown'
        ]
        return allowedTypes.includes(file.type) || file.name.endsWith('.md')
      })
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = (data: ProjectFormData) => {
    onCreateProject(data, attachments)
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col p-8">
      <div className="flex items-center gap-3 mb-12">
        <img src={logo} alt="SOS" className="w-8 h-8 object-contain" />
        <span className="text-xl font-semibold tracking-tight text-foreground">Startup OS</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground">What are you building?</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Describe your startup, product, company, service, website, app, platform or idea.
              The more context you provide, the better Startup OS can plan.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-24">
            {/* SECTION 1 - PROJECT NAME */}
            <div className="space-y-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Project Name</label>
              <input
                {...register("name")}
                className={`w-full text-3xl font-medium bg-transparent border-b-2 focus:outline-none transition-colors py-2 ${errors.name ? 'border-red-500' : 'border-black/10 focus:border-black'}`}
                placeholder="AI Resume Builder"
                autoFocus
              />
              {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>}
            </div>

            {/* SECTION 2 - PROJECT DESCRIPTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {descriptionValue.length.toLocaleString()} / 20,000
                </span>
              </div>
              <textarea
                {...register("description")}
                ref={(e) => {
                  register("description").ref(e)
                  // @ts-ignore
                  textareaRef.current = e
                }}
                className={`w-full text-xl leading-relaxed bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-muted-foreground/30 min-h-[200px]`}
                placeholder="We are building a platform that uses AI to analyze job descriptions and generate tailored resumes..."
              />
              {errors.description && <p className="text-sm text-red-500 font-medium">{errors.description.message}</p>}
            </div>

            {/* SECTION 3 - OPTIONAL ATTACHMENTS */}
            <div className="space-y-4">
              <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Optional Attachments</label>

              <div className="flex flex-wrap gap-3">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-black/5 px-3 py-2 rounded-lg group">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-black/20 hover:border-black/40 cursor-pointer transition-colors text-muted-foreground hover:text-black">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Add PDF, DOCX or TXT</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt,.md"
                  />
                </label>
              </div>
            </div>

            {/* SECTION 4 - CREATE PROJECT BUTTON */}
            <div className="pt-8">
              <button
                disabled={!isValid || isLoading}
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-black text-white px-10 py-5 text-lg font-medium hover:bg-black/90 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  `Create ${projectName || 'Project'}`
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
