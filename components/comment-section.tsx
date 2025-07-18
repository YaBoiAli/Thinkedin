"use client";
import { useEffect, useState } from "react";
import { getComments, updateComment, deleteComment } from '@/lib/firebase-service';
import { Comment } from '@/types';
import { auth } from '@/lib/firebase';
import { CommentItem } from './comment-item';
import { CommentForm } from './comment-form';

export default function CommentSection({ thoughtId }: { thoughtId: string }) {
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
    <div className="mt-4">
      <div className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Comments</div>
      {!showForm ? (
        <button
          className="mb-4 px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          onClick={() => setShowForm(true)}
        >
          Add Comment
        </button>
      ) : (
        <CommentForm
          thoughtId={thoughtId}
          onCommentCreated={() => { setShowForm(false); reloadComments(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
      {loading ? (
        <div className="text-neutral-400 text-sm">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-neutral-400 text-sm">No comments yet.</div>
      ) : (
        <ul className="flex flex-col gap-2 mb-4">
          {comments.map(comment => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                currentUserUid={currentUserUid}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}
      {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
    </div>
  );
} 