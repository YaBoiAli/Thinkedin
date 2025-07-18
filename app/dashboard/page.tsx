"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getUserComments, deleteThought } from '@/lib/firebase-service';
import { Logo } from '@/components/logo';

interface Thought {
  id: string;
  content: string;
  timestamp: string;
}

type ThoughtWithTags = Thought & { tags?: string[] };

interface UserComment {
  id: string;
  content: string;
  pseudonym: string;
  timestamp: Date;
  thoughtId: string;
}

// Helper to robustly convert Firestore Timestamp, string, or Date to Date
function toDateSafe(ts: any): Date | null {
  if (!ts) return null;
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  if (ts instanceof Date) return ts;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts.toDate) return ts.toDate();
  return null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [comments, setComments] = useState<UserComment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        router.push("/auth");
        return;
      }
      // Get username
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      setUsername(userDoc.exists() ? userDoc.data().username : null);
      // Fetch user's thoughts
      const q = query(collection(db, "thoughts"), where("uid", "==", firebaseUser.uid));
      const snapshot = await getDocs(q);
      const userThoughts: ThoughtWithTags[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        content: docSnap.data().content,
        timestamp: docSnap.data().timestamp,
        tags: docSnap.data().tags,
      })).sort((a, b) => {
        const getTime = (ts: any) => {
          if (!ts) return 0;
          if (typeof ts === 'string') return new Date(ts).getTime();
          if (ts instanceof Timestamp) return ts.toDate().getTime();
          if (ts.toDate) return ts.toDate().getTime();
          return 0;
        };
        return getTime(b.timestamp) - getTime(a.timestamp);
      });
      setThoughts(userThoughts);
      // Fetch user's comments
      const userComments = await getUserComments(firebaseUser.uid);
      setComments(userComments);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await deleteThought(id);
      setThoughts(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError("Failed to delete thought.");
    }
  };

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleEditSave = async (id: string) => {
    setError("");
    try {
      await updateDoc(doc(db, "thoughts", id), { content: editContent });
      setThoughts(prev => prev.map(t => t.id === id ? { ...t, content: editContent } : t));
      setEditingId(null);
      setEditContent("");
    } catch (err: any) {
      setError("Failed to update thought.");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent("");
  };

  // Add edit/delete handlers for comments
  const handleEditComment = (id: string, content: string) => {
    setEditingCommentId(id);
    setEditCommentContent(content);
  };
  const handleEditCommentSave = async (id: string) => {
    setError("");
    try {
      await updateDoc(doc(db, "comments", id), { content: editCommentContent });
      setComments(prev => prev.map(c => c.id === id ? { ...c, content: editCommentContent } : c));
      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (err: any) {
      setError("Failed to update comment.");
    }
  };
  const handleEditCommentCancel = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };
  const handleDeleteComment = async (id: string) => {
    setError("");
    try {
      await deleteDoc(doc(db, "comments", id));
      setComments(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setError("Failed to delete comment.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 flex justify-center">
          <Logo size={24} />
        </div>
        <h1 className="text-3xl font-extrabold mb-6 text-center text-neutral-900 dark:text-neutral-100">
          {username ? `${username}'s Dashboard` : "Your Dashboard"}
        </h1>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Thoughts Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300 border-b border-blue-200 dark:border-blue-800 pb-2">Your Thoughts</h2>
              {thoughts.length === 0 ? (
                <div className="text-center text-neutral-500 dark:text-neutral-400">You haven't posted any thoughts yet.</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {thoughts.map(thought => (
                    <div key={thought.id} className="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 flex flex-col gap-2 border border-neutral-200 dark:border-neutral-700 hover:scale-[1.02] transition-transform">
                      {editingId === thought.id ? (
                        <>
                          <textarea
                            className="w-full border rounded px-3 py-2 mb-2 text-base text-foreground bg-neutral-50 dark:bg-neutral-900"
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSave(thought.id)}
                              className="py-1 px-4 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="py-1 px-4 rounded bg-neutral-300 dark:bg-neutral-700 text-xs font-semibold hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-base text-foreground leading-relaxed whitespace-pre-wrap mb-2">{thought.content}</div>
                          {thought.tags && thought.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {thought.tags.map((tag: string) => (
                                <span key={tag} className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{(() => {
                              const date = toDateSafe(thought.timestamp);
                              return date ? date.toLocaleString() : 'No date';
                            })()}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(thought.id, thought.content)}
                                className="py-1 px-4 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(thought.id)}
                                className="py-1 px-4 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            {/* Comments Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-300 border-b border-green-200 dark:border-green-800 pb-2">Your Comments</h2>
              {comments.length === 0 ? (
                <div className="text-center text-neutral-500 dark:text-neutral-400">You haven't posted any comments yet.</div>
              ) : (
                <ul className="space-y-4">
                  {comments.map(comment => (
                    <li key={comment.id} className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{comment.pseudonym}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp.toLocaleString()}</span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <>
                          <textarea
                            className="w-full border rounded px-3 py-2 mb-2 text-base text-foreground bg-neutral-50 dark:bg-neutral-900"
                            value={editCommentContent}
                            onChange={e => setEditCommentContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => handleEditCommentSave(comment.id)}
                              className="py-1 px-4 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCommentCancel}
                              className="py-1 px-4 rounded bg-neutral-300 dark:bg-neutral-700 text-xs font-semibold hover:bg-neutral-400 dark:hover:bg-neutral-600 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-2 text-foreground">{comment.content}</div>
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => handleEditComment(comment.id, comment.content)}
                              className="py-1 px-4 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="py-1 px-4 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                      {/* Replace anchor with button for navigation */}
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => router.push(`/thoughts/${comment.thoughtId}`)}
                      >
                        View related thought
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
} 