"use client"

import { Thought } from '@/types'
import { ThoughtCard } from './thought-card'
import { cn } from '@/lib/utils'
import Masonry from 'react-masonry-css';

interface ThoughtsListProps {
  thoughts: Thought[]
  onThoughtsUpdate: () => void
}

export function ThoughtsList({ thoughts, onThoughtsUpdate }: ThoughtsListProps) {
  if (thoughts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💭</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No thoughts yet
        </h3>
        <p className="text-muted-foreground">
          Be the first to share what's on your mind
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Recent Thoughts
      </h2>
      <Masonry
        breakpointCols={{
          default: 4,
          1600: 5,
          1200: 4,
          900: 3,
          600: 2,
        }}
        className="flex w-auto gap-6"
        columnClassName="masonry-column"
      >
        {thoughts.map((thought) => (
          <div key={thought.id} className="mb-6 break-inside-avoid">
            <ThoughtCard
              thought={thought}
              onThoughtsUpdate={onThoughtsUpdate}
            />
          </div>
        ))}
      </Masonry>
      <style jsx global>{`
        .masonry-column {
          background-clip: padding-box;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  )
} 