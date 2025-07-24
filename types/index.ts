export interface Thought {
  id: string;
  content: string;
  pseudonym: string;
  timestamp: Date;
  comments: Comment[];
  tags?: string[]; // Add tags for categorization
  reactions?: {
    inspired?: number;
    think?: number;
    relatable?: number;
    following?: number;
  };
  type?: string;
}

export interface Comment {
  id: string;
  content: string;
  pseudonym: string;
  timestamp: Date;
  thoughtId: string;
  uid?: string; // Add uid for permission checks
  parentId?: string; // For nested comments/replies
  replies?: Comment[]; // Child comments
}

export interface ThoughtFormData {
  content: string;
  tags?: string[];
}

export interface CommentFormData {
  content: string;
  thoughtId: string;
} 