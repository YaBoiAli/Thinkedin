"use client"

import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { createComment } from '@/lib/firebase-service'
import { cn } from '@/lib/utils'

interface CommentFormProps {
  thoughtId: string
  onCommentCreated: () => void
  onCancel: () => void
}

export function CommentForm({ thoughtId, onCommentCreated, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)


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
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-start gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className={cn(
              "flex-1 min-h-[80px] p-3 border rounded-lg resize-none",
              "bg-background text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-colors"
            )}
            disabled={isSubmitting}
            maxLength={500}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {content.length}/500
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cn(
                "p-2 rounded-lg text-muted-foreground hover:text-foreground",
                "hover:bg-muted transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              )}
            >
              <X className="h-4 w-4" />
            </button>
            
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
                  Post
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
} 