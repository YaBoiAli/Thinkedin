"use client"

import { useState } from 'react'
import { Send, X, Reply } from 'lucide-react'
import { createComment } from '@/lib/firebase-service'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'

interface ReplyFormProps {
  thoughtId: string
  parentId: string
  parentAuthor: string
  onReplyCreated: () => void
  onCancel: () => void
}

export function ReplyForm({ thoughtId, parentId, parentAuthor, onReplyCreated, onCancel }: ReplyFormProps) {
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
        thoughtId,
        parentId
      })
      
      onReplyCreated()
      setContent('')
      showToast('Reply posted successfully! 💬', 'success')
    } catch (error) {
      console.error('Error creating reply:', error)
      showToast('Failed to post reply. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800/50 ml-8 mt-2">
      <div className="flex items-center gap-2 mb-2">
        <Reply className="h-3 w-3 text-green-600 dark:text-green-400" />
        <h5 className="text-xs font-semibold text-green-900 dark:text-green-100">
          Replying to {parentAuthor}
        </h5>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your reply..."
            className={cn(
              "w-full min-h-[80px] p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg resize-none",
              "bg-neutral-50 dark:bg-neutral-900 text-foreground placeholder:text-neutral-500",
              "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500",
              "transition-all duration-200",
              "shadow-sm hover:shadow-md text-sm"
            )}
            disabled={isSubmitting}
            maxLength={500}
          />
          <div className="absolute bottom-2 right-2 text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-900 px-1 py-0.5 rounded">
            {content.length}/500
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Your reply will be posted anonymously
          </p>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
                "text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200",
                "hover:bg-neutral-100 dark:hover:bg-neutral-800",
                "focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className={cn(
                "flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                "transform hover:scale-105 active:scale-95"
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  Reply
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 