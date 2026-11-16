export interface Comment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatar: string | null;
}