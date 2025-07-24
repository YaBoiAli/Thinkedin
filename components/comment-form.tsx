"use client"

import { useState } from 'react'
import { Send, X, MessageCircle } from 'lucide-react'
import { createComment } from '@/lib/firebase-service'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'

interface CommentFormProps {
  thoughtId: string
  onCommentCreated: () => void
  onCancel: () => void
}

export function CommentForm({ thoughtId, onCommentCreated, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      await createComment({
        content: content.trim(),
        thoughtId
      })
      
      onCommentCreated()
      setContent('')
      showToast('Comment posted successfully! 💬', 'success')
    } catch (error) {
      console.error('Error creating comment:', error)
      showToast('Failed to post comment. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/50">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Share your thoughts
        </h4>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are your thoughts on this?"
            className={cn(
              "w-full min-h-[100px] p-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg resize-none",
              "bg-neutral-50 dark:bg-neutral-900 text-foreground placeholder:text-neutral-500",
              "focus:outline-none",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md"
            )}
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="absolute bottom-2 right-2 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900 px-2 py-1 rounded">
            {content.length}/500
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Your comment will be posted anonymously
          </p>
          
          <div className="flex items-center gap-2">
                         <button
               type="button"
               onClick={onCancel}
               disabled={isSubmitting}
               className={cn(
                 "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                 "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
                 "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                 "focus:outline-none select-none",
                 "disabled:opacity-50 disabled:cursor-not-allowed"
               )}
             >
              <X className="h-4 w-4" />
              Cancel
            </button>
            
                         <button
               type="submit"
               disabled={!content.trim() || isSubmitting}
               className={cn(
                 "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                 "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
                 "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm",
                 "focus:outline-none select-none",
                 "transform hover:scale-105 active:scale-95"
               )}
             >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Post Comment
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 