import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
  where,
  onSnapshot,
  setDoc,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { generatePseudonym } from './pseudonyms';
import { sanitizeInput } from './utils';
import { Thought, Comment, ThoughtFormData, CommentFormData } from '@/types';
import { getAuth } from 'firebase/auth';

const THOUGHTS_COLLECTION = 'thoughts';
const COMMENTS_COLLECTION = 'comments';

function generateRandomPseudonym() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createThought(data: ThoughtFormData & { type?: string, shadowIdentity?: string }): Promise<string> {
  const sanitizedContent = sanitizeInput(data.content);
  
  if (!sanitizedContent) {
    throw new Error('Content cannot be empty');
  }

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const thoughtData = {
    content: sanitizedContent,
    pseudonym: data.shadowIdentity || generateRandomPseudonym(),
    timestamp: serverTimestamp(),
    comments: [],
    uid: currentUser ? currentUser.uid : null,
    tags: data.tags || [],
    type: data.type || 'thought',
    reactions: {
      inspired: 0,
      think: 0,
      relatable: 0,
      following: 0,
    },
  };

  const docRef = await addDoc(collection(db, THOUGHTS_COLLECTION), thoughtData);
  return docRef.id;
}

export async function getThoughts(limitCount: number = 50): Promise<Thought[]> {
  const q = query(
    collection(db, THOUGHTS_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const thoughts: Thought[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    thoughts.push({
      id: doc.id,
      content: data.content,
      pseudonym: data.pseudonym,
      timestamp: data.timestamp?.toDate() || new Date(),
      comments: data.comments || [],
      tags: data.tags || [], // Ensure tags are always included
    });
  });

  return thoughts;
}

export async function createComment(data: CommentFormData): Promise<string> {
  const sanitizedContent = sanitizeInput(data.content);
  
  if (!sanitizedContent) {
    throw new Error('Comment cannot be empty');
  }

  const auth = getAuth();
  const currentUser = auth.currentUser;

  const commentData = {
    content: sanitizedContent,
    pseudonym: generateRandomPseudonym(),
    timestamp: serverTimestamp(),
    thoughtId: data.thoughtId,
    uid: currentUser ? currentUser.uid : null,
  };

  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);
  
  // Fetch the created comment to get the resolved timestamp
  const createdCommentSnap = await getDocs(query(collection(db, COMMENTS_COLLECTION)));
  let createdComment: any = null;
  createdCommentSnap.forEach((docSnap) => {
    if (docSnap.id === docRef.id) createdComment = docSnap.data();
  });
  // Update the thought document to include the comment with resolved timestamp
  const thoughtRef = doc(db, THOUGHTS_COLLECTION, data.thoughtId);
  await updateDoc(thoughtRef, {
    comments: arrayUnion({
      id: docRef.id,
      content: sanitizedContent,
      pseudonym: commentData.pseudonym,
      timestamp: createdComment?.timestamp || new Date(),
      thoughtId: data.thoughtId,
      uid: commentData.uid,
    })
  });

  return docRef.id;
}

export async function getComments(thoughtId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    orderBy('timestamp', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const comments: Comment[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.thoughtId === thoughtId) {
      comments.push({
        id: doc.id,
        content: data.content,
        pseudonym: data.pseudonym,
        timestamp: data.timestamp?.toDate() || new Date(),
        thoughtId: data.thoughtId
      });
    }
  });

  return comments;
} 

export async function updateComment(commentId: string, newContent: string, uid: string): Promise<void> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Unauthorized');
  }
  const sanitizedContent = sanitizeInput(newContent);
  if (!sanitizedContent) throw new Error('Comment cannot be empty');
  const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
  await updateDoc(commentRef, { content: sanitizedContent });
}

export async function deleteComment(commentId: string, thoughtId: string, uid: string): Promise<void> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Unauthorized');
  }
  // Remove from comments collection
  const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
  await updateDoc(commentRef, { content: '[deleted]' }); // Optionally, you can use deleteDoc(commentRef) if you want to fully remove
  // Remove from thought's comments array
  const thoughtRef = doc(db, THOUGHTS_COLLECTION, thoughtId);
  const thoughtSnap = await getDocs(query(collection(db, THOUGHTS_COLLECTION), orderBy('timestamp', 'desc')));
  let targetThought: any = null;
  thoughtSnap.forEach((docSnap) => {
    if (docSnap.id === thoughtId) targetThought = docSnap.data();
  });
  if (targetThought && Array.isArray(targetThought.comments)) {
    const updatedComments = targetThought.comments.filter((c: any) => c.id !== commentId);
    await updateDoc(thoughtRef, { comments: updatedComments });
  }
}

export async function getUserComments(uid: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('uid', '==', uid),
    orderBy('timestamp', 'desc')
  );
  const querySnapshot = await getDocs(q);
  const comments: Comment[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    comments.push({
      id: doc.id,
      content: data.content,
      pseudonym: data.pseudonym,
      timestamp: data.timestamp?.toDate() || new Date(),
      thoughtId: data.thoughtId,
      uid: data.uid,
    });
  });
  return comments;
}

export async function updateReaction(thoughtId: string, reaction: 'inspired' | 'think' | 'relatable' | 'following', increment: number = 1): Promise<void> {
  const thoughtRef = doc(db, THOUGHTS_COLLECTION, thoughtId);
  await updateDoc(thoughtRef, {
    [`reactions.${reaction}`]: increment > 0 ? (arrayUnion(1)) : (arrayUnion(-1)),
  });
}

export async function updateReactionCount(thoughtId: string, reaction: 'inspired' | 'think' | 'relatable' | 'following', incrementBy: number = 1) {
  const thoughtRef = doc(db, 'thoughts', thoughtId);
  await updateDoc(thoughtRef, {
    [`reactions.${reaction}`]: increment(incrementBy),
  });
}

export async function deleteThought(thoughtId: string) {
  // Delete the thought document
  await deleteDoc(doc(db, 'thoughts', thoughtId));
  // Delete all comments with this thoughtId
  const commentsQuery = query(collection(db, 'comments'), where('thoughtId', '==', thoughtId));
  const commentsSnapshot = await getDocs(commentsQuery);
  const batchDeletes: Promise<void>[] = [];
  commentsSnapshot.forEach(commentDoc => {
    batchDeletes.push(deleteDoc(doc(db, 'comments', commentDoc.id)));
  });
  await Promise.all(batchDeletes);
}

export function subscribeToThought(thoughtId: string, callback: (thought: any) => void) {
  const thoughtRef = doc(db, 'thoughts', thoughtId);
  return onSnapshot(thoughtRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    }
  });
}

export { generateRandomPseudonym }; 

// --- Chatbot Voting Firestore Functions ---

const CHATBOT_VOTES_COLLECTION = 'chatbot_votes';

export async function getChatbotVotes(): Promise<{ want: string[]; dont: string[] }> {
  const snapshot = await getDocs(collection(db, CHATBOT_VOTES_COLLECTION));
  const want: string[] = [];
  const dont: string[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.vote === 'want') want.push(data.pseudonym);
    else if (data.vote === 'dont') dont.push(data.pseudonym);
  });
  return { want, dont };
}

export async function setChatbotVote(pseudonym: string, vote: 'want' | 'dont') {
  // Use pseudonym as doc id for idempotency
  await setDoc(doc(db, CHATBOT_VOTES_COLLECTION, pseudonym), { pseudonym, vote });
}

export function subscribeChatbotVotes(callback: (votes: { want: string[]; dont: string[] }) => void) {
  return onSnapshot(collection(db, CHATBOT_VOTES_COLLECTION), (snapshot) => {
    const want: string[] = [];
    const dont: string[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.vote === 'want') want.push(data.pseudonym);
      else if (data.vote === 'dont') dont.push(data.pseudonym);
    });
    callback({ want, dont });
  });
} 