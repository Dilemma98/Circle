export interface Post {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  content: string;
  media: PostMedia[];
  createdAt: string;
  commentCount?: number;
}

export type PostMedia =
  | {
      id: string;
      type: "image";
      url: string;
      caption?: string;
    }
  | {
      id: string;
      type: "video";
      url: string;
    };