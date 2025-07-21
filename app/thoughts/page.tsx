"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const thoughtId = searchParams.get('id');
  
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check authentication
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.uid}` : "No user");
      setUser(firebaseUser);
      if (!firebaseUser) {
        console.log("User not signed in, redirecting to home");
        router.push('/'); // Redirect to auth if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Redirect /thoughts/[id] to /thoughts?id=... for static hosting
  useEffect(() => {
    // If the path is /thoughts/[id], redirect to /thoughts?id=[id]
    const match = pathname.match(/^\/thoughts\/([A-Za-z0-9_-]+)$/);
    if (match && !thoughtId) {
      const id = match[1];
      router.replace(`/thoughts?id=${id}`);
    }
  }, [pathname, thoughtId, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      console.log("Fetching data for thoughtId:", thoughtId);
      setError(null);
      
      try {
        if (thoughtId) {
          // Fetch specific thought
          console.log("Fetching specific thought:", thoughtId);
          const docRef = doc(db, "thoughts", thoughtId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            console.log("Thought found:", docSnap.data());
            setSelectedThought({ id: docSnap.id, ...docSnap.data() } as Thought);
          } else {
            console.error("Thought not found for ID:", thoughtId);
            setError("Thought not found. It may have been deleted or you don't have permission to view it.");
            // Don't redirect immediately, let user see the error
          }
        } else {
          // Fetch all thoughts
          console.log("Fetching all thoughts");
          const q = query(collection(db, "thoughts"), orderBy("timestamp", "desc"));
          const querySnapshot = await getDocs(q);
          const thoughtsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Thought[];
          console.log("Found thoughts:", thoughtsData.length);
          setThoughts(thoughtsData);
        }
      } catch (error) {
        console.error("Error fetching thoughts:", error);
        setError(`Failed to load thoughts: ${error}`);
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

  // Show error if there's one
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <button
              onClick={() => router.push('/thoughts')}
              className="flex items-center gap-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Thoughts</span>
            </button>
          </div>
          <div className="text-lg text-red-500 mb-4">Error</div>
          <div className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Individual thought view
  if (thoughtId && selectedThought) {
    console.log("Rendering individual thought view for:", selectedThought.id);
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

  // If thoughtId is provided but no selectedThought, show error
  if (thoughtId && !selectedThought) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <button
              onClick={() => router.push('/thoughts')}
              className="flex items-center gap-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to Thoughts</span>
            </button>
          </div>
          <div className="text-lg text-red-500 mb-4">Thought Not Found</div>
          <div className="text-neutral-600 dark:text-neutral-400">
            The thought you're looking for doesn't exist or you don't have permission to view it.
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
                onClick={() => {
                  console.log("Clicking on thought:", thought.id);
                  router.push(`/thoughts?id=${thought.id}`);
                }}
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