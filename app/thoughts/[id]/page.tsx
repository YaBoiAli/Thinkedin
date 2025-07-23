"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Thought } from '@/types';
import { ThoughtCard } from '@/components/thought-card';
import CommentSection from '@/components/comment-section';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';

export default function ThoughtDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThought = async () => {
      try {
        const docRef = doc(db, 'thoughts', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          notFound();
          return;
        }
        
        const data = docSnap.data();
        const thoughtData: Thought = {
          id: docSnap.id,
          content: data.content || '',
          pseudonym: data.pseudonym || '',
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
          comments: data.comments || [],
          tags: data.tags || [],
          reactions: data.reactions || { inspired: 0, think: 0, relatable: 0, following: 0 },
        };
        
        setThought(thoughtData);
      } catch (error) {
        console.error('Error fetching thought:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchThought();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-neutral-500">Loading thought...</p>
      </div>
    );
  }

  if (!thought) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Thought Card */}
        <ThoughtCard thought={thought} />
        
        {/* Comment Section */}
        <div className="mt-8">
          <CommentSection thoughtId={thought.id} />
        </div>
      </div>
    </div>
  );
} 