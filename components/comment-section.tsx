"use client";
import { useEffect, useState } from "react";
import { getComments, updateComment, deleteComment } from '@/lib/firebase-service';
import { Comment } from '@/types';
import { auth } from '@/lib/firebase';
import { CommentItem } from './comment-item';
import { CommentForm } from './comment-form';
import { MessageCircle, Plus, ArrowLeft } from 'lucide-react';

interface CommentSectionProps {
  thoughtId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function CommentSection({ thoughtId, onBack, showBackButton = false }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserUid, setCurrentUserUid] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const reloadComments = () => {
    setLoading(true);
    getComments(thoughtId)
      .then(setComments)
      .catch(() => setError("Failed to load comments."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadComments();
    setCurrentUserUid(auth.currentUser?.uid);
  }, [thoughtId]);

  const handleEdit = async (commentId: string, newContent: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment || !currentUserUid) return;
      await updateComment(commentId, newContent, currentUserUid);
      setComments(comments => comments.map(c => c.id === commentId ? { ...c, content: newContent } : c));
    } catch {
      setError('Failed to update comment.');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment || !currentUserUid) return;
      await deleteComment(commentId, thoughtId, currentUserUid);
      setComments(comments => comments.filter(c => c.id !== commentId));
    } catch {
      setError('Failed to delete comment.');
    }
  };

  return (
    <div className="mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center w-8 h-8 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <MessageCircle className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-lg font-semibold text-foreground">
            Comments
          </h3>
          <span className="inline-flex items-center justify-center w-6 h-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs font-medium">
            {comments.length}
          </span>
        </div>
        
        {!showForm && (
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add Comment
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <div className="mb-6">
          <CommentForm
            thoughtId={thoughtId}
            onCommentCreated={() => { setShowForm(false); reloadComments(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-neutral-500">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserUid={currentUserUid}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 