"use client"

import { useState, useEffect, useMemo } from 'react'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Thought } from '@/types'
import { formatTimestamp } from '@/lib/utils'
import CommentSection from './comment-section'
import { cn } from '@/lib/utils'
import { updateReactionCount, subscribeToThought, getComments } from '@/lib/firebase-service';
import { useRouter } from 'next/navigation';

interface ThoughtCardProps {
  thought: Thought
  onThoughtsUpdate?: () => void
}

// Helper for post type emoji and label
const POST_TYPE_MAP: Record<string, { emoji: string; label: string }> = {
  thought: { emoji: '🧠', label: 'Thought' },
  question: { emoji: '❓', label: 'Question' },
  story: { emoji: '📜', label: 'Story' },
  trigger: { emoji: '🔥', label: 'Trigger' },
};

export function ThoughtCard({ thought, onThoughtsUpdate }: ThoughtCardProps) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false)
  const [reactions, setReactions] = useState(thought.reactions || { inspired: 0, think: 0, relatable: 0, following: 0 });
  const [userReactions, setUserReactions] = useState<{ [key: string]: boolean }>({});
  const [commentCount, setCommentCount] = useState(0);

  // Randomize content length per card - Pinterest style
  const [showFull, setShowFull] = useState(false);
  const contentPercent = useMemo(() => {
    const options = [0.2, 0.4, 0.6, 0.8]; // 20%, 40%, 60%, 80%
    return options[Math.floor(Math.random() * options.length)];
  }, [thought.id]);
  const maxLen = Math.ceil((thought.content?.length || 0) * contentPercent);
  const isTruncated = !showFull && thought.content.length > maxLen;
  const displayContent = showFull ? thought.content : thought.content.slice(0, maxLen);

  // Helper function to count all comments including nested replies
  const countAllComments = (comments: any[]): number => {
    let count = 0;
    comments.forEach(comment => {
      count += 1; // Count the comment itself
      if (comment.replies && comment.replies.length > 0) {
        count += countAllComments(comment.replies); // Recursively count replies
      }
    });
    return count;
  };

  useEffect(() => {
    // Load user reactions from localStorage
    const stored = localStorage.getItem(`thinkedin_reactions_${thought.id}`);
    if (stored) setUserReactions(JSON.parse(stored));
    
    // Load initial comment count
    getComments(thought.id).then(comments => {
      const totalCount = countAllComments(comments);
      setCommentCount(totalCount);
    }).catch(() => {
      setCommentCount(0);
    });
    
    // Subscribe to Firestore for real-time updates
    const unsubscribe = subscribeToThought(thought.id, (updated) => {
      if (updated.reactions) setReactions(updated.reactions);
      // Note: Comment count will be updated via onCommentCountChange callback from CommentSection
    });
    return () => unsubscribe();
  }, [thought.id]);

  const handleReaction = async (type: 'inspired' | 'think' | 'relatable' | 'following') => {
    if (userReactions[type]) {
      // Unreact: decrement count, update localStorage
      setReactions(r => ({ ...r, [type]: Math.max((r[type] || 1) - 1, 0) }));
      const newUserReactions = { ...userReactions, [type]: false };
      setUserReactions(newUserReactions);
      localStorage.setItem(`thinkedin_reactions_${thought.id}`, JSON.stringify(newUserReactions));
      try {
        await updateReactionCount(thought.id, type, -1);
      } catch {}
      return;
    }
    // React: increment count, update localStorage
    setReactions(r => ({ ...r, [type]: (r[type] || 0) + 1 }));
    const newUserReactions = { ...userReactions, [type]: true };
    setUserReactions(newUserReactions);
    localStorage.setItem(`thinkedin_reactions_${thought.id}`, JSON.stringify(newUserReactions));
    try {
      await updateReactionCount(thought.id, type, 1);
    } catch {}
  };

  return (
    <div
      className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer group p-4 mb-2 max-w-full overflow-hidden"
      style={{ minHeight: 120 }}
      onClick={e => {
        if ((e.target as HTMLElement).closest('button, a')) return;
        router.push(`/thoughts/${thought.id}`);
      }}
    >
      {/* Post type title */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">
          {POST_TYPE_MAP[thought.type || 'thought']?.emoji || '🧠'}
        </span>
        <span className="font-bold text-base text-foreground">
          {POST_TYPE_MAP[thought.type || 'thought']?.label || 'Thought'}
        </span>
      </div>
      {/* Post content (truncate to 3 lines) */}
      <div className="mb-3">
        <p className="text-foreground text-base leading-relaxed font-medium whitespace-pre-wrap break-words overflow-hidden">
          {displayContent}{isTruncated && '...'}
        </p>
        {isTruncated && (
          <button
            className="text-xs text-blue-600 hover:underline ml-1"
            onClick={e => { e.stopPropagation(); setShowFull(true); }}
          >Show more</button>
        )}
        {thought.tags && thought.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {thought.tags.map((tag: string) => (
              <span key={tag} className="inline-block bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Micro reactions */}
      <div className="flex gap-3 mt-1">
        <button
          className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-blue-400", userReactions['inspired'] ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-muted text-foreground border-neutral-300 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900")}
          onClick={() => handleReaction('inspired')}
          disabled={false}
        >
          <span className="text-sm">💡</span> {reactions.inspired || 0}
        </button>
        <button
          className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-blue-400", userReactions['think'] ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-muted text-foreground border-neutral-300 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900")}
          onClick={() => handleReaction('think')}
          disabled={false}
        >
          <span className="text-sm">🤔</span> {reactions.think || 0}
        </button>
        <button
          className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-blue-400", userReactions['relatable'] ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-muted text-foreground border-neutral-300 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900")}
          onClick={() => handleReaction('relatable')}
          disabled={false}
        >
          <span className="text-sm">🌀</span> {reactions.relatable || 0}
        </button>
        <button
          className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-blue-400", userReactions['following'] ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-muted text-foreground border-neutral-300 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900")}
          onClick={() => handleReaction('following')}
          disabled={false}
        >
          <span className="text-sm">👁️</span> {reactions.following || 0}
        </button>
      </div>
      {/* Comments section */}
      <div className="pt-3">
        <button
          onClick={e => { e.stopPropagation(); setShowComments(!showComments); }}
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span>
            {commentCount} comment{commentCount !== 1 ? 's' : ''}
          </span>
          {showComments ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showComments && (
          <div className="mt-3 animate-slide-up">
            <CommentSection
              thoughtId={thought.id}
              showBackButton={true}
              onBack={() => setShowComments(false)}
              onCommentCountChange={setCommentCount}
            />
          </div>
        )}
      </div>
    </div>
  )
} 