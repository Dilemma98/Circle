export interface Post {
  id: string;
  groupId: string;
  authorId: string;
  content: string;
  media: PostMedia[];
  createdAt: string;
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