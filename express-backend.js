// express-backend.js
// Anonymous Thought-Sharing App Backend

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- Data Storage ---
const DB_FILE = 'db.json';
let db = { users: {}, thoughts: [], comments: [] };

// Load from file if exists
if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    console.error('Failed to load db.json:', e);
  }
}

// Auto-save to file
function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// --- Rate Limiting ---
const rateLimitMap = {};
const POST_INTERVAL_MS = 10 * 1000; // 10 seconds

function canPost(passkey) {
  const now = Date.now();
  if (!rateLimitMap[passkey] || now - rateLimitMap[passkey] > POST_INTERVAL_MS) {
    rateLimitMap[passkey] = now;
    return true;
  }
  return false;
}

// --- Middleware: Auth ---
function requireAuth(req, res, next) {
  const passkey = req.header('Authorization');
  if (!passkey || !db.users[passkey]) {
    return res.status(401).json({ error: 'Invalid or missing passkey' });
  }
  req.user = db.users[passkey];
  req.passkey = passkey;
  next();
}

// --- Endpoints ---

// Register a new user
app.post('/register', (req, res) => {
  const { passkey, username } = req.body;
  if (!passkey || !username) {
    return res.status(400).json({ error: 'passkey and username required' });
  }
  if (db.users[passkey]) {
    return res.status(409).json({ error: 'Passkey already registered' });
  }
  // Prevent duplicate usernames
  if (Object.values(db.users).some(u => u.username === username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  db.users[passkey] = { username };
  saveDB();
  res.json({ success: true });
});

// Post a new thought
app.post('/thoughts', requireAuth, (req, res) => {
  if (!canPost(req.passkey)) {
    return res.status(429).json({ error: 'Rate limit: 1 post per 10 seconds' });
  }
  const { content } = req.body;
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Content required' });
  }
  const thought = {
    id: uuidv4(),
    content: content.trim(),
    username: req.user.username,
    timestamp: new Date().toISOString(),
    comments: [],
  };
  db.thoughts.unshift(thought); // newest first
  saveDB();
  res.json({ success: true, thought });
});

// Get all thoughts
app.get('/thoughts', (req, res) => {
  res.json({ thoughts: db.thoughts });
});

// Optional: Post a comment
app.post('/comments', requireAuth, (req, res) => {
  const { thoughtId, content } = req.body;
  if (!thoughtId || !content) {
    return res.status(400).json({ error: 'thoughtId and content required' });
  }
  const thought = db.thoughts.find(t => t.id === thoughtId);
  if (!thought) {
    return res.status(404).json({ error: 'Thought not found' });
  }
  const comment = {
    id: uuidv4(),
    content: content.trim(),
    username: req.user.username,
    timestamp: new Date().toISOString(),
  };
  thought.comments.push(comment);
  db.comments.push(comment);
  saveDB();
  res.json({ success: true, comment });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Anonymous Thought API running on http://localhost:${PORT}`);
});

// --- End of File --- 