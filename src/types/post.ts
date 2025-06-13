export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  linkedProductId?: string;
  linkedProduct?: {
    id: string;
    name: string;
    imageUrl: string;
  };
  likes: string[]; // Array of user IDs who liked the post
  dislikes: string[]; // Array of user IDs who disliked the post
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  linkedProductId?: string;
  linkedProduct?: {
    id: string;
    name: string;
    imageUrl: string;
  };
  likes: string[]; // Array of user IDs who liked the comment
  dislikes: string[]; // Array of user IDs who disliked the comment
  parentCommentId?: string; // For nested replies
}

export interface Tag {
  id: string;
  name: string;
  category: 'country' | 'food-type' | 'diet' | 'brand' | 'other';
  usageCount: number;
}

export interface PostFilters {
  tags: string[];
  sortBy: 'recent' | 'popular' | 'trending';
  searchTerm?: string;
}
