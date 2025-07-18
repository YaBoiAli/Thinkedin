"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Thought } from "@/types";
import { ThoughtCard } from "@/components/thought-card";
import CommentSection from "@/components/comment-section";
import { ArrowLeft } from "lucide-react";

export default function ThoughtDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchThought = async () => {
      try {
        const docRef = doc(db, "thoughts", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setThought({ id: docSnap.id, ...docSnap.data() } as Thought);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchThought();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-lg">Loading...</div>;
  }
  if (notFound || !thought) {
    return <div className="flex justify-center items-center min-h-screen text-lg text-red-500">Thought not found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        
        <ThoughtCard thought={thought} onThoughtsUpdate={() => {}} />
        <div className="mt-8">
          <CommentSection thoughtId={thought.id} />
        </div>
      </div>
    </div>
  );
} 