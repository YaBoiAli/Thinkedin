"use client";

import { useEffect, useState } from "react";
import { getThoughts } from "@/lib/firebase-service";
import { Thought as ThoughtType } from "@/types";
import Link from "next/link";
import { ThoughtCard } from '@/components/thought-card';
import Masonry from 'react-masonry-css';
import { Logo } from '@/components/logo';

interface Thought extends ThoughtType {
  tags?: string[];
}

export default function PostsPage() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'fyp'>('discover');

  useEffect(() => {
    getThoughts().then(setThoughts).finally(() => setLoading(false));
  }, []);

  // Filtered thoughts
  const filteredThoughts = thoughts.filter(thought => {
    const contentMatch = thought.content.toLowerCase().includes(search.toLowerCase());
    const tagMatch = (thought.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return contentMatch || tagMatch;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(filteredThoughts.flatMap(t => t.tags || [])));
  // If no tags, show #untagged
  if (allTags.length === 0) allTags.push('#untagged');

  // Map: tag -> posts
  const tagToPosts: Record<string, Thought[]> = {};
  allTags.forEach(tag => {
    tagToPosts[tag] = filteredThoughts.filter(t => (t.tags || []).includes(tag));
  });
  // Add untagged posts if any
  const untaggedPosts = filteredThoughts.filter(t => !t.tags || t.tags.length === 0);
  if (untaggedPosts.length > 0) tagToPosts['#untagged'] = untaggedPosts;

  // Posts for selected tag
  const selectedTagPosts = selectedTag
    ? filteredThoughts.filter(thought => (thought.tags || []).includes(selectedTag))
    : [];

  return (
    <div className="min-h-screen bg-neutral-900 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Tab bar */}
        <div className="flex justify-center mb-8 gap-2">
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-150 focus:outline-none
              ${activeTab === 'discover'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
            onClick={() => setActiveTab('discover')}
          >
            #Discover
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-150 focus:outline-none
              ${activeTab === 'fyp'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
            onClick={() => setActiveTab('fyp')}
          >
            FYP
          </button>
        </div>
        {activeTab === 'discover' ? (
          <>
            <div className="mb-6 flex justify-center">
              <Logo size={48} />
            </div>
            <h1 className="text-3xl font-extrabold mb-8 text-center text-neutral-900 dark:text-neutral-100">#Discover</h1>
            <div className="mb-6 flex justify-center">
              <input
                type="text"
                className="w-full max-w-xl border border-neutral-700 rounded px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 bg-neutral-800 text-neutral-100"
                placeholder="Search posts by content or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              filteredThoughts.length === 0 ? (
                <div className="text-center text-neutral-500 dark:text-neutral-400 mt-12">
                  No posts yet.<br />
                  <span className="text-blue-600 font-semibold">Be the first to post!</span>
                </div>
              ) : (
                <Masonry
                  breakpointCols={{ default: 4, 1200: 3, 900: 2, 600: 1 }}
                  className="flex w-auto gap-6"
                  columnClassName="masonry-column"
                >
                  {filteredThoughts.map(thought => (
                    <ThoughtCard key={`db-${thought.id}`} thought={thought} onThoughtsUpdate={() => {}} />
                  ))}
                </Masonry>
              )
            )}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] py-16">
            <span className="text-5xl mb-4">🚧</span>
            <h2 className="text-2xl font-bold mb-2 text-center">For You Page (FYP) is under construction</h2>
            <p className="text-base text-muted-foreground text-center max-w-md">
              We’re building a personalized feed just for you. Check back soon for tailored recommendations and trending posts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}