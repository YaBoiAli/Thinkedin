import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
    }
    // Fetch up to 20 recent posts from Firestore
    let posts: { id: string; content: string; pseudonym?: string; timestamp?: string }[] = [];
    try {
      const q = query(collection(db, 'thoughts'), orderBy('timestamp', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      posts = snapshot.docs.map(doc => ({
        id: doc.id,
        content: doc.data().content,
        pseudonym: doc.data().pseudonym,
        timestamp: doc.data().timestamp,
      }));
    } catch (e) {
      // If Firestore fails, continue with empty posts
    }
    // Build the Gemini prompt
    const numberedPosts = posts.map((p, i) => `${i + 1}. "${p.content}"`).join('\n');
    const geminiPrompt = `User request: "${prompt}"
Here are some recent posts:
${numberedPosts}

Based on the user's request, which of these posts are most relevant? Reply with the numbers of the best matches and a short explanation.`;
    // Call Gemini
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
      }),
    });
    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: 'Gemini API error', details: err }, { status: 500 });
    }
    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Try to extract post numbers from Gemini's response
    const match = text.match(/\b(\d+(?:,\s*\d+)*)\b/);
    let selectedPosts: typeof posts = [];
    if (match) {
      const nums = match[1].split(/,\s*/).map((n: string) => parseInt(n, 10) - 1);
    }
    return NextResponse.json({ text, selectedPosts, raw: data });
  } catch (e: any) {
    console.error("Gemini API error:", e);
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
} 