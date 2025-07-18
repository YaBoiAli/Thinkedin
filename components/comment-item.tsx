"use client"

import { Comment } from '@/types'
import { useState } from 'react'
import { formatTimestamp } from '@/lib/utils'
import { MoreVertical, Pencil, Trash2, Save, X } from 'lucide-react'

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

  // Ensure timestamp is a Date
  // let displayTimestamp = comment.timestamp
  // if (displayTimestamp && typeof displayTimestamp === 'object' && typeof displayTimestamp.toDate === 'function') {
  //   displayTimestamp = displayTimestamp.toDate()
  // }

  return (
    <div className="bg-muted/30 rounded-lg p-4 relative">
      {/* Comment header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
          {comment.pseudonym?.split(' ').map(word => word[0]).join('')}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{comment.pseudonym}</p>
          <p className="text-xs text-muted-foreground">
            {formatTimestamp(comment.timestamp)}
          </p>
        </div>
        {isAuthor && !isEditing && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-1 rounded hover:bg-muted focus:outline-none"
              aria-label="Comment actions"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded shadow-lg z-10">
                <button
                  onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => { onDelete(comment.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left text-red-500"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Comment content or edit mode */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full min-h-[60px] p-2 border rounded"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            maxLength={500}
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 rounded bg-primary text-white text-xs font-semibold hover:bg-primary/90">
              <Save className="h-3 w-3" /> Save
            </button>
            <button onClick={() => { setIsEditing(false); setEditContent(comment.content) }} className="flex items-center gap-1 px-3 py-1 rounded bg-muted text-xs font-semibold">
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      )}
    </div>
  )
} 