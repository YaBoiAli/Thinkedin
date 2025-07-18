const adjectives = [
  'Curious', 'Wandering', 'Silent', 'Bright', 'Gentle', 'Mysterious', 'Wise', 'Playful',
  'Serene', 'Bold', 'Quiet', 'Lively', 'Dreamy', 'Clever', 'Peaceful', 'Energetic',
  'Thoughtful', 'Cheerful', 'Calm', 'Creative', 'Friendly', 'Patient', 'Adventurous',
  'Kind', 'Imaginative', 'Warm', 'Inspiring', 'Hopeful', 'Grateful', 'Mindful'
];

const nouns = [
  'Fox', 'Leaf', 'Star', 'River', 'Mountain', 'Ocean', 'Forest', 'Cloud', 'Bird',
  'Flower', 'Tree', 'Moon', 'Sun', 'Wind', 'Rain', 'Snow', 'Fire', 'Earth', 'Sky',
  'Wave', 'Stone', 'Crystal', 'Butterfly', 'Dragonfly', 'Sparrow', 'Rose', 'Lily',
  'Pine', 'Maple', 'Willow', 'Cedar', 'Oak', 'Birch', 'Aspen', 'Juniper'
];

export function generatePseudonym(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective} ${randomNoun}`;
}

export function generateShadowIdentity(): string {
  const adjectives = [
    'Wandering', 'Curious', 'Silent', 'Bright', 'Gentle', 'Mysterious', 'Wise', 'Playful',
    'Serene', 'Bold', 'Quiet', 'Lively', 'Dreamy', 'Clever', 'Peaceful', 'Energetic',
    'Thoughtful', 'Cheerful', 'Calm', 'Creative', 'Friendly', 'Patient', 'Adventurous',
    'Kind', 'Imaginative', 'Warm', 'Inspiring', 'Hopeful', 'Grateful', 'Mindful',
    'Restless', 'Hidden', 'Vivid', 'Shy', 'Brave', 'Gentle', 'Fierce', 'Radiant',
    'Shadowy', 'Eager', 'Quiet', 'Open', 'Reflective', 'Blunt', 'Candid', 'Private',
  ];
  const nouns = [
    'Owl', 'Flame', 'Fox', 'Leaf', 'Star', 'River', 'Mountain', 'Ocean', 'Forest', 'Cloud', 'Bird',
    'Flower', 'Tree', 'Moon', 'Sun', 'Wind', 'Rain', 'Snow', 'Fire', 'Earth', 'Sky',
    'Wave', 'Stone', 'Crystal', 'Butterfly', 'Dragonfly', 'Sparrow', 'Rose', 'Lily',
    'Pine', 'Maple', 'Willow', 'Cedar', 'Oak', 'Birch', 'Aspen', 'Juniper',
    'Flame', 'Shadow', 'Echo', 'Mist', 'Spark', 'Dawn', 'Dusk', 'Spirit', 'Muse',
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
} 