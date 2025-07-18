# Thoughtspace

A minimal, anonymous space for sharing thoughts and reflections. Built with Next.js, Tailwind CSS, and Firebase.

## Features

- **Anonymous Posting**: Share thoughts without revealing your identity
- **Random Pseudonyms**: Each post gets a unique, randomly generated pseudonym
- **Nested Comments**: Comment on thoughts with anonymous replies
- **Light/Dark Mode**: Toggle between light and dark themes
- **Real-time Updates**: See new thoughts and comments instantly
- **Content Moderation**: Built-in spam and profanity filtering
- **Responsive Design**: Works beautifully on all devices
- **Ambient Background**: Subtle animated background for a calming experience

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **next-themes** - Dark/light mode support

### Backend
- **Firebase Firestore** - NoSQL database
- **Firebase Cloud Functions** - Serverless backend functions
- **Firebase Hosting** - Static hosting

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thoughtspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Cloud Functions
   - Get your Firebase configuration

4. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Deploy Firebase configuration**
   ```bash
   firebase login
   firebase use your_project_id
   firebase deploy --only firestore:rules,firestore:indexes
   ```

6. **Deploy Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Deploy to Vercel (Frontend)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect Next.js and deploy
   - Add your environment variables in Vercel dashboard

### Deploy to Firebase (Backend)

1. **Deploy Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```

2. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## Project Structure

```
thoughtspace/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── comment-form.tsx   # Comment input form
│   ├── comment-item.tsx   # Individual comment display
│   ├── comment-section.tsx # Comments container
│   ├── thought-card.tsx   # Individual thought display
│   ├── thought-form.tsx   # Thought input form
│   ├── thoughts-list.tsx  # Thoughts container
│   ├── theme-provider.tsx # Theme context provider
│   └── theme-toggle.tsx   # Dark/light mode toggle
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts       # Cloud Functions entry point
│   ├── package.json       # Functions dependencies
│   └── tsconfig.json      # TypeScript config
├── lib/                   # Utility functions
│   ├── firebase.ts        # Firebase configuration
│   ├── firebase-service.ts # Firebase CRUD operations
│   ├── pseudonyms.ts      # Pseudonym generation
│   └── utils.ts           # General utilities
├── types/                 # TypeScript type definitions
│   └── index.ts           # App types
├── firebase.json          # Firebase configuration
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
└── package.json           # Project dependencies
```

## Features in Detail

### Anonymous Posting
- No user accounts required
- Each post gets a random pseudonym (e.g., "Curious Fox", "Wandering Leaf")
- No tracking or personal data collection

### Content Moderation
- Basic profanity filtering
- Spam detection (repeated content)
- Placeholder for AI-powered content validation
- Automatic content removal for violations

### User Experience
- Clean, minimal interface
- Smooth animations and transitions
- Responsive design for all screen sizes
- Accessible keyboard navigation
- Custom scrollbars

### Performance
- Server-side rendering with Next.js
- Optimized images and assets
- Efficient database queries
- Real-time updates without polling

## Customization

### Adding New Pseudonyms
Edit `lib/pseudonyms.ts` to add more adjective-noun combinations.

### Content Moderation
Modify the Cloud Functions in `functions/src/index.ts` to:
- Add more profanity words
- Adjust spam detection rules
- Integrate with AI services for content validation

### Styling
- Customize colors in `tailwind.config.js`
- Modify CSS variables in `app/globals.css`
- Add new animations in the Tailwind config

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Tailwind CSS, and Firebase 