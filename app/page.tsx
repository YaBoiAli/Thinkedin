"use client"

import { useState, useEffect } from 'react'
import { ThoughtForm } from '@/components/thought-form'
import { ThoughtsList } from '@/components/thoughts-list'
import { Logo } from '@/components/logo'
import { Thought as ThoughtType } from '@/types'
import { getThoughts } from '@/lib/firebase-service'
import { auth } from '@/lib/firebase'
import { signOut, onAuthStateChanged, User } from 'firebase/auth'
import CommentSection from '@/components/comment-section'

type Thought = ThoughtType & { tags?: string[] };

function isFirestoreTimestamp(obj: any): obj is { toDate: () => Date } {
  return obj && typeof obj === 'object' && typeof obj.toDate === 'function' && !(obj instanceof Date);
}

export default function Home() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [search, setSearch] = useState("");
  const [filteredThoughts, setFilteredThoughts] = useState<Thought[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadThoughts()
    // Track Firebase Auth user
    const unsubscribe = onAuthStateChanged(auth, setUser)
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredThoughts(thoughts);
    } else {
      const q = search.toLowerCase();
      setFilteredThoughts(thoughts.filter(t => t.content.toLowerCase().includes(q)));
    }
  }, [search, thoughts]);

  useEffect(() => {
    const dismissed = localStorage.getItem('thinkedin_onboarding_dismissed');
    if (!dismissed) setShowOnboarding(true);
  }, []);

  const handleDismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('thinkedin_onboarding_dismissed', '1');
  };

  const loadThoughts = async () => {
    try {
      const thoughtsData = await getThoughts()
      setThoughts(thoughtsData)
    } catch (error) {
      console.error('Error loading thoughts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThoughtCreated = async (newThought: Thought) => {
    await loadThoughts(); // fetches all posts from Firestore, no duplicates
  }

  const handleLogout = async () => {
    await signOut(auth)
    setUser(null)
    // Optionally, redirect to /auth
    // window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-900 rounded-xl shadow-lg p-8 max-w-md w-full relative">
                          <button
                className="absolute top-2 right-2 text-xl text-neutral-400 hover:text-neutral-200"
                onClick={handleDismissOnboarding}
                aria-label="Close"
              >
              ×
            </button>
            <div className="mb-4 flex justify-center">
              <Logo size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome to ThinkedIn!</h2>
            <ul className="mb-4 space-y-2 text-base">
              <li>🧠 <b>Thought:</b> What’s been on your mind lately?</li>
              <li>❓ <b>Question:</b> What are you struggling to understand?</li>
              <li>📜 <b>Story:</b> Share a personal experience or memory.</li>
              <li>🔥 <b>Trigger:</b> Say something that needs to be said.</li>
            </ul>
            <div className="mb-4 text-sm text-muted-foreground text-center">
              Everything here is <b>anonymous</b>. Your posts are tied to a random shadow identity, not your real name.
            </div>
            <button
              className="w-full py-2 mt-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              onClick={handleDismissOnboarding}
            >
              Get started
            </button>
          </div>
        </div>
      )}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="flex flex-col items-center mb-8">
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <Logo size={64} />
            </div>
            <p className="text-lg text-neutral-500 dark:text-neutral-300 mt-2 text-center max-w-xl">
              A creative, anonymous space to share, discover, and get inspired by real stories, advice, and thoughts from people like you.
            </p>
          </div>
        </header>
        {/* Main content */}
        <main className="space-y-8">
          <ThoughtForm onThoughtCreated={handleThoughtCreated} />
        </main>
        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-neutral-400">
          <p>© 2024 thinkedin. A place for creative, anonymous reflection.</p>
        </footer>
      </div>
    </div>
  )
} 