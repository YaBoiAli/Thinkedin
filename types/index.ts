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
}

export interface ThoughtFormData {
  content: string;
  tags?: string[];
}

export interface CommentFormData {
  content: string;
  thoughtId: string;
} 