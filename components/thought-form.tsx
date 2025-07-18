"use client"

import { useState, useEffect } from 'react'
import { Send } from 'lucide-react'
import { createThought } from '@/lib/firebase-service'
import { Thought } from '@/types'
import { cn } from '@/lib/utils'
import { generateShadowIdentity } from '@/lib/pseudonyms';

const TAG_OPTIONS = [
  '#philosophy', '#deepthoughts', '#randomthoughts', '#existential', '#showerthoughts', '#mentalhealth', '#overthinking', '#humancondition', '#introspection', '#ideas', '#curious', '#lifequestions', '#minddump', '#emotion', '#truth', '#technology', '#relationships', '#school', '#future', '#love', '#career', '#faith', '#politics', '#science', '#culture', '#identity', '#purpose', '#memory', '#dreams', '#addiction', '#networking', '#jobsearch', '#productivity', '#leadership', '#worklife', '#coding', '#ai', '#startups', '#linkedin', '#resume', '#interview', '#rant', '#confession', '#advice', '#storytime', '#question', '#pain', '#joy', '#inspiration', '#confused', '#lonely', '#hope', '#darkthoughts', '#lighthearted', '#anonymous'
];

const POST_TYPES = [
  { key: 'thought', label: '🧠 Thought', placeholder: "What’s been on your mind lately?" },
  { key: 'question', label: '❓ Question', placeholder: "What are you struggling to understand?" },
  { key: 'story', label: '📜 Story', placeholder: "Share a personal experience or memory." },
  { key: 'trigger', label: '🔥 Trigger', placeholder: "Say something that needs to be said." },
];

interface ThoughtFormProps {
  onThoughtCreated: (thought: Thought) => void
}

export function ThoughtForm({ onThoughtCreated }: ThoughtFormProps) {
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [postType, setPostType] = useState(POST_TYPES[0].key);
  const [shadowIdentity, setShadowIdentity] = useState<string | null>(null);

  // On mount, assign shadow identity if not present
  useEffect(() => {
    let identity = localStorage.getItem('thinkedin_shadow_identity');
    if (!identity) {
      identity = generateShadowIdentity();
              localStorage.setItem('thinkedin_shadow_identity', identity);
    }
    setShadowIdentity(identity);
  }, []);

  const selectedType = POST_TYPES.find(t => t.key === postType) || POST_TYPES[0];

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) setTags([...tags, tag]);
  };
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };
  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag.startsWith('#') ? tag : `#${tag}`]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }
    // Default tag if none
    const tagsToUse = tags.length === 0 ? ['#general'] : tags;
    setLoading(true);
    try {
      const id = await createThought({ content, tags: tagsToUse, type: postType, shadowIdentity: shadowIdentity || undefined });
      onThoughtCreated({ id, content, tags: tagsToUse, pseudonym: shadowIdentity || '', timestamp: new Date(), comments: [], type: postType });
      setContent('');
      setTags([]);
      setPostType(POST_TYPES[0].key);
    } catch (err: any) {
      setError(err.message || 'Failed to post thought.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm">
      {shadowIdentity && (
        <div className="mb-2 text-xs text-muted-foreground text-right italic">Your shadow identity: <span className="font-semibold text-foreground">{shadowIdentity}</span></div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post type selector */}
        <div className="flex gap-2 mb-2">
          {POST_TYPES.map(type => (
            <button
              key={type.key}
              type="button"
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium border",
                postType === type.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-muted text-foreground border-neutral-300 dark:border-neutral-700"
              )}
              onClick={() => setPostType(type.key)}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="thought" className="sr-only">
            {selectedType.placeholder}
          </label>
          <textarea
            id="thought"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={selectedType.placeholder}
            className={cn(
              "w-full min-h-[120px] p-4 border rounded-lg resize-none",
              "bg-background text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-colors"
            )}
            disabled={isSubmitting}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>Share your thoughts anonymously</span>
            <span>{content.length}/1000</span>
          </div>
        </div>
        
        <div>
          <div className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">Tags <span className="text-red-500">*</span></div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <select
              className="border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs bg-white dark:bg-neutral-900"
              value=""
              onChange={e => {
                if (e.target.value) handleAddTag(e.target.value);
              }}
            >
              <option value="" disabled>Select a tag...</option>
              {TAG_OPTIONS.filter(tag => !tags.includes(tag)).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <input
              type="text"
              className="border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 text-xs bg-white dark:bg-neutral-900"
              placeholder="Add custom tag"
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
          <div className="text-xs text-muted-foreground mb-2">Tags help others find your thoughts.</div>
        </div>
        
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
              Post Thought
            </>
          )}
        </button>
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
      </form>
    </div>
  )
} 