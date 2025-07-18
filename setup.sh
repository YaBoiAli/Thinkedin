#!/bin/bash

echo "🚀 Setting up Thoughtspace..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install main dependencies
echo "📦 Installing main dependencies..."
npm install

# Install functions dependencies
echo "📦 Installing Firebase Functions dependencies..."
cd functions && npm install && cd ..

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please edit .env.local with your Firebase configuration"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a Firebase project at https://console.firebase.google.com/"
echo "2. Enable Firestore Database and Cloud Functions"
echo "3. Edit .env.local with your Firebase configuration"
echo "4. Run 'firebase login' and 'firebase use your-project-id'"
echo "5. Deploy Firebase configuration: 'firebase deploy --only firestore:rules,firestore:indexes'"
echo "6. Deploy Cloud Functions: 'firebase deploy --only functions'"
echo "7. Start development server: 'npm run dev'"
echo ""
echo "Happy coding! 🚀" 