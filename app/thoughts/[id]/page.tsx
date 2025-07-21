import { notFound } from 'next/navigation';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { Thought } from '@/types';
import { ThoughtCard } from '@/components/thought-card';
import CommentSection from '@/components/comment-section';

// Firebase config from env vars
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

export default async function ThoughtDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const docRef = doc(db, 'thoughts', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }
  const data = docSnap.data();
  const thought: Thought = {
    id: docSnap.id,
    content: data.content || '',
    pseudonym: data.pseudonym || '',
    timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
    comments: data.comments || [],
    tags: data.tags || [],
    // add any other fields your Thought type requires
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-neutral-50 dark:bg-neutral-900">
      <div className="w-full max-w-2xl mx-auto">
        <ThoughtCard thought={thought} onThoughtsUpdate={() => {}} />
        <div className="mt-8">
          <CommentSection thoughtId={thought.id} />
        </div>
      </div>
    </div>
  );
} 