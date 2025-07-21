"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
  collection,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Logo } from "@/components/logo";
import MainApp from "@/components/main-app";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        // No user signed in, reset states
        setUsername(null);
        setShowUsernamePrompt(false);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // User signed in, set up real-time listener on user doc
      setLoading(true);
      const userDocRef = doc(db, "users", firebaseUser.uid);

      const unsubscribeUserDoc = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists() && docSnap.data().username) {
            setUsername(docSnap.data().username);
            setShowUsernamePrompt(false);
            setIsAuthenticated(true);
          } else {
            setUsername(null);
            setShowUsernamePrompt(true);
            setIsAuthenticated(false);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error listening to user document:", error);
          setError("Failed to load user data");
          setLoading(false);
        }
      );

      // Cleanup user doc listener on unmount or user change
      return () => unsubscribeUserDoc();
    });

    return () => unsubscribeAuth();
  }, []);

  const handleGoogleSignIn = async () => {
    setError("");
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle rest
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setError(err?.message || "An error occurred during sign-in. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSetUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);

    try {
      if (!usernameInput.trim()) {
        setError("Username is required.");
        setAuthLoading(false);
        return;
      }

      if (usernameInput.trim().length < 3) {
        setError("Username must be at least 3 characters long.");
        setAuthLoading(false);
        return;
      }

      // Check if username is taken
      const q = query(collection(db, "users"), where("username", "==", usernameInput.trim()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError("Username is already taken. Please choose a different one.");
        setAuthLoading(false);
        return;
      }

      // Save username
      if (user) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            username: usernameInput.trim(),
            email: user.email || null,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: Timestamp.now(),
          },
          { merge: true }
        );
        console.log("Username set successfully in Firestore");

        // No need to manually update UI here since onSnapshot listener handles it
      }
    } catch (err: any) {
      console.error("Error setting username:", err);
      setError(err?.message || "Failed to set username. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setAuthLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUsername(null);
      setShowUsernamePrompt(false);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err?.message || "An error occurred during logout.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
        <div className="text-center">
          <div className="mb-4">
            <Logo size={48} />
          </div>
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user && username) {
    return <MainApp />;
  }

  // Otherwise, show the authentication form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <div className="bg-neutral-50 rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Logo size={32} />
        </div>
        
        <h1 className="text-2xl font-bold mb-6 text-neutral-800">Welcome to ThinkedIn</h1>
        
        {showUsernamePrompt ? (
          <form onSubmit={handleSetUsername} className="space-y-4">
            <div className="text-left mb-4">
              <p className="text-sm text-neutral-600 mb-2">
                Hi <strong>{user?.displayName || user?.email}</strong>! 
              </p>
              <p className="text-sm text-neutral-600">
                Choose a unique username for ThinkedIn. This will be your anonymous identity and cannot be changed later.
              </p>
            </div>
            
            <input
              type="text"
              className="w-full border border-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              required
              placeholder="Enter your username"
              disabled={authLoading}
              minLength={3}
            />
            
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold hover:from-green-500 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={authLoading}
            >
              {authLoading ? "Setting up..." : "Continue to ThinkedIn"}
            </button>
            
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition disabled:opacity-50"
              disabled={authLoading}
            >
              Use different account
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="text-left text-sm text-neutral-600 space-y-2">
              <p>🧠 <strong>Share thoughts</strong> - What's been on your mind?</p>
              <p>❓ <strong>Ask questions</strong> - What are you curious about?</p>
              <p>📜 <strong>Tel stories</strong> - Share experiences anonymously</p>
              <p>🔥 <strong>Speak truth</strong> - Say what needs to be said</p>
            </div>
            
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold hover:from-green-500 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={authLoading}
            >
              {authLoading ? (
                "Signing in..."
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
            
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}
            
            <p className="text-xs text-neutral-500">
              By continuing, you agree to our terms. Your posts are anonymous and tied to a shadow identity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 