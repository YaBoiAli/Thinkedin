"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Thought } from "@/types";
import { ThoughtCard } from "@/components/thought-card";
import CommentSection from "@/components/comment-section";

export default function ThoughtDetailPage() {
  const { id } = useParams();
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
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-gray-50 dark:bg-neutral-900">
      <div className="w-full max-w-2xl mx-auto">
        <ThoughtCard thought={thought} onThoughtsUpdate={() => {}} />
        <div className="mt-8">
          <CommentSection thoughtId={thought.id} />
        </div>
      </div>
    </div>
  );
} 