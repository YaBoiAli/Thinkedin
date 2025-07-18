"use client"

import { Comment } from '@/types'
import { useState } from 'react'
import { formatTimestamp } from '@/lib/utils'
import { MoreVertical, Pencil, Trash2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentItemProps {
  comment: Comment
  currentUserUid?: string
  onEdit: (commentId: string, newContent: string) => void
  onDelete: (commentId: string) => void
}

export function CommentItem({ comment, currentUserUid, onEdit, onDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [menuOpen, setMenuOpen] = useState(false)

  const isAuthor = currentUserUid && comment.uid && currentUserUid === comment.uid

  const handleSave = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim())
      setIsEditing(false)
    }
  }

  // Generate a consistent color for the avatar based on pseudonym
  const getAvatarColor = (pseudonym: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
    ]
    const hash = pseudonym.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const getInitials = (pseudonym: string) => {
    return pseudonym
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn(
      "group relative bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700/50",
      "hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all duration-200",
      "hover:shadow-sm hover:border-neutral-300 dark:hover:border-neutral-600"
    )}>
      {/* Comment header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm",
          "bg-gradient-to-br",
          getAvatarColor(comment.pseudonym || 'Anonymous')
        )}>
          {getInitials(comment.pseudonym || 'A')}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">
              {comment.pseudonym}
            </p>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {formatTimestamp(comment.timestamp)}
            </span>
          </div>
        </div>
        
        {isAuthor && !isEditing && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className={cn(
                "p-1.5 rounded-lg transition-colors duration-200",
                "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
                "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                "opacity-0 group-hover:opacity-100 focus:opacity-100"
              )}
              aria-label="Comment actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                                 <div className="absolute right-0 top-8 w-32 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-20 py-1">
                  <button
                    onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => { onDelete(comment.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Comment content or edit mode */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className={cn(
              "w-full min-h-[80px] p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg",
              "bg-neutral-50 dark:bg-neutral-900 text-foreground placeholder:text-neutral-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "transition-colors resize-none"
            )}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            maxLength={500}
            placeholder="Edit your comment..."
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              {editContent.length}/500
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(comment.content) }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!editContent.trim() || editContent === comment.content}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Save className="h-3 w-3" />
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="pl-11">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      )}
    </div>
  )
} 