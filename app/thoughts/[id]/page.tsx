import { notFound } from 'next/navigation';
import { Thought } from '@/types';
import { ThoughtCard } from '@/components/thought-card';
import CommentSection from '@/components/comment-section';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK only once
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : undefined;
if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

export default async function ThoughtDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const docRef = db.collection('thoughts').doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    notFound();
  }
  
  const data = docSnap.data()!;
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