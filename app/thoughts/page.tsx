"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Thought } from "@/types";
import { ThoughtCard } from "@/components/thought-card";
import CommentSection from "@/components/comment-section";
import { ArrowLeft } from "lucide-react";
import { onAuthStateChanged, User } from "firebase/auth";

export default function ThoughtsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const thoughtId = searchParams.get('id');
  
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        router.push('/'); // Redirect to auth if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        if (thoughtId) {
          // Fetch specific thought
          const docRef = doc(db, "thoughts", thoughtId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSelectedThought({ id: docSnap.id, ...docSnap.data() } as Thought);
          } else {
            console.error("Thought not found");
            // Redirect back to thoughts list
            router.push('/thoughts');
          }
        } else {
          // Fetch all thoughts
          const q = query(collection(db, "thoughts"), orderBy("timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          const thoughtsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Thought[];
          setThoughts(thoughtsData);
        }
      } catch (error) {
        console.error("Error fetching thoughts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [thoughtId, user, router]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Redirecting to sign in...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Loading...
      </div>
    );
  }

  // Individual thought view
  if (thoughtId && selectedThought) {
    return (
      <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/thoughts')}
              className="flex items-center gap-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Thoughts</span>
            </button>
          </div>
          
          <ThoughtCard 
            thought={selectedThought} 
            onThoughtsUpdate={() => {
              // Refresh the thought data
              window.location.reload();
            }} 
          />
          
          <div className="mt-8">
            <CommentSection thoughtId={selectedThought.id} />
          </div>
        </div>
      </div>
    );
  }

  // All thoughts list view
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-neutral-900 dark:text-neutral-100">
          All Thoughts
        </h1>
        
        {thoughts.length === 0 ? (
          <div className="text-center text-neutral-600 dark:text-neutral-400">
            No thoughts found. <a href="/" className="text-blue-500 hover:underline">Create the first one!</a>
          </div>
        ) : (
          <div className="space-y-6">
            {thoughts.map((thought) => (
              <div 
                key={thought.id}
                onClick={() => router.push(`/thoughts?id=${thought.id}`)}
                className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              >
                <ThoughtCard 
                  thought={thought} 
                  onThoughtsUpdate={() => {
                    // Refresh thoughts when updated
                    window.location.reload();
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 