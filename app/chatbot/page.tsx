"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { getChatbotVotes, setChatbotVote, subscribeChatbotVotes } from '@/lib/firebase-service';
import { Logo } from '@/components/logo';

interface Thought {
  id: string;
  content: string;
  pseudonym?: string;
  timestamp: string;
}

export default function ChatbotPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [vote, setVote] = useState<string | null>(null);
  const [votes, setVotes] = useState<{ want: string[]; dont: string[] }>({ want: [], dont: [] });
  const [shadowIdentity, setShadowIdentity] = useState<string>("");

  // On mount, assign shadow identity if not present and subscribe to votes
  useEffect(() => {
    let identity = localStorage.getItem('thinkedin_shadow_identity');
    if (!identity) {
      identity = require('@/lib/pseudonyms').generateShadowIdentity();
              localStorage.setItem('thinkedin_shadow_identity', identity || '');
    }
    setShadowIdentity(identity || '');
    // Subscribe to votes
    const unsubscribe = subscribeChatbotVotes((votes) => {
      setVotes(votes);
      // Set user's vote if present
      if (identity) {
        if (votes.want.includes(identity)) setVote('want');
        else if (votes.dont.includes(identity)) setVote('dont');
        else setVote(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Remove handleNotify and all email logic

  const handleVote = async (type: 'want' | 'dont') => {
    if (!shadowIdentity) return;
    await setChatbotVote(shadowIdentity, type);
    // vote and votes will update via subscription
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          <Logo size={24} />
        </div>
        <div className="mb-8 p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow flex flex-col items-center gap-4">
          <span className="text-5xl mb-2">🤖</span>
          <h1 className="text-2xl font-bold mb-1 text-center tracking-tight">ThinkBot coming soon</h1>
          <p className="text-base text-center text-muted-foreground leading-relaxed">
            You’ll soon be able to ask for advice, get post recommendations, or find wisdom from the past.
          </p>
        </div>
        {/* Voting Section */}
        <div className="w-full mt-8 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold text-center mb-2">Do you want ThinkBot?</h2>
          <div className="flex gap-4 mb-2">
            <button
              className={`px-6 py-2 rounded-lg font-semibold border transition text-base ${vote === 'want' ? 'bg-green-600 text-white border-green-700' : 'bg-neutral-100 dark:bg-neutral-800 text-green-700 border-green-400 hover:bg-green-100 dark:hover:bg-green-800'}`}
              onClick={() => handleVote('want')}
              disabled={vote === 'want'}
            >
              👍 I want this <span className="ml-1 font-bold">{votes.want.length}</span>
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-semibold border transition text-base ${vote === 'dont' ? 'bg-red-600 text-white border-red-700' : 'bg-neutral-100 dark:bg-neutral-800 text-red-700 border-red-400 hover:bg-red-100 dark:hover:bg-red-800'}`}
              onClick={() => handleVote('dont')}
              disabled={vote === 'dont'}
            >
              👎 I don't want this <span className="ml-1 font-bold">{votes.dont.length}</span>
            </button>
          </div>
          {vote && (
            <div className="mt-2 text-sm font-medium text-center">
              You voted: <span className={vote === 'want' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>{vote === 'want' ? 'I want this' : "I don't want this"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 