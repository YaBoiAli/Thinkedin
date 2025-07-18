import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Content moderation function
export const moderateContent = functions.firestore
  .document('thoughts/{thoughtId}')
  .onCreate(async (snap, context) => {
    const thoughtData = snap.data();
    const content = thoughtData?.content || '';
    
    // Basic profanity filter (you can expand this list)
    const profanityList = [
      'badword1', 'badword2', 'badword3' // Add your profanity list here
    ];
    
    const lowerContent = content.toLowerCase();
    const hasProfanity = profanityList.some(word => lowerContent.includes(word));
    
    if (hasProfanity) {
      // Delete the thought if it contains profanity
      await snap.ref.delete();
      console.log(`Thought ${context.params.thoughtId} deleted due to profanity`);
      return;
    }
    
    // Check for spam (repeated content)
    const recentThoughts = await db.collection('thoughts')
      .where('content', '==', content)
      .where('timestamp', '>', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))) // Last 24 hours
      .get();
    
    if (recentThoughts.size > 2) {
      // Delete if same content posted more than 2 times in 24 hours
      await snap.ref.delete();
      console.log(`Thought ${context.params.thoughtId} deleted due to spam`);
      return;
    }
    
    // TODO: Add AI content validation
    // This is a placeholder for future AI integration
    // You can integrate with OpenAI or other AI services here
    const isValidThought = await validateThoughtWithAI(content);
    
    if (!isValidThought) {
      await snap.ref.delete();
      console.log(`Thought ${context.params.thoughtId} deleted due to AI validation failure`);
      return;
    }
    
    console.log(`Thought ${context.params.thoughtId} passed moderation`);
  });

// Comment moderation function
export const moderateComment = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (snap, context) => {
    const commentData = snap.data();
    const content = commentData?.content || '';
    
    // Basic profanity filter
    const profanityList = [
      'badword1', 'badword2', 'badword3' // Add your profanity list here
    ];
    
    const lowerContent = content.toLowerCase();
    const hasProfanity = profanityList.some(word => lowerContent.includes(word));
    
    if (hasProfanity) {
      await snap.ref.delete();
      console.log(`Comment ${context.params.commentId} deleted due to profanity`);
      return;
    }
    
    // Check for spam in comments
    const recentComments = await db.collection('comments')
      .where('content', '==', content)
      .where('timestamp', '>', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .get();
    
    if (recentComments.size > 3) {
      await snap.ref.delete();
      console.log(`Comment ${context.params.commentId} deleted due to spam`);
      return;
    }
    
    console.log(`Comment ${context.params.commentId} passed moderation`);
  });

// AI validation function (placeholder)
async function validateThoughtWithAI(content: string): Promise<boolean> {
  // This is a placeholder for AI integration
  // You can integrate with OpenAI, Google AI, or other services
  
  // For now, we'll do basic validation
  const minLength = 10;
  const maxLength = 1000;
  
  if (content.length < minLength || content.length > maxLength) {
    return false;
  }
  
  // Check for common spam patterns
  const spamPatterns = [
    /buy now/i,
    /click here/i,
    /free money/i,
    /make money fast/i
  ];
  
  const hasSpamPattern = spamPatterns.some(pattern => pattern.test(content));
  if (hasSpamPattern) {
    return false;
  }
  
  // TODO: Add OpenAI integration
  // Example with OpenAI (you'll need to add the OpenAI package):
  /*
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a content moderator. Determine if this is a genuine thought or spam/meme. Respond with 'valid' or 'invalid'."
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 10
    });
    
    return response.choices[0]?.message?.content?.toLowerCase().includes('valid') || false;
  } catch (error) {
    console.error('AI validation error:', error);
    return true; // Allow content if AI validation fails
  }
  */
  
  return true;
} 