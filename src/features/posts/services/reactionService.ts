import { supabase } from "../../../lib/supabase";

export const LIKE = "like";

export async function getReactionSummary(postId: string, userId: string) {
  const { data, error } = await supabase
    .from("reactions")
    .select("user_id")
    .eq("post_id", postId)
    .eq("type", LIKE);

  if (error) throw error;

  const rows = data ?? [];
  return {
    count: rows.length,
    reacted: rows.some((row) => row.user_id === userId),
  };
}

export async function addReaction(postId: string, userId: string) {
  const { error } = await supabase
    .from("reactions")
    .insert({ post_id: postId, user_id: userId, type: LIKE });

  if (error) throw error;
}

export async function removeReaction(postId: string, userId: string) {
  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId)
    .eq("type", LIKE);

  if (error) throw error;
}