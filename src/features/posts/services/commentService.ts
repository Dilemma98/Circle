import { supabase } from "../../../lib/supabase";
import { getAvatarUrl } from "../../../lib/getAvatarUrl";
import type { Comment } from "../types/comment";

const COMMENT_SELECT =
  "id, post_id, content, created_at, author:profiles(display_name, avatar_url)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapComment(row: any): Promise<Comment> {
  return {
    id: row.id,
    postId: row.post_id,
    content: row.content,
    createdAt: row.created_at,
    authorName: row.author?.display_name ?? "Okänd",
    authorAvatar: await getAvatarUrl(row.author?.avatar_url ?? null),
  };
}

export async function getComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return Promise.all((data ?? []).map(mapComment));
}

export async function addComment(
  postId: string,
  authorId: string,
  content: string,
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: authorId, content: content.trim() })
    .select(COMMENT_SELECT)
    .single();

  if (error) throw error;
  return mapComment(data);
}