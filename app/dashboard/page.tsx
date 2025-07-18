"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getUserComments, deleteThought } from '@/lib/firebase-service';
import { Logo } from '@/components/logo';
import Masonry from 'react-masonry-css';
import { useMemo } from 'react';

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

// Dashboard Thought Card Component with Pinterest-style random content length
function DashboardThoughtCard({ 
  thought, 
  editingId, 
  editContent, 
  setEditContent, 
  handleEdit, 
  handleEditSave, 
  handleEditCancel, 
  handleDelete 
}: { 
  thought: ThoughtWithTags;
  editingId: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  handleEdit: (id: string, content: string) => void;
  handleEditSave: (id: string) => void;
  handleEditCancel: () => void;
  handleDelete: (id: string) => void;
}) {
  const [showFull, setShowFull] = useState(false);
  
  // Pinterest-style random content length
  const contentPercent = useMemo(() => {
    const options = [0.2, 0.4, 0.6, 0.8]; // 20%, 40%, 60%, 80%
    return options[Math.floor(Math.random() * options.length)];
  }, [thought.id]);
  
  const maxLen = Math.ceil((thought.content?.length || 0) * contentPercent);
  const isTruncated = !showFull && thought.content.length > maxLen;
  const displayContent = showFull ? thought.content : thought.content.slice(0, maxLen);

  return (
    <div className="bg-neutral-800 rounded-xl shadow-lg p-6 flex flex-col gap-3 border border-neutral-700 hover:border-neutral-600 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {editingId === thought.id ? (
        <>
                     <textarea
             className="w-full border border-neutral-700 rounded-lg px-4 py-3 mb-3 text-base text-foreground bg-neutral-900 focus:border-neutral-500 focus:outline-none transition-colors resize-none"
             value={editContent}
             onChange={e => setEditContent(e.target.value)}
             rows={3}
           />
                       <div className="flex gap-2 pt-2">
               <button
                 onClick={() => handleEditSave(thought.id)}
                 className="py-2 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md"
               >
                 Save
               </button>
               <button
                 onClick={handleEditCancel}
                 className="py-2 px-4 rounded-lg bg-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-600 transition-all duration-200"
               >
                 Cancel
               </button>
             </div>
        </>
      ) : (
        <>
          <div className="text-base text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-hidden mb-2">
            {displayContent}
            {isTruncated && '...'}
          </div>
          {isTruncated && (
            <button
              className="text-xs text-blue-600 hover:underline mb-2 text-left"
              onClick={() => setShowFull(true)}
            >
              Show more
            </button>
          )}
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
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <button
                 onClick={() => handleEdit(thought.id, thought.content)}
                 className="py-1.5 px-3 rounded-lg bg-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-600 hover:text-white transition-all duration-200"
               >
                 Edit
               </button>
               <button
                 onClick={() => handleDelete(thought.id)}
                 className="py-1.5 px-3 rounded-lg bg-red-900/50 text-red-300 text-xs font-medium hover:bg-red-800 hover:text-red-100 transition-all duration-200"
               >
                 Delete
               </button>
             </div>
          </div>
        </>
      )}
    </div>
  );
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
    <div className="min-h-screen bg-neutral-900">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-6 flex justify-center">
          <Logo size={48} />
        </div>
        <h1 className="text-3xl font-light mb-8 text-center text-neutral-100 tracking-wide">
          {username ? `${username}'s Dashboard` : "Your Dashboard"}
        </h1>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-neutral-700"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Thoughts Section */}
            <section className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h2 className="text-xl font-medium text-neutral-200">Your Thoughts</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-neutral-700 to-transparent"></div>
              </div>
              {thoughts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-50">💭</div>
                  <p className="text-neutral-400 text-lg font-light">No thoughts yet</p>
                  <p className="text-neutral-500 text-sm mt-2">Start sharing your ideas with the world</p>
                </div>
              ) : (
                <Masonry
                  breakpointCols={{
                    default: 3,
                    1200: 2,
                    900: 2,
                    600: 1,
                  }}
                  className="flex w-auto gap-6"
                  columnClassName="masonry-column"
                >
                  {thoughts.map(thought => (
                    <DashboardThoughtCard
                      key={thought.id}
                      thought={thought}
                      editingId={editingId}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      handleEdit={handleEdit}
                      handleEditSave={handleEditSave}
                      handleEditCancel={handleEditCancel}
                      handleDelete={handleDelete}
                    />
                  ))}
                </Masonry>
              )}
            </section>
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
            {/* Comments Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                <h2 className="text-xl font-medium text-neutral-200">Your Comments</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-neutral-700 to-transparent"></div>
              </div>
              {comments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-50">💬</div>
                  <p className="text-neutral-400 text-lg font-light">No comments yet</p>
                  <p className="text-neutral-500 text-sm mt-2">Join conversations and share your thoughts</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {comments.map(comment => (
                    <li key={comment.id} className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 hover:border-neutral-600 transition-all duration-200 group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{comment.pseudonym}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp.toLocaleString()}</span>
                      </div>
                      {editingCommentId === comment.id ? (
                        <>
                          <textarea
                            className="w-full border border-neutral-700 rounded-lg px-3 py-2 mb-2 text-base text-foreground bg-neutral-900 focus:border-neutral-500 focus:outline-none transition-colors"
                            value={editCommentContent}
                            onChange={e => setEditCommentContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => handleEditCommentSave(comment.id)}
                              className="py-2 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCommentCancel}
                              className="py-2 px-4 rounded-lg bg-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-600 transition-all duration-200"
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
                              className="py-1.5 px-3 rounded-lg bg-neutral-700 text-neutral-300 text-xs font-medium hover:bg-neutral-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="py-1.5 px-3 rounded-lg bg-red-900/50 text-red-300 text-xs font-medium hover:bg-red-800 hover:text-red-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
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