"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Logo } from '@/components/logo';

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if user has a username in Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists() && userDoc.data().username) {
          setUsername(userDoc.data().username);
          router.push("/");
        } else {
          setShowUsernamePrompt(true);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // User is now signed in, onAuthStateChanged will handle username check
    } catch (err: any) {
      setError(err?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!usernameInput.trim()) {
        setError("Username is required.");
        setLoading(false);
        return;
      }
      // Check for duplicate username
      const q = query(collection(db, "users"), where("username", "==", usernameInput.trim()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setError("Username is already taken.");
        setLoading(false);
        return;
      }
      // Save username to Firestore
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          username: usernameInput.trim(),
          email: user.email || null,
        });
        setUsername(usernameInput.trim());
        setShowUsernamePrompt(false);
        router.push("/");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to set username.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUsername(null);
      setShowUsernamePrompt(false);
    } catch (err: any) {
      setError(err?.message || "An error occurred during logout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Logo size={24} />
        </div>
        <h1 className="text-2xl font-bold mb-6">Sign in to Thinkedin</h1>
        {showUsernamePrompt ? (
          <form onSubmit={handleSetUsername} className="space-y-4">
            <p className="mb-2">Choose a unique username to use in thinkedin. This cannot be changed later.</p>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              required
              placeholder="Enter your username"
              disabled={loading}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 rounded bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold hover:from-green-500 hover:to-blue-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Set Username"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50 mt-2"
              disabled={loading}
            >
              Cancel & Logout
            </button>
          </form>
        ) : user ? (
          <>
            <p className="mb-4">Signed in as <span className="font-semibold">{username || user.displayName || user.email}</span></p>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-2 px-4 rounded bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold hover:from-green-500 hover:to-blue-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
            {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
} 